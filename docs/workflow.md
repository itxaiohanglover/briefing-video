# 完整工作流

## 3 步从 Markdown 到 MP4

```
Step 1: 内容准备（input/news.md → scenes.json）
    ↓
Step 2: 音频生成（Edge TTS → scene_*.mp3 + timing.json）
    ↓
Step 3: 渲染输出（Remotion → video.mp4）
```

---

## Step 1: 内容准备

### 输入方式

**方式一：AI 智能切分（推荐）**

将原始新闻文档放入 `input/news.md`，构建时 Claude 自动切分。

**方式二：直接编辑**

直接编辑 `content/` 下的场景文件（01-intro.md ~ 05-outro.md）。

### 处理

```typescript
// 解析每个 Markdown 文件
const mdFiles = parseAllMarkdown('content/');

// 提取 frontmatter + 正文
const scenes = mdFiles.map(file => ({
  id: `scene_${file.order}`,
  type: file.frontmatter.scene,
  enabled: file.frontmatter.enabled !== false,
  narration: file.content,
  // ... 其他配置
}));

// 生成 scenes.json
writeFile('scenes.json', JSON.stringify({ title: '新闻标题', scenes }, null, 2));
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
# 使用 edge-tts Python 包（免费，无需 API Key）
# 默认语音：zh-CN-YunxiNeural

for scene in scenes:
    output_path = f"public/audio/{scene.id}.mp3"

    # 断点续传：已存在则跳过音频生成
    if os.path.exists(output_path):
        print(f"跳过 {scene.id}（已存在）")
    else:
        # 调用 Edge TTS 生成音频 + 获取时间轴
        communicate = edge_tts.Communicate(scene.narration, voice, rate=rate)
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "SentenceBoundary":
                # 获取每句精确时间轴
                sentences.append({
                    "text": chunk["text"],
                    "offset_us": chunk["offset"] // 10,
                    "duration_us": chunk["duration"] // 10,
                })

# 生成 timing.json（按句字幕时间轴）
writeFile('public/audio/timing.json', JSON.stringify(timing_data, null, 2))
```

### 输出

```
public/audio/
├── timing.json      # 按句字幕时间轴（自动生成）
├── scene_01.mp3     # ~6.2s
├── scene_02.mp3     # ~12.8s
├── scene_03.mp3     # ~8.5s
├── scene_04.mp3     # ~32.4s
└── scene_05.mp3     # ~8.1s
```

### 断点续传

已生成的音频文件自动跳过，但 timing.json 每次都重新计算（确保一致性）。

---

## Step 3: 渲染输出

### 预检查

渲染前验证：
- `scenes.json` 存在且有 enabled 场景
- `public/audio/timing.json` 存在且 sections 数量匹配
- 所有 `scene_*.mp3` 文件存在
- 所有引用的图片文件存在

### 渲染命令

```bash
# 使用本地 Chrome（避免下载 ~400MB Chromium）
# 已在 remotion.config.ts 中配置 Config.setBrowserExecutable()
npx remotion render src/index.ts NewsVideo out/video.mp4
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
# Step 1: 解析
parseMarkdown()

# Step 2: 音频 + timing.json
python3 scripts/generate_audio.py

# Step 3: 渲染
npx remotion render src/index.ts NewsVideo out/video.mp4
```

### 分步执行

```bash
/briefing-video parse    # 仅解析
/briefing-video audio    # 仅生成音频 + timing.json
/briefing-video render   # 仅渲染
```

---

## 故障排查

| 问题 | 检查点 | 解决 |
|------|--------|------|
| 音频生成失败 | edge-tts 安装 | `pip install edge-tts` |
| 音画不同步 | timing.json | 删除后重新运行 generate_audio.py |
| 图片不显示 | opacity 设置 | 确保 ≥ 0.4 |
| 渲染下载 Chromium | remotion.config.ts | 配置 Config.setBrowserExecutable() 指向本地 Chrome |
| 渲染失败 | 依赖安装 | `npm install` |
