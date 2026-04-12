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

Remotion 默认下载 Chromium（~400MB）。**必须配置本地 Chrome 避免下载**：

```bash
# macOS
export REMOTION_CHROME_EXECUTABLE="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Windows (Git Bash)
export REMOTION_CHROME_EXECUTABLE="C:/Program Files/Google/Chrome/Application/chrome.exe"

# Windows (PowerShell)
$env:REMOTION_CHROME_EXECUTABLE="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

配置后正常运行渲染即可。

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

### 渲染失败（下载 Chromium）

设置本地 Chrome 环境变量 `REMOTION_CHROME_EXECUTABLE`（见上方配置）

### 音画不同步

1. 删除 `public/audio/timing.json`
2. 重新运行 `python3 scripts/generate_audio.py`
3. 重新渲染

### 图片不显示

1. 检查图片是否在 `public/images/` 目录
2. 检查 scenes.json 中的图片文件名是否正确
3. 检查 opacity 是否过低（应 ≥ 0.4）
