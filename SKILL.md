# Briefing Video Skill

政务/产业新闻简报短视频自动生成 Skill。将 Markdown 格式的新闻文本转换为 60-120 秒专业短视频。

## 核心特性

- **音频优先**：视频时长由 Edge TTS 生成的配音驱动
- **5场景模板**：Intro → Slideshow → Subtitle → Dashboard → Outro
- **精确字幕同步**：基于音频时间轴的字幕显示
- **竖屏优化**：1080×1920，适合视频号/抖音发布

## 使用方法

安装后，输入 `/briefing-video` 开始交互式引导。

## 环境依赖

首次使用需要安装：

```bash
# Python 依赖（Edge TTS）
pip install edge-tts

# ffmpeg（检测音频时长）
brew install ffmpeg    # macOS
apt-get install ffmpeg # Ubuntu
scoop install ffmpeg   # Windows
```

## 内容格式

### Markdown 文件

```markdown
---
scene: intro
image: cover.jpg
layout: split
---

# 遂宁锂电产业突破千亿产值

遂宁锂电产业迎来重大突破...
```

### 文件命名

```
content/
├── 01-intro.md      # 开场
├── 02-slideshow.md  # 图片轮播
├── 03-subtitle.md   # 字幕段落
├── 04-dashboard.md  # 数据展示（可选）
└── 05-outro.md      # 结尾
```

### Scene04 数据配置（可选）

```json
{
  "metrics": [
    { "label": "产业产值", "value": 1050, "suffix": "亿元" }
  ],
  "chainNodes": [
    { "id": "mining", "label": "锂矿开采", "icon": "⛏️" }
  ]
}
```

## 命令

| 命令 | 说明 |
|------|------|
| `/briefing-video init` | 初始化项目 |
| `/briefing-video build` | 完整构建（解析→TTS→渲染） |
| `/briefing-video parse` | 仅解析 Markdown |
| `/briefing-video audio` | 仅生成音频 |
| `/briefing-video render` | 仅渲染视频 |

## 技术栈

- [Remotion](https://www.remotion.dev/) - React 视频框架
- [Edge TTS](https://github.com/rany2/edge-tts) - 微软 Edge 语音合成
- TypeScript / Python
