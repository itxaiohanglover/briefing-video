# Briefing Video Skill

政务/产业新闻简报短视频自动生成 Skill。将 Markdown 格式的新闻文本转换为 60-120 秒专业短视频。

## 核心特性

- **音频优先**：视频时长由 Edge TTS 生成的配音驱动
- **5场景模板**：Intro → Slideshow → Subtitle → Dashboard → Outro
- **精确字幕同步**：基于音频时间轴的字幕显示
- **竖屏优化**：1080×1920，适合视频号/抖音发布

## 快速开始

```bash
# 1. 创建项目
mkdir my-briefing && cd my-briefing

# 2. 初始化（复制模板、安装依赖）
/briefing-video init

# 3. 编辑内容
# - content/01-intro.md        # 开场标题+导语
# - content/02-slideshow.md    # 图片轮播
# - content/03-subtitle.md     # 字幕段落
# - content/04-dashboard.md    # 数据展示（可选）
# - content/05-outro.md        # 结尾
# - images/*.jpg               # 配图

# 4. 生成视频
/briefing-video build
```

## 环境准备

```bash
# 1. Python 依赖（Edge TTS）
pip install edge-tts

# 2. ffprobe（检测音频时长）
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
├── 01-intro.md      # 开场（必须）
├── 02-slideshow.md  # 图片轮播（可选）
├── 03-subtitle.md   # 字幕段落（可选）
├── 04-dashboard.md  # 数据展示（可选）
└── 05-outro.md      # 结尾（必须）
```

### Scene04 数据配置

支持纯数据或数据+产业链流程：

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

## 命令

| 命令 | 说明 |
|------|------|
| `/briefing-video init` | 初始化项目，复制模板 |
| `/briefing-video build` | 完整构建（解析→TTS→渲染） |
| `/briefing-video parse` | 仅解析 Markdown |
| `/briefing-video audio` | 仅生成音频 |
| `/briefing-video render` | 仅渲染视频 |

## 项目结构

```
my-briefing/
├── content/          # 用户编辑
├── images/           # 用户放入
├── scenes.json       # 自动生成
├── public/
│   ├── audio/        # 自动生成（scene_01.mp3 ~ scene_05.mp3）
│   └── images/       # 自动复制
├── src/              # 场景组件
│   ├── scenes/
│   ├── components/
│   └── Root.tsx
└── out/video.mp4     # 最终输出
```

## 最佳实践

1. **图片**：高清横图，建议 1920×1080 以上
2. **文案**：每场景 50-80 字，总字数 ≤ 300 字
3. **数据**：Scene04 支持 2-4 个数据指标
4. **产业链**：可选配置，适合产业报道类内容

## 技术参考

- 基于 [Remotion](https://www.remotion.dev/) 视频引擎
- TTS 使用 [Edge TTS](https://github.com/rany2/edge-tts)（免费，离线可用）
- 音频驱动架构参考：玄清 remotion-video skill
- 图片 opacity：0.55（背景）/ 0.9（分屏）
- 字幕背景透明度：0.20
