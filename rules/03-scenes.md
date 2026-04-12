# Rule: 场景开发规范

## 场景组件结构

```typescript
// 统一接口
interface SceneProps {
  sceneData: SceneData;      // 场景数据
  durationInFrames: number;  // 场景总帧数
  timing?: TimingSection;    // 音频时间轴（可选）
}

// 组件模板
const SceneXX: React.FC<SceneProps> = ({ sceneData, durationInFrames, timing }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* 背景/图片 */}
      {/* 内容 */}

      {/* 字幕 - 使用 timing.json 精确同步 */}
      {timing?.sentences && (
        <TimedSubtitles
          sentences={timing.sentences}
          sceneStartFrame={timing.start_frame}
        />
      )}
    </AbsoluteFill>
  );
};
```

## 场景类型实现

### Scene01 - Intro（开场）

**布局**：分屏（默认）或全屏背景

```tsx
// 分屏模式
<AbsoluteFill>
  {/* 左侧图片 45% */}
  <SidePanelImage
    src={staticFile(`images/${sceneData.image}`)}
    side="left"
    widthPercent={45}
    opacity={0.9}
  />

  {/* 右侧内容 55% */}
  <AbsoluteFill style={{ paddingLeft: '50%' }}>
    <h1>{sceneData.title}</h1>
  </AbsoluteFill>

  <TimedSubtitles ... />
</AbsoluteFill>
```

### Scene02 - Slideshow（图片轮播）

**特点**：多图切换，Ken Burns 动效

```tsx
// 计算当前图片
const imageDuration = durationInFrames / images.length;
const currentIndex = Math.floor(frame / imageDuration);
const currentImage = images[currentIndex % images.length];

// Ken Burns
const scale = 1 + (progress * 0.15);
const translateX = (progress - 0.5) * 30;
```

### Scene03 - Subtitle（字幕段落）

**特点**：毛玻璃背景，NEWS 角标

```tsx
<AbsoluteFill style={{ background: COLORS.gradientBg }}>
  {/* 毛玻璃卡片 */}
  <div style={{
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
  }}>
    {/* NEWS 角标 */}
    <NewsBadge />

    {/* 大字内容 */}
    <p style={{ fontSize: 48 }}>...</p>
  </div>

  <TimedSubtitles ... />
</AbsoluteFill>
```

### Scene04 - Dashboard（数据仪表盘）

**布局**：2x2 数据卡片网格

```tsx
// 2x2 网格
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 20,
}}>
  {metrics.map((metric, i) => (
    <DataCard
      key={i}
      label={metric.label}
      value={metric.value}
      suffix={metric.suffix}
      delay={i * 10}  // 错峰动画
    />
  ))}
</div>
```

### Scene05 - Outro（结尾）

**特点**：居中标题 + 装饰动画

```tsx
<AbsoluteFill>
  {/* 居中内容 */}
  <div style={{ textAlign: 'center' }}>
    <h1>谢谢观看</h1>
    <p>{sceneData.title}</p>
  </div>

  {/* 字幕 */}
  <TimedSubtitles ... />
</AbsoluteFill>
```

## 动画规范

### 入场动画

```tsx
// 淡入 + 缩放
const opacity = interpolate(frame, [0, 30], [0, 1]);
const scale = spring({ frame, fps, config: { damping: 20 } });
```

### Ken Burns 效果

```tsx
const scale = interpolate(frame, [0, duration], [1.05, 1.18], {
  easing: Easing.bezier(0.4, 0.0, 0.2, 1),
});
```

### 数字滚动

```tsx
const currentValue = interpolate(
  frame,
  [delay, delay + fps * 1.2],
  [0, targetValue],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);
```

## 图片使用规范

| 场景 | 类型 | opacity | 说明 |
|------|------|---------|------|
| Intro | SidePanelImage | 0.9 | 分屏，视觉冲击 |
| Slideshow | BackgroundPhoto | 0.55 | 全屏背景，Ken Burns |
| Outro | BackgroundPhoto | 0.4 | 弱化背景 |

**禁止**：
- ❌ opacity < 0.25 + 深色遮罩 + 模糊（图片会消失）
- ❌ zIndex: -1（图片被遮挡）

## 字幕规范

所有场景使用 `TimedSubtitles` 组件，基于 `timing.json` 精确同步：

```tsx
{/* 字幕 - 使用 timing.json 精确同步 */}
{timing?.sentences && (
  <TimedSubtitles
    sentences={timing.sentences}
    sceneStartFrame={timing.start_frame}
  />
)}
```

**关键**：`sentences[].start_frame` 是场景内的相对帧，Remotion 的 `useCurrentFrame()` 在每个 Sequence 中也从 0 开始，所以直接用 `frame` 匹配即可。

### timing.json 结构

```json
{
  "fps": 30,
  "total_frames": 1230,
  "sections": [
    {
      "name": "scene_01",
      "start_frame": 0,
      "end_frame": 195,
      "duration_frames": 195,
      "label": "intro",
      "sentences": [
        { "text": "当2026年的春天...", "start_frame": 0, "end_frame": 95 }
      ]
    }
  ]
}
```

- 由 `scripts/generate_audio.py` 自动生成（通过 Edge TTS 的 SentenceBoundary）
- 每个场景的 sentences 的 start_frame 是**场景内相对帧**，不是绝对帧
- 样式支持 `default`（粉红背景条）、`breaking`（白底红字）、`quote`（暗底蓝条）
