# Rule: 渲染输出规范

## 构建流程

```
/briefing-video build
    │
    ├── Step 1: 内容准备
    │   ├── 检测 input/news.md 是否存在
    │   ├── AI 智能切分 → content/*.md（如 input 存在）
    │   └── 解析 content/*.md → scenes.json
    │
    ├── Step 2: 音频生成 + 时间轴
    │   └── python3 scripts/generate_audio.py
    │   └── 输出: public/audio/scene_01.mp3 ~ scene_05.mp3
    │   └── 输出: public/audio/timing.json（按句字幕时间轴）
    │
    └── Step 3: 渲染输出
        ├── 预检查：验证 scenes.json、timing.json、音频、图片
        └── npx remotion render src/index.ts NewsVideo out/video.mp4
```

## 本地 Chrome 配置（重要）

Remotion 默认下载 Chromium（~400MB）。**推荐在 `remotion.config.ts` 中配置本地 Chrome**：

```typescript
// remotion.config.ts
import { Config } from "@remotion/cli/config";

Config.setBrowserExecutable("C:/Program Files/Google/Chrome/Application/chrome.exe");
```

**注意**：环境变量 `REMOTION_CHROME_EXECUTABLE` 在 Remotion v4 中不可靠，必须通过 `remotion.config.ts` 的 `Config.setBrowserExecutable()` 设置。

## 渲染前预检查

渲染前必须验证以下文件存在且有效：

```bash
# 1. scenes.json 存在且有 enabled 场景
test -f scenes.json && cat scenes.json | python3 -c "
import json,sys
s=json.load(sys.stdin)
scenes=[x for x in s.get('scenes',[]) if x.get('enabled',True)]
assert len(scenes)>0, 'No enabled scenes'
print(f'  ✓ scenes.json: {len(scenes)} scenes')
"

# 2. timing.json 存在且 sections 数量匹配
test -f public/audio/timing.json && cat public/audio/timing.json | python3 -c "
import json,sys
t=json.load(sys.stdin)
print(f'  ✓ timing.json: {len(t[\"sections\"])} sections, {t[\"total_duration_sec\"]:.1f}s')
"

# 3. 所有音频文件存在
for i in 01 02 03 04 05; do
  test -f public/audio/scene_${i}.mp3 && echo "  ✓ scene_${i}.mp3"
done

# 4. 引用的图片文件存在
# 从 scenes.json 中提取 images 字段并检查
```

如果任何预检查失败，提示用户重新运行对应步骤（parse 或 audio）。

## 命令详解

### /briefing-video parse

解析 Markdown 生成 scenes.json：

```bash
# AI 智能切分（如 input/news.md 存在）
if (存在 input/news.md):
    读取 input/news.md
    Claude 分析文档结构，提取关键信息
    生成 content/01-intro.md ~ 05-outro.md

# 解析 content/*.md → scenes.json
读取 content/*.md
提取 frontmatter + 正文
生成 scenes.json
```

### AI 切分逻辑

当检测到 `input/news.md` 时，Claude 按以下规则切分：

**Scene 1: Intro（开场）**
- 提取新闻导语：谁、何时、何地、发生了什么
- 字数：30-40 字

**Scene 2: Slideshow（图片轮播）**
- 提取 2-3 个关键事件/地点/成果
- 每段 20-30 字

**Scene 3: Subtitle（字幕段落）**
- 提取产业/背景总结性陈述
- 字数：40-60 字

**Scene 4: Dashboard（数据展示）**
- 提取带数字的关键指标
- 生成 2-4 个数据卡片

**Scene 5: Outro（结尾）**
- 提取未来展望或总结性陈述
- 字数：20-30 字

### /briefing-video audio

生成音频 + timing.json：

```bash
# 读取 scenes.json
# 调用 edge-tts 生成音频
# 输出 public/audio/scene_*.mp3
# 输出 public/audio/timing.json（每句精确时间轴）
# 支持断点续传（已存在则跳过）
```

