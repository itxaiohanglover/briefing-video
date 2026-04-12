#!/usr/bin/env python3
"""
Edge TTS 音频生成脚本
生成 scene_01.mp3 ~ scene_05.mp3 + timing.json（按句字幕时间轴）
+ background.mp3 合成背景音乐（如不存在）
支持断点续传，无需 API Key
"""

import asyncio
import json
import math
import os
import struct
import subprocess
import sys
import wave
from pathlib import Path

import edge_tts

# 配置
DEFAULT_VOICE = "zh-CN-YunxiNeural"
VOICE = os.environ.get("EDGE_TTS_VOICE", DEFAULT_VOICE)
RATE = os.environ.get("EDGE_TTS_RATE", "+0%")
FPS = 30


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


def generate_background_music(output_path: str, duration_sec: float = 120.0):
    """
    生成一段简单的合成背景音乐（柔和和弦 + 缓慢节奏）
    输出为 WAV 然后用 ffmpeg 转为 MP3
    如果 ffmpeg 不可用则跳过
    """
    sample_rate = 44100
    num_samples = int(sample_rate * duration_sec)

    # 和弦进行 (C大调 Am - F - C - G)
    chords = [
        [220.0, 261.63, 329.63],   # Am: A3, C4, E4
        [174.61, 220.0, 261.63],   # F: F3, A3, C4
        [261.63, 329.63, 392.0],   # C: C4, E4, G4
        [196.0, 246.94, 293.66],   # G: G3, B3, D4
    ]

    samples_per_chord = int(sample_rate * 4.0)  # 每个和弦 4 秒
    total_chord_samples = len(chords) * samples_per_chord

    audio_data = []
    for i in range(num_samples):
        # 循环和弦
        chord_idx = (i // samples_per_chord) % len(chords)
        chord = chords[chord_idx]

        # 在和弦内淡入淡出
        pos_in_chord = (i % samples_per_chord) / samples_per_chord
        envelope = min(pos_in_chord * 4, 1.0) * min((1.0 - pos_in_chord) * 4, 1.0)

        # 叠加和弦中的音符
        t = i / sample_rate
        sample = 0.0
        for freq in chord:
            sample += math.sin(2 * math.pi * freq * t) * 0.15
            # 加入轻微泛音
            sample += math.sin(2 * math.pi * freq * 2 * t) * 0.03

        # 全局淡入淡出
        global_env = min(i / (sample_rate * 2), 1.0) * min((num_samples - i) / (sample_rate * 2), 1.0)

        sample = sample * envelope * global_env * 0.5
        audio_data.append(max(-1.0, min(1.0, sample)))

    # 写入 WAV
    wav_path = output_path + ".wav"
    with wave.open(wav_path, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        for s in audio_data:
            wf.writeframes(struct.pack("<h", int(s * 32767)))

    # 用 ffmpeg 转 MP3
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", wav_path, "-b:a", "64k", output_path],
            capture_output=True,
            check=True,
        )
        Path(wav_path).unlink()
        print(f"  背景音乐: {output_path} ({duration_sec:.0f}s)")
    except (subprocess.CalledProcessError, FileNotFoundError):
        # ffmpeg 不可用，保留 WAV
        try:
            Path(output_path).unlink(missing_ok=True)
        except Exception:
            pass
        try:
            Path(wav_path).unlink(missing_ok=True)
        except Exception:
            pass
        print("  背景音乐: 跳过（需要 ffmpeg）")


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

        output_path = audio_dir / f"{scene_id}.mp3"

        # 断点续传：音频已存在时跳过，但仍从 SentenceBoundary 获取 timing
        if output_path.exists():
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

    print(f"\n{'='*50}")
    print(f"成功: {success_count}  跳过: {skip_count}  失败: {fail_count}")
    print(f"timing.json: {timing_path}")
    print(f"总时长: {timing_data['total_duration_sec']}s ({timing_data['total_frames']} 帧)")
    print(f"{'='*50}")

    # 生成背景音乐（如不存在）
    bgm_path = audio_dir / "background.mp3"
    if not bgm_path.exists():
        print("\n生成背景音乐...")
        generate_background_music(str(bgm_path), duration_sec=120.0)

    if fail_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
