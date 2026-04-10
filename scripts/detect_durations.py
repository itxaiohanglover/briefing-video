#!/usr/bin/env python3
"""
音频时长检测脚本
使用 ffprobe 检测每个 MP3 的实际时长
生成 audioConfig.ts
"""

import os
import sys
import json
import subprocess
from pathlib import Path


def get_audio_duration(audio_path: str) -> float:
    """
    使用 ffprobe 获取音频时长
    """
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                audio_path
            ],
            capture_output=True,
            text=True,
            check=True
        )
        duration = float(result.stdout.strip())
        return duration
    except subprocess.CalledProcessError as e:
        print(f"   ❌ ffprobe 失败: {e}")
        return 0.0
    except FileNotFoundError:
        print("   ❌ 错误：未找到 ffprobe")
        print("   请安装 ffmpeg: brew install ffmpeg (macOS) 或 apt-get install ffmpeg (Ubuntu)")
        return 0.0
    except Exception as e:
        print(f"   ❌ 错误: {e}")
        return 0.0


def generate_audio_config(durations: dict, output_path: str):
    """
    生成 audioConfig.ts 文件
    """
    total_duration = sum(durations.values())

    config_content = f"""// src/audioConfig.ts - 音频时长配置（自动生成，勿手动修改）

export const audioDurations: Record<string, number> = {{
{chr(10).join(f'  "{k}": {v:.1f},' for k, v in durations.items())}
}};

export const TOTAL_DURATION = {total_duration:.1f}; // 秒

export const FPS = 30;

// 获取场景时长（帧）
export const getSceneDurationInFrames = (sceneId: string): number => {{
  return Math.ceil((audioDurations[sceneId] || 0) * FPS);
}};

// 获取场景起始帧（用于Sequence from）
export const getSceneStartFrame = (sceneIndex: number): number => {{
  const keys = Object.keys(audioDurations);
  return keys
    .slice(0, sceneIndex)
    .reduce((sum, key) => sum + getSceneDurationInFrames(key), 0);
}};

// 场景顺序（固定5场景）
export const SCENE_ORDER = [
{chr(10).join(f'  "{k}",' for k in durations.keys())}
];
"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(config_content)

    print(f"   ✅ 已生成: {output_path}")


def main():
    """
    主函数：检测所有音频文件时长
    """
    # 检查 scenes.json
    scenes_path = Path("scenes.json")
    if not scenes_path.exists():
        print("❌ 错误：未找到 scenes.json")
        sys.exit(1)

    with open(scenes_path, "r", encoding="utf-8") as f:
        scenes_data = json.load(f)

    scenes = scenes_data.get("scenes", [])

    if not scenes:
        print("❌ 错误：没有场景数据")
        sys.exit(1)

    audio_dir = Path("public/audio")
    if not audio_dir.exists():
        print("❌ 错误：未找到音频目录 public/audio")
        print("请先运行 generate_audio.py 生成音频")
        sys.exit(1)

    print(f"🔍 开始检测音频时长（共 {len(scenes)} 个场景）\n")

    durations = {}
    total_duration = 0.0

    for i, scene in enumerate(scenes, 1):
        scene_id = scene.get("id", f"scene_{i:02d}")
        audio_path = audio_dir / f"{scene_id}.mp3"

        if not audio_path.exists():
            print(f"[{i}/{len(scenes)}] ⚠️  {scene_id}: 未找到音频文件")
            durations[scene_id] = 0.0
            continue

        print(f"[{i}/{len(scenes)}] 🔍 {scene_id}.mp3", end=" ")

        duration = get_audio_duration(str(audio_path))
        durations[scene_id] = duration
        total_duration += duration

        print(f"→ {duration:.2f}秒")

    print(f"\n{'='*50}")
    print(f"📊 检测结果:")
    for scene_id, duration in durations.items():
        print(f"   {scene_id}: {duration:.2f}秒")
    print(f"   总计: {total_duration:.2f}秒")
    print(f"{'='*50}")

    # 生成 audioConfig.ts
    src_dir = Path("src")
    src_dir.mkdir(exist_ok=True)
    config_path = src_dir / "audioConfig.ts"

    generate_audio_config(durations, str(config_path))

    print(f"\n✅ 时长检测完成！")
    print(f"   配置已保存到: {config_path}")


if __name__ == "__main__":
    main()
