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
DEFAULT_VOICE = "zh-CN-YunxiNeural"
VOICE = os.environ.get("EDGE_TTS_VOICE", DEFAULT_VOICE)
RATE = os.environ.get("EDGE_TTS_RATE", "+0%")
FPS = 30
AUDIO_NAMING = os.environ.get("BRIEFING_VIDEO_AUDIO_NAMING", "legacy-sequence")

# 需要从 narration 中移除的字符（会导致 edge-tts 失败）
TTS_CHAR_REPLACEMENTS = {
    "\u201c": "",   # " 左双引号
    "\u201d": "",   # " 右双引号
    "\u2018": "",   # ' 左单引号
    "\u2019": "",   # ' 右单引号
    "\u300a": "《",  # 〈 左书名号 → 《
    "\u300b": "》",  # 〉 右书名号 → 》
}


def preprocess_text_for_tts(text: str) -> str:
    """预处理文本，移除/替换 edge-tts 无法处理的字符"""
    for char, replacement in TTS_CHAR_REPLACEMENTS.items():
        text = text.replace(char, replacement)
    return text


async def generate_scene_audio(
    text: str, output_path: str, voice: str, rate: str
) -> list[dict]:
    """
    生成单个场景的音频，通过 SentenceBoundary 获取精确的每句时间轴
    """
    communicate = edge_tts.Communicate(text, voice, rate=rate)

    sentences = []

    with open(output_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "SentenceBoundary":
                # offset/duration 单位: ticks (100ns)
                # 1 秒 = 10,000,000 ticks
                sentences.append({
                    "text": chunk["text"].strip(),
                    "offset_us": chunk["offset"] // 10,     # ticks → 微秒
                    "duration_us": chunk["duration"] // 10,  # ticks → 微秒
                })

    if not sentences:
        # fallback: 整段作为一句
        file_size = os.path.getsize(output_path)
        est_duration_us = int(file_size * 8 / 128000 * 1_000_000)
        sentences.append({
            "text": text.strip(),
            "offset_us": 0,
            "duration_us": est_duration_us,
        })

    return sentences


def build_timing_json(
    all_timings: dict, scenes_data: dict
) -> dict:
    """合并所有场景的时间轴为 timing.json"""
    sections = []
    current_frame = 0
    total_duration_sec = 0.0

    for scene in scenes_data.get("scenes", []):
        scene_id = scene.get("id", "")
        scene_type = scene.get("type", "unknown")
        timings = all_timings.get(scene_id, [])

        if not timings:
            continue

        # 场景总时长 = 最后一句话结束
        last = timings[-1]
        scene_duration_us = last["offset_us"] + last["duration_us"]
        scene_duration_sec = scene_duration_us / 1_000_000.0
        scene_frames = max(1, round(scene_duration_sec * FPS))

        # 句子时间轴（帧）
        sentence_timings = []
        for s in timings:
            s_start = round(s["offset_us"] / 1_000_000.0 * FPS)
            s_dur = max(1, round(s["duration_us"] / 1_000_000.0 * FPS))
            sentence_timings.append({
                "text": s["text"],
                "start_frame": s_start,
                "end_frame": s_start + s_dur,
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


def resolve_audio_filename(scene: dict, index: int) -> str:
    scene_id = scene.get("id", f"scene-{index}")
    if AUDIO_NAMING == "legacy-sequence":
        return f"scene_{index:02d}.mp3"
    return f"{scene_id}.mp3"


async def main():
    """主函数：读取 scenes.json，生成音频 + timing.json"""
    scenes_path = Path("scenes.json")
    if not scenes_path.exists():
        print("错误：未找到 scenes.json")
        sys.exit(1)

    with open(scenes_path, "r", encoding="utf-8") as f:
        scenes_data = json.load(f)

    scenes = scenes_data.get("scenes", [])
    if not scenes:
        print("错误：scenes.json 中没有场景数据")
        sys.exit(1)

    audio_dir = Path("public/audio")
    audio_dir.mkdir(parents=True, exist_ok=True)

    print(f"开始生成音频（共 {len(scenes)} 个场景）")
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

        # 预处理文本（移除 edge-tts 不兼容的字符）
        narration = preprocess_text_for_tts(narration)

        output_path = audio_dir / resolve_audio_filename(scene, i)

        # 断点续传：音频已存在且非空时跳过，但仍从 SentenceBoundary 获取 timing
        if output_path.exists() and output_path.stat().st_size > 0:
            print(f"[{i}/{len(scenes)}] {scene_id}: 已存在，跳过生成")
            skip_count += 1
            try:
                # 重新生成到临时文件获取 timing
                tmp_path = str(output_path) + ".tmp"
                timings = await generate_scene_audio(narration, tmp_path, VOICE, RATE)
                all_timings[scene_id] = timings
                Path(tmp_path).unlink(missing_ok=True)
            except Exception:
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

    # 检查背景音乐
    bgm_path = audio_dir / "background.mp3"
    if bgm_path.exists():
        print(f"\n背景音乐: {bgm_path} ✓")
    else:
        print(f"\n提示: 未检测到背景音乐 ({bgm_path})")
        print("  如需背景音乐，请将 MP3 文件放置为 public/audio/background.mp3")

    print(f"\n{'='*50}")
    print(f"成功: {success_count}  跳过: {skip_count}  失败: {fail_count}")
    print(f"timing.json: {timing_path}")
    print(f"总时长: {timing_data['total_duration_sec']}s ({timing_data['total_frames']} 帧)")
    print(f"{'='*50}")

    if fail_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
