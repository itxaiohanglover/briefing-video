# Briefing Video

政务/产业新闻简报短视频自动生成工具。将 Markdown 格式的新闻文本转换为 60-120 秒专业短视频，全程无需剪辑软件。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Remotion](https://img.shields.io/badge/Powered%20by-Remotion-orange)](https://www.remotion.dev/)

## 核心特性

- 🎙️ **音频优先**：视频时长由 Edge TTS 生成的配音驱动，音画自动同步
- 📱 **竖屏优化**：1080×1920，适合视频号/抖音/快手发布
- 🎬 **5场景模板**：Intro → Slideshow → Subtitle → Dashboard → Outro
- 📝 **精确字幕**：基于音频时间轴的字幕同步
- 📊 **数据可视化**：支持数据卡片 + 可选产业链流程
- ⚡ **快速生成**：从文本到 MP4，一键完成

## 快速开始

### 环境准备

```bash
# 1. 安装 Python 依赖（Edge TTS）
pip install edge-tts

# 2. 安装 ffmpeg（检测音频时长）
# macOS
brew install ffmpeg

# Ubuntu
sudo apt-get install ffmpeg

# Windows
scoop install ffmpeg
```

### 安装 Skill

```bash
# 复制到 Claude Code skills 目录
cp -r briefing-video ~/.claude/skills/
```

### 创建第一个视频

```bash
# 1. 创建项目目录
mkdir my-briefing && cd my-briefing

# 2. 初始化项目
/briefing-video init

# 3. 编辑内容
# 修改 content/*.md 放入你的新闻文本
# 放入图片到 images/ 目录

# 4. 生成视频
/briefing-video build

# 5. 查看输出
ls out/video.mp4
```

## 内容格式

### Markdown 文件结构

```markdown
---
scene: intro
image: cover.jpg
layout: split
---

# 遂宁锂电产业突破千亿产值

2024年，全市锂电产业产值突破千亿大关...
```

### 文件命名

```
content/
├── 01-intro.md       # 开场（必须）
├── 02-slideshow.md   # 图片轮播（可选）
├── 03-subtitle.md    # 字幕段落（可选）
├── 04-dashboard.md   # 数据展示（可选）
└── 05-outro.md       # 结尾（必须）
```

详细格式说明：[rules/02-content.md](rules/02-content.md)

### Scene04 数据配置示例

```markdown
---
scene: dashboard
---

2024年数据显示：产业产值大幅增长。

```json
{
  "metrics": [
    { "label": "产业产值", "value": 1050, "suffix": "亿元" },
    { "label": "全国占比", "value": 15, "suffix": "%" }
  ],
  "chainNodes": [
    { "id": "mining", "label": "锂矿开采", "icon": "⛏️" },
    { "id": "processing", "label": "加工", "icon": "⚗️" },
    { "id": "battery", "label": "电池", "icon": "🔋" }
  ]
}
```

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

完整工作流：[docs/workflow.md](docs/workflow.md)

## 项目结构

```
my-briefing/
├── content/           # Markdown 内容（用户编辑）
├── images/            # 图片素材（用户放入）
├── scenes.json        # 场景配置（自动生成）
├── public/
│   └── audio/         # TTS 音频（自动生成）
├── src/               # Remotion 代码
│   ├── scenes/        # 5个场景组件
│   ├── components/    # 共享组件
│   └── Root.tsx       # 根组件
├── out/               # 输出视频
└── package.json       # 项目配置
```

## 命令

| 命令 | 说明 |
|------|------|
| `/briefing-video init` | 初始化项目 |
| `/briefing-video build` | 完整构建（解析→TTS→渲染） |
| `/briefing-video parse` | 仅解析 Markdown |
| `/briefing-video audio` | 仅生成音频 |
| `/briefing-video render` | 仅渲染视频 |

## 示例

查看 [examples/lithium-news](examples/lithium-news) 完整示例：

- 遂宁锂电产业报道
- 5 个场景，约 105 秒
- 包含完整 Markdown 文件和图片

## 技术栈

- [Remotion](https://www.remotion.dev/) - React 视频框架
- [Edge TTS](https://github.com/rany2/edge-tts) - 微软 Edge 语音合成（免费，离线可用）
- TypeScript - 类型安全
- Python - 音频处理脚本

## 核心设计

本 Skill 核心设计参考 [玄清 remotion-video skill](https://www.claudemcp.com/2026-02-27-remotion-video-skill-tutorial)：

- 音频驱动时长架构
- 图片 opacity 0.55（背景）/ 0.9（分屏）
- 字幕背景 0.20 透明度
- 按句切分，音频时间轴同步

针对政务/产业新闻场景优化：
- 简洁专业的新闻风格
- 可选产业链可视化
- 一键生成工作流

## 贡献

欢迎提交 Issue 和 PR！

## 许可证

MIT License - 详见 [LICENSE](LICENSE)
