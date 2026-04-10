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

## 安装

```bash
npx add-skill itxaiohanglover/briefing-video
```

或使用 Claude Code：

```
/briefing-video
```

## 特性

- 🎙️ **音频优先** - Edge TTS 驱动，音画自动同步
- 📱 **竖屏优化** - 1080×1920，适合视频号/抖音/快手
- 🎬 **5场景模板** - Intro → Slideshow → Subtitle → Dashboard → Outro
- 📝 **精确字幕** - 基于音频时间轴的字幕同步
- 📊 **数据可视化** - 支持数据卡片 + 可选产业链流程

## 工作流

```
Markdown + 图片 → scenes.json → TTS → 渲染 → MP4
```

## 命令

| 命令 | 说明 |
|------|------|
| `/briefing-video init` | 初始化项目 |
| `/briefing-video build` | 完整构建 |
| `/briefing-video parse` | 仅解析 Markdown |
| `/briefing-video audio` | 仅生成音频 |
| `/briefing-video render` | 仅渲染视频 |

## 技术栈

- [Remotion](https://www.remotion.dev/) - React 视频框架
- [Edge TTS](https://github.com/rany2/edge-tts) - 微软 Edge 语音合成
- TypeScript / Python

## 许可证

MIT License - 详见 [LICENSE](LICENSE)
