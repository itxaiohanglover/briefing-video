# 架构设计

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户输入层                            │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ input/news.md│  │   images/    │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      内容解析层 (TypeScript)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           markdown-parser.ts                         │   │
│  │  - AI 智能切分 input/news.md → content/*.md           │   │
│  │  - 解析 Markdown frontmatter + 正文                   │   │
│  │  - 提取数据指标（支持小数如 16.6万）                    │   │
│  │  - 生成 scenes.json                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    音频 + 时间轴生成层 (Python)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          generate_audio.py (Edge TTS)                 │   │
│  │  - 调用 Edge TTS 生成配音                             │   │
│  │  - 输出 public/audio/scene_*.mp3                      │   │
│  │  - 输出 public/audio/timing.json（按句时间轴）          │   │
│  │  - 支持断点续传                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      视频渲染层 (Remotion)                    │
│  ┌────────────────┐  ┌────────────────┐                     │
│  │   Root.tsx      │  │  Scene01~05    │                     │
│  │   TransitionSeries   │  各场景组件     │                     │
│  │   Audio playback│  │  TimedSubtitles│                     │
│  └────────────────┘  └────────────────┘                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Components:                                         │   │
│  │  - BackgroundPhoto (opacity 0.55)                    │   │
│  │  - SidePanelImage (opacity 0.9)                      │   │
│  │  - TimedSubtitles (基于 timing.json 精确同步)          │   │
│  │  - BackgroundMusic (淡入淡出)                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        输出层                                │
│                    out/video.mp4                            │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

```
input/news.md
    │
    ├── AI 智能切分
    │
    ▼
content/01-intro.md ~ 05-outro.md
    │
    ├── YAML frontmatter ────────────┐
    │    scene: intro                 │
    │    image: cover.jpg             │
    │                                 │
    ├── # 标题 ──────────────────────┼──→ scenes.json
    │                                 │    scenes[0]
    ├── 正文段落 ────────────────────┤
    │                                 │
    └── ![alt](img.jpg) ─────────────┘
              │
              ▼
    scenes[0].narration
              │
              ▼
    Edge TTS (edge-tts Python 包)
              │
              ├──→ public/audio/scene_01.mp3
              │
              └──→ public/audio/timing.json
                   (SentenceBoundary 事件 → 按句时间轴)
              │
              ▼
    Root.tsx
    读取 scenes.json + timing.json
    按 scene.type/label 匹配 timing section
    TransitionSeries 渲染各场景
              │
              ▼
    out/video.mp4
```

## 场景组件架构

```
Root.tsx
    │
    ├── 读取 scenes.json + timing.json
    ├── 按 scene.id/type 匹配 timing section
    ├── BackgroundMusic (全局)
    │
    └── TransitionSeries (fade transitions)
        ├── Scene01 (Intro)
        │   ├── SidePanelImage (cover.jpg, opacity 0.9)
        │   └── TimedSubtitles (timing.json 同步)
        │
        ├── Scene02 (Slideshow)
        │   ├── Ken Burns 效果 (interpolate)
        │   ├── 图片轮播 + 说明文字
        │   └── TimedSubtitles
        │
        ├── Scene03 (Subtitle)
        │   ├── 毛玻璃卡片 + NEWS 角标
        │   └── TimedSubtitles
        │
        ├── Scene04 (Dashboard)
        │   ├── 数据卡片 2x2 网格
        │   └── TimedSubtitles
        │
        └── Scene05 (Outro)
            ├── 谢谢观看 + 底部新闻条
            └── TimedSubtitles
```

## 关键设计决策

### 1. 音频驱动时长 + timing.json 精确同步

**问题**：固定时长配置导致音画不同步
**解决**：
- Edge TTS 生成音频时同时获取 SentenceBoundary 事件
- 生成 timing.json 记录每句精确开始/结束帧
- Root.tsx 根据 timing.json 计算场景时长
- TimedSubtitles 组件根据 timing.json 精确显示每句字幕

### 2. 场景匹配（type-based）

**问题**：按数组索引匹配脆弱，增减场景即崩溃
**解决**：Root.tsx 按 `scene.id` 或 `scene.type` 匹配 timing section

### 3. 5 场景模板

| 场景 | 用途 | 时长 |
|------|------|------|
| Intro | 开场钩子 | ~6s |
| Slideshow | 图片展示 | ~12s |
| Subtitle | 文字叙述 | ~8s |
| Dashboard | 数据展示 | ~32s |
| Outro | 结尾 | ~8s |

### 4. 图片 opacity 策略

| 场景 | opacity | 用途 |
|------|---------|------|
| Intro 分屏 | 0.9 | 视觉冲击 |
| 背景 | 0.55 | 氛围营造 |
| Outro | 0.4 | 弱化背景 |

**禁止**：opacity < 0.25、深色遮罩 + 模糊叠加

## 技术选型

| 组件 | 技术 | 理由 |
|------|------|------|
| 视频框架 | Remotion | React + TypeScript，代码即视频 |
| 动画 | Remotion interpolate | 函数式，精确控制，无 CSS transition 冲突 |
| TTS | edge-tts Python 包 | 免费、无需 API Key、自带字幕时间轴 |
| 时间轴 | timing.json (SentenceBoundary) | 精确到帧的按句字幕同步 |
| 构建脚本 | Python + TypeScript | Python 处理 TTS，TypeScript 处理解析 |

## 扩展性

### 添加新场景类型

1. 创建 `templates/src/scenes/Scene06.tsx`
2. 在 `Root.tsx` 中注册到场景映射
3. 更新 `markdown-parser.ts` 支持新类型
4. 更新 `generate_audio.py` 支持新场景音频

### 自定义 TTS 语音

```bash
# 查看可用语音
python -m edge_tts --list-voices

# 设置语音
export EDGE_TTS_VOICE="zh-CN-XiaoxiaoNeural"
```
