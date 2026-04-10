# Rule: 场景开发规范

## 场景组件结构

```typescript
// 统一接口
interface SceneProps {
  sceneData: SceneData;      // 场景数据
  durationInFrames: number;  // 场景总帧数
}

// 组件模板
const SceneXX: React.FC<SceneProps> = ({ sceneData, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* 音频 */}
      <Audio src={staticFile("audio/scene_XX.mp3")} />

      {/* 背景/图片 */}
      {/* 内容 */}

      {/* 字幕 */}
      <Subtitles
        narration={sceneData.narration}
        durationInFrames={durationInFrames}
      />
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
  <Audio src={staticFile("audio/scene_01.mp3")} />

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

  <Subtitles ... />
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
  <Audio ... />

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

  <Subtitles ... />
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

**特点**：底部新闻条滚动

```tsx
<AbsoluteFill>
  <Audio ... />

  {/* 居中内容 */}
  <div style={{ textAlign: 'center' }}>
    <h1>谢谢观看</h1>
    <p>{sceneData.title}</p>
  </div>

  {/* 底部新闻条 */}
  <NewsTicker />
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

```tsx
<Subtitles
  narration={sceneData.narration}
  durationInFrames={durationInFrames}
  highlightCurrent={true}  // 高亮当前句
/>
```

- 背景透明度：0.20
- 按标点切分：。！？
- 均匀分配：总帧数 / 句子数
