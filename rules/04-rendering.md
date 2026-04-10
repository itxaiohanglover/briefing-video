# Rule: 渲染输出规范

## 构建流程

```
/briefing-video build
    │
    ├── Step 1: 解析 Markdown
    │   └── 生成 scenes.json
    │
    ├── Step 2: 生成音频（TTS）
    │   └── python3 scripts/generate_audio.py
    │   └── 输出: public/audio/scene_01.mp3 ~ scene_05.mp3
    │
    ├── Step 3: 检测时长
    │   └── python3 scripts/detect_durations.py
    │   └── 生成: src/audioConfig.ts
    │
    └── Step 4: 渲染视频
        └── npx remotion render src/index.ts NewsVideo out/video.mp4
```

## 命令详解

### /briefing-video parse

仅解析 Markdown，生成 scenes.json：

```bash
# 读取 content/*.md
# 生成 scenes.json
```

### /briefing-video audio

仅生成音频：

```bash
# 读取 scenes.json
# 调用 Edge TTS
# 输出 public/audio/*.mp3
# 支持断点续传（已存在则跳过）
```

### /briefing-video render

仅渲染视频（假设音频已生成）：

```bash
# 检测音频时长
# 生成 audioConfig.ts
# 渲染视频
```

## 渲染配置

### 默认配置

```typescript
// remotion.config.ts
export const config = {
  setDefaults: {
    concurrency: 4,    // 并发数
    quality: 100,      // 质量
  },
};
```

### 视频参数

```typescript
// Root.tsx
<Composition
  id="NewsVideo"
  durationInFrames={TOTAL_FRAMES}  // 自动计算
  fps={30}
  width={1080}   // 竖屏
  height={1920}
/>
```

## 环境要求

### Python 依赖

```bash
pip install edge-tts
```

### FFmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu
apt-get install ffmpeg

# Windows
choco install ffmpeg
```

## 输出文件

```
out/
└── video.mp4          # 最终视频

public/audio/
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
# 可拖拽时间轴查看每帧效果
```

## 常见问题

### 音频生成失败

**现象**：Edge TTS 返回错误
**解决**：
1. 检查 edge-tts 是否安装：`pip install edge-tts`
2. 检查网络连接
3. 查看错误日志

### 渲染失败

**现象**：Remotion 渲染报错
**解决**：
1. 检查 audioConfig.ts 是否生成
2. 检查音频文件是否存在
3. 检查图片文件是否存在

### 音画不同步

**现象**：字幕与音频不一致
**解决**：
1. 重新运行 detect_durations.py
2. 确保音频文件与 scenes.json 匹配
3. 重新渲染

### 图片不显示

**现象**：视频中没有图片
**解决**：
1. 检查 images/ 目录是否存在
2. 检查图片文件名是否正确
3. 检查 opacity 是否过低（应 ≥ 0.4）
