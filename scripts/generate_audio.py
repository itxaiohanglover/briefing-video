#!/usr/bin/env python3
"""
MiniMax TTS 音频生成脚本
生成 scene_01.mp3 ~ scene_05.mp3
支持断点续传
"""

import os
import sys
import json
import requests
import time
from pathlib import Path

# 配置
MINIMAX_API_KEY = os.environ.get("MINIMAX_API_KEY")
MINIMAX_VOICE_ID = os.environ.get("MINIMAX_VOICE_ID")
API_URL = "https://api.minimax.chat/v1/t2a_v2"


def generate_audio(text: str, output_path: str, voice_id: str = None) -> bool:
    """
    调用 MiniMax API 生成音频
    """
    if not MINIMAX_API_KEY:
        print("❌ 错误：未设置 MINIMAX_API_KEY 环境变量")
        return False

    headers = {
        "Authorization": f"Bearer {MINIMAX_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "speech-01-turbo",
        "text": text,
        "voice_id": voice_id or MINIMAX_VOICE_ID or "female-shaonv",
        "speed": 1.0,
        "vol": 1.0,
        "pitch": 0,
        "audio_sample_rate": 32000,
        "bitrate": 128000,
        "channel": 1
    }

    try:
        print(f"   🎙️  正在生成: {output_path}")
        response = requests.post(API_URL, json=payload, headers=headers, timeout=120)
        response.raise_for_status()

        result = response.json()

        if "data" in result and "audio" in result["data"]:
            # 下载音频文件
            audio_hex = result["data"]["audio"]
            audio_bytes = bytes.fromhex(audio_hex)

            with open(output_path, "wb") as f:
                f.write(audio_bytes)

            print(f"   ✅ 生成成功: {output_path}")
            return True
        else:
            print(f"   ❌ API 返回错误: {result.get('base_resp', {}).get('status_msg', '未知错误')}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"   ❌ 请求失败: {e}")
        return False
    except Exception as e:
        print(f"   ❌ 错误: {e}")
        return False


def main():
    """
    主函数：读取 scenes.json，生成音频
    """
    # 检查 scenes.json
    scenes_path = Path("scenes.json")
    if not scenes_path.exists():
        print("❌ 错误：未找到 scenes.json")
        print("请先运行 Markdown 解析生成 scenes.json")
        sys.exit(1)

    # 读取场景配置
    with open(scenes_path, "r", encoding="utf-8") as f:
        scenes_data = json.load(f)

    scenes = scenes_data.get("scenes", [])

    if not scenes:
        print("❌ 错误：scenes.json 中没有场景数据")
        sys.exit(1)

    # 创建音频输出目录
    audio_dir = Path("public/audio")
    audio_dir.mkdir(parents=True, exist_ok=True)

    print(f"🎬 开始生成音频（共 {len(scenes)} 个场景）\n")

    success_count = 0
    skip_count = 0
    fail_count = 0

    for i, scene in enumerate(scenes, 1):
        scene_id = scene.get("id", f"scene_{i:02d}")
        narration = scene.get("narration", "")

        if not narration:
            print(f"[{i}/{len(scenes)}] ⚠️  {scene_id}: 无旁白文本，跳过")
            continue

        output_path = audio_dir / f"{scene_id}.mp3"

        # 断点续传：如果文件已存在则跳过
        if output_path.exists():
            print(f"[{i}/{len(scenes)}] ⏭️  {scene_id}: 已存在，跳过")
            skip_count += 1
            continue

        print(f"[{i}/{len(scenes)}] 📄 {scene_id}")
        print(f"   旁白: {narration[:50]}...")

        if generate_audio(narration, str(output_path)):
            success_count += 1
        else:
            fail_count += 1

        # 避免请求过快
        time.sleep(0.5)

    print(f"\n{'='*50}")
    print(f"✅ 成功: {success_count}")
    print(f"⏭️  跳过: {skip_count}")
    print(f"❌ 失败: {fail_count}")
    print(f"{'='*50}")

    if fail_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
