# Briefing Video

<p align="center">
  <b>政务/产业新闻简报短视频自动生成工具</b>
</p>

<p align="center">
  将 Markdown 格式的新闻文本转换为 60-120 秒专业短视频，全程无需剪辑软件。
</p>

<p align="center">
  <a href="https://github.com/itxaiohanglover/briefing-video/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  </a>
  <a href="https://www.remotion.dev/">
    <img src="https://img.shields.io/badge/Powered%20by-Remotion-orange" alt="Powered by Remotion">
  </a>
</p>

## 快速开始

### 安装 Skill

```bash
# 克隆到 Claude Code skills 目录
git clone git@github.com:itxaiohanglover/briefing-video.git ~/.claude/skills/briefing-video
```

### 环境准备

```bash
# Python 依赖（Edge TTS）
pip install edge-tts

# ffmpeg（ffprobe 检测音频时长）
brew install ffmpeg          # macOS
sudo apt-get install ffmpeg  # Ubuntu
scoop install ffmpeg         # Windows
```

### 创建第一个视频

```bash
# 1. 创建项目
mkdir my-briefing && cd my-briefing

# 2. 初始化
/briefing-video init

# 3. 编辑 content/*.md 放入新闻文本
# 4. 放入图片到 images/ 目录

# 5. 生成视频
/briefing-video build

# 6. 查看输出
ls out/video.mp4
```

## 核心特性

| 特性 | 说明 |
|------|------|
| 🎙️ **音频优先** | Edge TTS 驱动，音画自动同步 |
| 📱 **竖屏优化** | 1080×1920，适合视频号/抖音/快手 |
| 🎬 **5场景模板** | Intro → Slideshow → Subtitle → Dashboard → Outro |
| 📝 **精确字幕** | 基于音频时间轴的字幕同步 |
| 📊 **数据可视化** | 支持数据卡片 + 可选产业链流程 |

## 内容格式

```markdown
---
scene: intro
image: cover.jpg
layout: split
---

# 遂宁锂电产业突破千亿产值

2024年，全市锂电产业产值突破千亿大关...
```

完整格式说明：[rules/02-content.md](rules/02-content.md)

## 命令

| 命令 | 说明 |
|------|------|
| `/briefing-video init` | 初始化项目 |
| `/briefing-video build` | 完整构建（解析→TTS→渲染） |
| `/briefing-video parse` | 仅解析 Markdown |
| `/briefing-video audio` | 仅生成音频 |
| `/briefing-video render` | 仅渲染视频 |

## 工作流

```
content/*.md + images/
        ↓
[解析] → scenes.json
        ↓
[TTS] → public/audio/scene_*.mp3（Edge TTS）
        ↓
[检测] → src/audioConfig.ts（ffprobe）
        ↓
[渲染] → out/video.mp4（Remotion）
```

## 技术栈

- [Remotion](https://www.remotion.dev/) - React 视频框架
- [Edge TTS](https://github.com/rany2/edge-tts) - 微软 Edge 语音合成（免费，离线可用）
- TypeScript / Python

## 许可证

MIT License - 详见 [LICENSE](LICENSE)
