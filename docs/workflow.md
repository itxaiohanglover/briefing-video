# 完整工作流

## 7 步从 Markdown 到 MP4

```
Step 0: 环境准备
    ↓
Step 1: 脚本规划（Markdown → scenes.json）
    ↓
Step 2: 音频生成（Edge TTS TTS）
    ↓
Step 3: 时长检测（ffprobe）
    ↓
Step 4: 场景组件（Remotion）
    ↓
Step 5: 字幕同步（按句显示）
    ↓
Step 6: 渲染输出（MP4）
```

---

## Step 0: 环境准备

### 安装依赖

```bash
# ffmpeg（ffprobe）
brew install ffmpeg          # macOS
sudo apt-get install ffmpeg  # Ubuntu
choco install ffmpeg         # Windows

# Node.js 依赖（初始化时自动安装）
npm install
```

### 配置 API Key

```bash
# Edge TTS
export MINIMAX_API_KEY="your-api-key"
export MINIMAX_VOICE_ID="your-clone-voice-id"

# 添加到 ~/.bashrc 或 ~/.zshrc 永久生效
echo 'export MINIMAX_API_KEY="xxx"' >> ~/.zshrc
```

获取 Edge TTS API Key：https://www.edge-ttsi.com/

### 声音克隆

1. 访问 https://www.edge-ttsi.com/
2. 上传 20 秒清晰音频样本
3. 等待 1-3 分钟生成 Voice ID
4. 复制 Voice ID 到环境变量

---

## Step 1: 脚本规划

### 输入

```
content/
├── 01-intro.md
├── 02-slideshow.md
├── 03-subtitle.md
├── 04-dashboard.md
└── 05-outro.md
```

### 处理

```typescript
// 解析每个 Markdown 文件
const mdFiles = parseAllMarkdown('content/');

// 提取 frontmatter + 正文
const scenes = mdFiles.map(file => ({
  id: `scene_${file.order}`,
  type: file.frontmatter.scene,
  narration: file.content,
  // ... 其他配置
}));

// 生成 scenes.json
writeFile('scenes.json', JSON.stringify({
  title: '新闻标题',
  scenes
}, null, 2));
```

### 输出

```json
{
  "title": "遂宁锂电产业突破千亿产值",
  "scenes": [
    {
      "id": "scene_01",
      "type": "intro",
      "narration": "2024年，全市锂电产业产值突破千亿大关...",
      "layout": "split",
      "image": "cover.jpg"
    }
    // ...
  ]
}
```

### 字数检查

- 单场景 ≤ 80 字
- 总字数 ≤ 240 字

超过时提示用户精简。

---

## Step 2: 音频生成

### 脚本

```bash
python3 scripts/generate_audio.py
```

### 流程

```python
for scene in scenes:
    # 检查是否已存在
    if os.path.exists(f"public/audio/{scene.id}.mp3"):
        print(f"跳过 {scene.id}（已存在）")
        continue

    # 调用 Edge TTS API
    response = requests.post(
        "https://api.edge-tts.chat/v1/t2a_v2",
        json={
            "model": "speech-01-turbo",
            "text": scene.narration,
            "voice_id": VOICE_ID,
            "speed": 1.0
        }
    )

    # 保存音频
    audio_bytes = bytes.fromhex(response.json()["data"]["audio"])
    with open(f"public/audio/{scene.id}.mp3", "wb") as f:
        f.write(audio_bytes)

    # 避免请求过快
    time.sleep(0.5)
```

### 输出

```
public/audio/
├── scene_01.mp3    # ~6.2s
├── scene_02.mp3    # ~12.8s
├── scene_03.mp3    # ~8.5s
├── scene_04.mp3    # ~32.4s
└── scene_05.mp3    # ~8.1s
```

### 断点续传

已生成的音频文件自动跳过，支持中断后继续。

---

## Step 3: 时长检测

### 脚本

```bash
python3 scripts/detect_durations.py
```

### 流程

```python
for scene in scenes:
    # ffprobe 检测时长
    result = subprocess.run([
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        f"public/audio/{scene.id}.mp3"
    ], capture_output=True)

    duration = float(result.stdout.strip())
    durations[scene.id] = duration
```

### 输出

