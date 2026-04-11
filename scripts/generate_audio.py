#!/usr/bin/env python3
"""
Edge TTS 音频生成脚本
生成 scene_01.mp3 ~ scene_05.mp3 + timing.json（按句字幕时间轴）
支持断点续传，无需 API Key
"""

import asyncio
import json
import os
import sys
from pathlib import Path

import edge_tts

# 配置
DEFAULT_VOICE = "zh-CN-YunxiNeural"  # 男声新闻主播
VOICE = os.environ.get("EDGE_TTS_VOICE", DEFAULT_VOICE)
RATE = os.environ.get("EDGE_TTS_RATE", "+0%%")  # 语速调整，如 "+20%%"
FPS = 30


async def generate_scene_audio(
    text: str, output_path: str, voice: str, rate: str
) -> list[dict]:
    """
    使用 edge-tts 生成单个场景的音频，返回每句时间轴
    """
    communicate = edge_tts.Communicate(text, voice, rate=rate)

    sentences = []
    current_text = ""
    current_offset_us = None

    with open(output_path, "wb") as audio_file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_file.write(chunk["data"])

            elif chunk["type"] == "WordBoundary":
                # 记录每个词/句的边界
                offset_us = chunk["offset"]  # 微秒
                duration_us = chunk["duration"]  # 微秒
                text_segment = chunk["text"]

                if current_offset_us is None:
                    current_offset_us = offset_us

                # 用标点判断句子结束
                current_text += text_segment
                if text_segment and text_segment[-1] in "。！？.!?；;":
                    sentences.append({
                        "text": current_text.strip(),
                        "offset_us": current_offset_us,
                        "duration_us": offset_us + duration_us - current_offset_us,
                    })
                    current_text = ""
                    current_offset_us = None

    # 处理最后一句（无标点结尾）
    if current_text.strip() and current_offset_us is not None:
        # 获取音频文件大小来估算最后一帧
        file_size = os.path.getsize(output_path)
        # 粗略估算：最后一句话持续到音频结尾
        # 使用上一句的结束作为最后一句话的开始
        last_end_us = sentences[-1]["offset_us"] + sentences[-1]["duration_us"] if sentences else 0
        sentences.append({
            "text": current_text.strip(),
            "offset_us": current_offset_us,
            "duration_us": last_end_us - current_offset_us if last_end_us > current_offset_us else 2000000,
        })

    # 如果 edge-tts 没有返回任何 boundary，整段作为一个句子
    if not sentences:
        sentences.append({
            "text": text.strip(),
            "offset_us": 0,
            "duration_us": 10000000,  # 占位，后续用实际音频时长修正
        })

    return sentences


def build_timing_json(
    all_timings: dict, scenes_data: dict
) -> dict:
    """
    将所有场景的时间轴合并为 timing.json 格式
    匹配 Root.tsx 的 TimingData 接口
    """
    # 场景类型映射（用于 label 字段）
    scene_types = {
        "scene_01": "intro",
        "scene_02": "slideshow",
        "scene_03": "subtitle",
        "scene_04": "dashboard",
        "scene_05": "outro",
    }

    sections = []
    current_frame = 0
    total_duration_sec = 0.0

    for scene in scenes_data.get("scenes", []):
        scene_id = scene.get("id", "")
        scene_type = scene.get("type", scene_types.get(scene_id, "unknown"))
        timings = all_timings.get(scene_id, [])

        if not timings:
            continue

        # 计算场景总时长（微秒 → 秒 → 帧）
        last_sentence = timings[-1]
        scene_duration_us = last_sentence["offset_us"] + last_sentence["duration_us"]
        scene_duration_sec = scene_duration_us / 10_000_000.0
        scene_frames = max(1, round(scene_duration_sec * FPS))

        # 构建句子时间轴
        sentence_timings = []
        for s in timings:
            s_start_frame = round(s["offset_us"] / 10_000_000.0 * FPS)
            s_duration_frames = max(1, round(s["duration_us"] / 10_000_000.0 * FPS))
            sentence_timings.append({
                "text": s["text"],
                "start_frame": s_start_frame,
                "end_frame": s_start_frame + s_duration_frames,
            })

        section = {
            "name": scene_id,
            "start_frame": current_frame,
            "end_frame": current_frame + scene_frames,
            "duration_frames": scene_frames,
            "label": scene_type,
            "sentences": sentence_timings,
        }
        sections.append(section)

        current_frame += scene_frames
        total_duration_sec += scene_duration_sec

    return {
        "fps": FPS,
        "total_frames": current_frame,
        "total_duration_sec": round(total_duration_sec, 2),
        "sections": sections,
    }


async def main():
    """
    主函数：读取 scenes.json，生成音频 + timing.json
    """
    # 检查 scenes.json
    scenes_path = Path("scenes.json")
    if not scenes_path.exists():
        print("错误：未找到 scenes.json")
        print("请先运行 Markdown 解析生成 scenes.json")
        sys.exit(1)

    with open(scenes_path, "r", encoding="utf-8") as f:
        scenes_data = json.load(f)

    scenes = scenes_data.get("scenes", [])
    if not scenes:
        print("错误：scenes.json 中没有场景数据")
        sys.exit(1)

    # 创建音频输出目录
    audio_dir = Path("public/audio")
    audio_dir.mkdir(parents=True, exist_ok=True)

    print(f"开始生成音频（共 {len(scenes)} 个场景）\n")
    print(f"语音: {VOICE}\n")

    all_timings = {}
    success_count = 0
    skip_count = 0
    fail_count = 0

    for i, scene in enumerate(scenes, 1):
        scene_id = scene.get("id", f"scene_{i:02d}")
        narration = scene.get("narration", "")

        if not narration:
            print(f"[{i}/{len(scenes)}] {scene_id}: 无旁白文本，跳过")
            continue

        output_path = audio_dir / f"{scene_id}.mp3"

        # 断点续传：音频已存在时跳过生成，但仍需时间轴
        if output_path.exists():
            print(f"[{i}/{len(scenes)}] {scene_id}: 已存在，跳过生成")
            skip_count += 1

            # 即使跳过生成，仍需重新计算 timing（确保 timing.json 完整）
            try:
                timings = await generate_scene_audio(narration, str(output_path) + ".tmp", VOICE, RATE)
                all_timings[scene_id] = timings
                # 删除临时文件（我们只是需要 timing 数据）
                tmp_path = Path(str(output_path) + ".tmp")
                if tmp_path.exists():
                    tmp_path.unlink()
            except Exception:
                # 如果重新生成失败，使用空的 timing
                all_timings[scene_id] = []
            continue

        print(f"[{i}/{len(scenes)}] {scene_id}")
        print(f"  旁白: {narration[:50]}...")

        try:
            timings = await generate_scene_audio(
                narration, str(output_path), VOICE, RATE
            )
            all_timings[scene_id] = timings
            success_count += 1
            print(f"  完成: {len(timings)} 句")
        except Exception as e:
            print(f"  错误: {e}")
            all_timings[scene_id] = []
            fail_count += 1

    # 生成 timing.json
    timing_data = build_timing_json(all_timings, scenes_data)
    timing_path = audio_dir / "timing.json"

    with open(timing_path, "w", encoding="utf-8") as f:
        json.dump(timing_data, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print(f"成功: {success_count}  跳过: {skip_count}  失败: {fail_count}")
    print(f"timing.json: {timing_path}")
    print(f"总时长: {timing_data['total_duration_sec']}s ({timing_data['total_frames']} 帧)")
    print(f"{'='*50}")

    if fail_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