### /briefing-video render

渲染视频（假设音频已生成）：

```bash
# 预检查 timing.json 和音频文件
# 渲染视频
```

## 环境要求

### Python 依赖

```bash
pip install edge-tts
```

### FFmpeg（可选，用于调试）

```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt-get install ffmpeg

# Windows
scoop install ffmpeg
```

### TTS 语音

默认使用 `zh-CN-YunxiNeural`（男声新闻）。可自定义：

```bash
# 查看可用语音
python -m edge_tts --list-voices

# 设置语音
export EDGE_TTS_VOICE="zh-CN-XiaoxiaoNeural"
```

## 输出文件

```
out/
└── video.mp4          # 最终视频

public/audio/
├── timing.json        # 按句字幕时间轴（自动生成）
├── scene_01.mp3       # 开场音频
├── scene_02.mp3       # 图片轮播音频
├── scene_03.mp3       # 字幕段落音频
├── scene_04.mp3       # 数据仪表盘音频
└── scene_05.mp3       # 结尾音频
```

## 预览调试

```bash
# 启动 Remotion Studio
npm run dev

# 访问 http://localhost:3000
```

## 常见问题

### 音频生成失败

1. 检查 edge-tts 是否安装：`pip install edge-tts`
2. 检查网络连接
3. 查看错误日志

### Edge TTS 中文引号问题

edge-tts 无法处理中文弯引号（`""` `''`），会导致 "No audio was received" 错误。`generate_audio.py` 已内置预处理自动移除这些字符，但如果 JSON 构建时出错，检查 narration 中是否含有：
- `\u201c` / `\u201d` — 中文双引号 `""`
- `\u2018` / `\u2019` — 中文单引号 `''`

### 渲染失败（下载 Chromium）

确认 `remotion.config.ts` 中 `Config.setBrowserExecutable()` 指向正确的 Chrome 路径。

### 音画不同步

1. 删除 `public/audio/timing.json` 和所有 `scene_*.mp3`
2. 重新运行 `python3 scripts/generate_audio.py`
3. 重新渲染

### 图片不显示

1. 检查图片是否在 `public/images/` 目录
2. 检查 scenes.json 中的图片文件名是否正确
3. 检查 opacity 是否过低（应 >= 0.4）

### 背景音乐缺失

`public/audio/background.mp3` 是模板自带的默认背景音乐。如需自定义：
1. 替换 `public/audio/background.mp3` 文件
2. 确认 `scenes.json` 包含 `"backgroundMusic": "audio/background.mp3"` 字段
3. 如果不需要背景音乐，设置 `"backgroundMusic": false` 或删除该字段

### 字幕不显示

字幕依赖 `timing.json` 的 `sentences` 数据：
1. 确认 `public/audio/timing.json` 存在且非空
2. 确认各 section 的 `sentences` 数组有内容
3. `sentences[].start_frame` 是**场景内相对帧**（从 0 开始），不是绝对帧
4. 不要使用 `frame + sceneStartFrame` 做偏移——Remotion 的 Sequence 内 `useCurrentFrame()` 本身从 0 开始

## 注意事项

### 渲染确定性

- **禁止**在组件中使用 `Math.random()` — 每帧渲染结果不同会导致视频闪烁
- **禁止**使用 `new Date()` — 显示的是渲染时间，不是视频播放时间
- **禁止**使用 CSS `transition` — 与 Remotion 的帧动画系统冲突
- 所有动画必须使用 `interpolate()` 或 `spring()` 实现

### 背景音乐

- 背景音乐由 `Root.tsx` 的 `BackgroundMusic` 组件播放
- 开关由 `scenes.json` 的 `backgroundMusic` 字段控制
- **不能**使用 `fs.existsSync` 检测文件（Remotion 运行在浏览器环境中）
- 各场景组件**不要**自行播放音频——音频由 Root.tsx 统一管理