```typescript
// src/audioConfig.ts
export const audioDurations = {
  "scene_01": 6.2,
  "scene_02": 12.8,
  "scene_03": 8.5,
  "scene_04": 32.4,
  "scene_05": 8.1
};

export const TOTAL_DURATION = 68.0;

export const getSceneDurationInFrames = (sceneId: string) => {
  return Math.ceil(audioDurations[sceneId] * 30); // FPS=30
};

export const getSceneStartFrame = (sceneIndex: number) => {
  // 累加前面所有场景的帧数
  return SCENE_ORDER
    .slice(0, sceneIndex)
    .reduce((sum, id) => sum + getSceneDurationInFrames(id), 0);
};
```

---

## Step 4: 场景组件

### 组件结构

```tsx
// Scene01.tsx
const Scene01: React.FC<SceneProps> = ({ sceneData, durationInFrames }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {/* 音频 */}
      <Audio src={staticFile("audio/scene_01.mp3")} />

      {/* 左侧图片（45%） */}
      <SidePanelImage
        src={staticFile(`images/${sceneData.image}`)}
        side="left"
        widthPercent={45}
        opacity={0.9}
      />

      {/* 右侧标题 */}
      <AbsoluteFill style={{ paddingLeft: '50%' }}>
        <h1>{sceneData.title}</h1>
      </AbsoluteFill>

      {/* 字幕 */}
      <Subtitles
        narration={sceneData.narration}
        durationInFrames={durationInFrames}
      />
    </AbsoluteFill>
  );
};
```

### Root.tsx 组装

```tsx
// 使用 Sequence 隔离每个场景
<AbsoluteFill>
  <Sequence from={0} durationInFrames={186}>
    <Scene01 sceneData={scenes[0]} durationInFrames={186} />
  </Sequence>

  <Sequence from={186} durationInFrames={384}>
    <Scene02 sceneData={scenes[1]} durationInFrames={384} />
  </Sequence>

  {/* ... */}
</AbsoluteFill>
```

---

## Step 5: 字幕同步

### 切分逻辑

```typescript
const splitIntoSentences = (text: string): string[] => {
  return text
    .replace(/([。！？\.\?!]+)/g, "$1|")
    .split("|")
    .map(s => s.trim())
    .filter(s => s.length > 0);
};
```

### 时间分配

```typescript
const Subtitles: React.FC<Props> = ({ narration, durationInFrames }) => {
  const frame = useCurrentFrame();
  const sentences = splitIntoSentences(narration);

  // 每句平均时长
  const framesPerSentence = durationInFrames / sentences.length;

  // 当前显示第几句
  const currentIndex = Math.floor(frame / framesPerSentence);
  const currentSentence = sentences[currentIndex];

  return (
    <div style={{
      position: 'absolute',
      bottom: 80,
      left: 60,
      right: 60,
      textAlign: 'center'
    }}>
      <span style={{
        background: 'rgba(0,0,0,0.20)',
        backdropFilter: 'blur(6px)',
        padding: '12px 28px',
        borderRadius: 8,
        fontSize: 32,
        color: '#fff'
      }}>
        {currentSentence}
      </span>
    </div>
  );
};
```

---

## Step 6: 渲染输出

### 预览调试

```bash
npm run dev
# 访问 http://localhost:3000
```

### 最终渲染

```bash
npx remotion render src/index.ts out/video.mp4
```

### 渲染进度

```
[0:00:00] ░░░░░░░░░░░░░░░░░░░░ 0%
[0:02:30] ████████████░░░░░░░░ 60%
[0:04:15] ████████████████████ 100%
✅ Rendered out/video.mp4 in 4m 15s
```

---

## 完整命令

### 一键构建

```bash
/briefing-video build
```

等效于：
```bash
# Step 1
parseMarkdown()

# Step 2
python3 scripts/generate_audio.py

# Step 3
python3 scripts/detect_durations.py

# Step 4-6
npx remotion render src/index.ts out/video.mp4
```

### 分步执行

```bash
# 仅解析
/briefing-video parse

# 仅生成音频
/briefing-video audio

# 仅渲染（假设音频已生成）
/briefing-video render
```

---

## 故障排查

| 问题 | 检查点 | 解决 |
|------|--------|------|
| 音频生成失败 | MINIMAX_API_KEY | 检查环境变量 |
| ffprobe 失败 | ffmpeg 安装 | `brew install ffmpeg` |
| 音画不同步 | audioConfig.ts | 重新运行 detect_durations.py |
| 图片不显示 | opacity 设置 | 确保 ≥ 0.4 |
| 渲染失败 | 依赖安装 | `npm install` |
