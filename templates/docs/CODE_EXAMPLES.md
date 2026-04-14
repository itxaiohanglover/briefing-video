# 代码示例集合

本文档提供 Remotion 项目中常用的代码示例，包括 Sequence 组件使用、YAxis 组件、staticFile() 使用和 Spring 预设选择等内容。

---

## 一、Sequence 组件使用示例

### 1.1 基础用法

Sequence 用于在时间线上安排组件的出现和消失。

```typescript
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { IntroScene } from "./IntroScene";
import { MainScene } from "./MainScene";
import { OutroScene } from "./OutroScene";

export const VideoComposition: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      {/* 场景1: 0-4秒 */}
      <Sequence from={0} durationInFrames={fps * 4}>
        <IntroScene />
      </Sequence>

      {/* 场景2: 4-12秒 */}
      <Sequence from={fps * 4} durationInFrames={fps * 8}>
        <MainScene />
      </Sequence>

      {/* 场景3: 12-16秒 */}
      <Sequence from={fps * 12} durationInFrames={fps * 4}>
        <OutroScene />
      </Sequence>
    </>
  );
};
```

### 1.2 嵌套 Sequence

实现复杂的时序控制：

```typescript
import { Sequence, Series } from "remotion";

export const SlideshowScene: React.FC<{ images: string[] }> = ({ images }) => {
  const { fps } = useVideoConfig();

  return (
    <Sequence from={fps * 4} durationInFrames={fps * 20}>
      {/* 外层 Sequence 控制整个 Slideshow 的时间窗口 */}
      
      {/* 使用 Series 简化连续播放 */}
      <Series>
        {images.map((image, index) => (
          <Series.Sequence key={index} durationInFrames={fps * 5}>
            <ImageSlide image={image} index={index} />
          </Series.Sequence>
        ))}
      </Series>
    </Sequence>
  );
};
```

### 1.3 延迟和布局属性

```typescript
export const StaggeredCards: React.FC<{ items: string[] }> = ({ items }) => {
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {items.map((item, index) => (
        <Sequence 
          key={index}
          from={index * 10}  // 每张卡片延迟 10 帧
          layout="none"      // 不影响 DOM 布局
        >
          <Card item={item} />
        </Sequence>
      ))}
    </div>
  );
};
```

### 1.4 name 属性用于调试

```typescript
<Sequence 
  from={fps * 4} 
  durationInFrames={fps * 8}
  name="Slideshow Scene"  // 在 Remotion Studio 中显示
>
  <Slideshow />
</Sequence>
```

### 1.5 完整的视频场景示例

```typescript
import { Sequence, useVideoConfig } from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { SlideshowScene } from "./scenes/SlideshowScene";
import { SubtitleScene } from "./scenes/SubtitleScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { OutroScene } from "./scenes/OutroScene";

export const VideoEngine: React.FC = () => {
  const { fps } = useVideoConfig();

  // 场景配置
  const scenes = [
    { component: IntroScene, duration: 4 },
    { component: SlideshowScene, duration: 15 },
    { component: SubtitleScene, duration: 12 },
    { component: DashboardScene, duration: 8 },
    { component: OutroScene, duration: 4 },
  ];

  // 计算每个场景的起始帧
  let currentFrame = 0;
  const sceneTimings = scenes.map((scene) => {
    const startFrame = currentFrame;
    currentFrame += scene.duration * fps;
    return { ...scene, startFrame, durationInFrames: scene.duration * fps };
  });

  return (
    <>
      {sceneTimings.map((scene, index) => (
        <Sequence
          key={index}
          from={scene.startFrame}
          durationInFrames={scene.durationInFrames}
          name={scene.component.name}
        >
          <scene.component />
        </Sequence>
      ))}
    </>
  );
};
```

---

## 二、YAxis 组件示例

### 2.1 基础 YAxis 组件

```typescript
import React from "react";

interface YAxisProps {
  min: number;
  max: number;
  height: number;
  labelStyle?: React.CSSProperties;
  tickCount?: number;
  formatLabel?: (value: number) => string;
}

export const YAxis: React.FC<YAxisProps> = ({
  min,
  max,
  height,
  labelStyle,
  tickCount = 5,
  formatLabel = (v) => v.toString(),
}) => {
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const value = min + ((max - min) * (tickCount - 1 - i)) / (tickCount - 1);
    return value;
  });

  return (
    <div style={{ 
      height, 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "space-between",
      paddingRight: 10,
    }}>
      {ticks.map((value, index) => (
        <div 
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            height: 0,
          }}
        >
          <span style={{ 
            fontSize: 12, 
            color: "#666",
            ...labelStyle,
          }}>
            {formatLabel(value)}
          </span>
        </div>
      ))}
    </div>
  );
};
```

### 2.2 带动画的 YAxis

```typescript
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { YAxis } from "./YAxis";

export const AnimatedYAxis: React.FC<YAxisProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Y轴标签依次出现
  const opacity = spring({
    frame,
    fps,
    config: { stiffness: 100, damping: 30 },
  });

  return (
    <div style={{ opacity }}>
      <YAxis {...props} />
    </div>
  );
};
```

### 2.3 在图表中使用 YAxis

```typescript
import { YAxis } from "../components/YAxis";
import { interpolate, useCurrentFrame } from "remotion";

interface BarChartProps {
  data: number[];
  width: number;
  height: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, width, height }) => {
  const frame = useCurrentFrame();
  const min = 0;
  const max = Math.max(...data) * 1.2;

  const yAxisWidth = 60;
  const chartWidth = width - yAxisWidth;

  return (
    <div style={{ display: "flex", width, height }}>
      {/* Y轴 */}
      <YAxis
        min={min}
        max={max}
        height={height}
        tickCount={5}
        formatLabel={(v) => `${v.toFixed(0)}%`}
        labelStyle={{ fontSize: 14, color: "#888" }}
      />
      
      {/* 图表区域 */}
      <div style={{ width: chartWidth, height, display: "flex", gap: 10 }}>
        {data.map((value, index) => {
          const barHeight = interpolate(value, [min, max], [0, height]);
          const animatedHeight = interpolate(
            spring({ frame: frame - index * 5, fps: 30 }),
            [0, 1],
            [0, barHeight]
          );

          return (
            <div
              key={index}
              style={{
                width: chartWidth / data.length - 10,
                height: animatedHeight,
                background: "linear-gradient(180deg, #007AFF, #00C6FF)",
                borderRadius: 4,
                alignSelf: "flex-end",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
```

### 2.4 YAxis 高级配置

```typescript
interface AdvancedYAxisProps extends YAxisProps {
  // 自定义刻度值
  ticks?: number[];
  // 网格线
  showGrid?: boolean;
  gridColor?: string;
  gridDashArray?: string;
  // 单位标签
  unit?: string;
  // 前缀
  prefix?: string;
}

export const AdvancedYAxis: React.FC<AdvancedYAxisProps> = ({
  ticks,
  showGrid = false,
  gridColor = "#E0E0E0",
  gridDashArray = "4,4",
  unit,
  prefix = "",
  ...baseProps
}) => {
  const { min, max, height, tickCount = 5, formatLabel } = baseProps;

  // 使用自定义刻度或自动计算
  const tickValues = ticks || Array.from({ length: tickCount }, (_, i) => {
    return min + ((max - min) * (tickCount - 1 - i)) / (tickCount - 1);
  });

  return (
    <div style={{ position: "relative", height }}>
      {/* 网格线 */}
      {showGrid && tickValues.map((value, index) => {
        const y = interpolate(value, [min, max], [height, 0]);
        return (
          <div
            key={`grid-${index}`}
            style={{
              position: "absolute",
              left: 0,
              top: y,
              width: "100%",
              borderTop: `1px dashed ${gridColor}`,
            }}
          />
        );
      })}

      {/* 刻度标签 */}
      {tickValues.map((value, index) => {
        const y = interpolate(value, [min, max], [height, 0]);
        return (
          <div
            key={`label-${index}`}
            style={{
              position: "absolute",
              right: 10,
              top: y,
              transform: "translateY(-50%)",
            }}
          >
            <span style={{ fontSize: 12, color: "#666" }}>
              {prefix}{formatLabel ? formatLabel(value) : value}{unit}
            </span>
          </div>
        );
      })}
    </div>
  );
};
```

---

## 三、staticFile() 使用示例

### 3.1 基础用法

staticFile 用于引用 `public/` 目录下的静态资源：

```typescript
import { staticFile, useVideoConfig, Img, Audio } from "remotion";

// 正确用法 ✅
export const MyVideo: React.FC = () => {
  return (
    <>
      {/* 图片 */}
      <Img src={staticFile("images/logo.png")} />
      
      {/* 音频 */}
      <Audio src={staticFile("audio/background.mp3")} />
      
      {/* 视频 */}
      <Video src={staticFile("videos/intro.mp4")} />
    </>
  );
};

// 错误用法 ❌
<Img src="/images/logo.png" />          // 相对路径无效
<Img src="./images/logo.png" />         // 相对路径无效
<Img src="C:/project/public/images/logo.png" /> // 绝对路径无效
```

### 3.2 文件结构

```
project/
├── src/
│   └── Video.tsx
├── public/                    <-- staticFile 指向此目录
│   ├── images/
│   │   ├── logo.png
│   │   └── background.jpg
│   ├── audio/
│   │   └── background.mp3
│   └── fonts/
│       └── custom-font.woff2
└── package.json
```

### 3.3 动态资源加载

```typescript
import { staticFile, Img } from "remotion";

interface SlideshowProps {
  images: string[];
}

export const Slideshow: React.FC<SlideshowProps> = ({ images }) => {
  return (
    <div style={{ display: "flex" }}>
      {images.map((image, index) => (
        <Img 
          key={index}
          src={staticFile(`images/${image}`)}
          style={{ width: 300, height: 200, objectFit: "cover" }}
        />
      ))}
    </div>
  );
};

// 使用
<Slideshow images={["slide1.jpg", "slide2.jpg", "slide3.jpg"]} />
```

### 3.4 加载字体文件

```typescript
import { loadFont } from "@remotion/google-fonts/OpenSans";
import { staticFile } from "remotion";

// 方式1: 使用 Google Fonts
const { fontFamily } = loadFont();

// 方式2: 使用本地字体文件
export const loadLocalFont = async () => {
  const fontUrl = staticFile("fonts/CustomFont.woff2");
  const fontFace = new FontFace("CustomFont", `url(${fontUrl})`);
  await fontFace.load();
  document.fonts.add(fontFace);
  return "CustomFont";
};
```

### 3.5 音频同步示例

```typescript
import { Audio, useCurrentFrame, useVideoConfig, staticFile } from "remotion";

export const AudioSyncedVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {/* 背景音乐 */}
      <Audio 
        src={staticFile("audio/background.mp3")}
        volume={0.5}
      />
      
      {/* 根据音频时间轴显示内容 */}
      {frame > fps * 5 && (
        <div>5秒后显示的内容</div>
      )}
    </>
  );
};
```

### 3.6 预加载资源

```typescript
import { prefetch, staticFile } from "remotion";

// 在视频渲染前预加载资源
export const preloadAssets = async () => {
  await prefetch(staticFile("images/large-background.jpg"));
  await prefetch(staticFile("audio/background.mp3"));
};

// 在组件中使用
export const MyVideo: React.FC = () => {
  React.useEffect(() => {
    preloadAssets();
  }, []);
  
  return <Img src={staticFile("images/large-background.jpg")} />;
};
```

---

## 四、Spring 预设选择指南

### 4.1 预设配置定义

```typescript
// config/animation.ts

export const SPRING_CONFIG = {
  // 默认 - 通用场景
  default: {
    stiffness: 120,
    damping: 20,
    mass: 1,
  },

  // 柔和 - 淡入淡出、背景
  gentle: {
    stiffness: 80,
    damping: 25,
    mass: 1.2,
  },

  // 弹跳 - 图标、按钮
  bouncy: {
    stiffness: 180,
    damping: 12,
    mass: 0.8,
  },

  // 平滑 - 位置、尺寸变化
  smooth: {
    stiffness: 100,
    damping: 30,
    mass: 1,
  },
} as const;

export type SpringPreset = keyof typeof SPRING_CONFIG;
```

### 4.2 预设选择决策树

```
选择 Spring 预设
│
├── 需要吸引注意力？
│   ├── 是 → bouncy (弹跳)
│   └── 否 → 继续判断
│
├── 动画元素大小？
│   ├── 小元素（图标、按钮）→ bouncy
│   └── 大元素（面板、背景）→ 继续判断
│
├── 动画类型？
│   ├── 入场（从屏幕外进入）→ default
│   ├── 退出（离开屏幕）→ smooth
│   ├── 状态变化（颜色、尺寸）→ smooth
│   └── 强调（高亮、闪烁）→ bouncy
│
├── 视觉重要性？
│   ├── 主要元素 → default
│   ├── 次要元素 → gentle
│   └── 装饰元素 → gentle
│
└── 时长要求？
    ├── 需要快速完成 → default (更硬的 spring)
    └── 可以慢慢进行 → gentle
```

### 4.3 使用示例

```typescript
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING_CONFIG } from "../config/animation";

// 示例1: 标题入场 - 使用 default
export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: SPRING_CONFIG.default,
  });

  return <h1 style={{ transform: `scale(${scale})` }}>标题</h1>;
};

// 示例2: 背景渐变 - 使用 gentle
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame,
    fps,
    config: SPRING_CONFIG.gentle,
  });

  return <div style={{ opacity }}>背景</div>;
};

// 示例3: 图标点击 - 使用 bouncy
export const Icon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: SPRING_CONFIG.bouncy,
  });

  return <span style={{ transform: `scale(${scale})` }}>🔥</span>;
};

// 示例4: 卡片移动 - 使用 smooth
export const Card: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const translateY = spring({
    frame,
    fps,
    config: SPRING_CONFIG.smooth,
  }) * 100 - 100;

  return <div style={{ transform: `translateY(${translateY}px)` }}>卡片</div>;
};
```

### 4.4 自定义 Spring 配置

当预设不满足需求时，可以自定义配置：

```typescript
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

// 更硬的弹簧 - 快速稳定
const stiffSpring = {
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};

// 更软的弹簧 - 慢慢晃动
const softSpring = {
  stiffness: 50,
  damping: 10,
  mass: 2,
};

// 使用
export const CustomSpring: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const value = spring({
    frame,
    fps,
    config: stiffSpring, // 或 softSpring
  });

  return <div style={{ opacity: value }}>自定义 Spring</div>;
};
```

### 4.5 Spring 调试工具

```typescript
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

interface SpringDebuggerProps {
  config: { stiffness: number; damping: number; mass: number };
  label: string;
}

export const SpringDebugger: React.FC<SpringDebuggerProps> = ({ config, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const value = spring({ frame, fps, config });

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 14, marginBottom: 5 }}>
        {label} (s={config.stiffness}, d={config.damping}, m={config.mass})
      </div>
      <div style={{ 
        height: 10, 
        width: 200, 
        background: "#333",
        borderRadius: 5,
        overflow: "hidden",
      }}>
        <div style={{ 
          height: "100%", 
          width: `${value * 100}%`, 
          background: "#007AFF",
          transition: "width 0.1s",
        }} />
      </div>
      <div style={{ fontSize: 12, color: "#888" }}>
        value: {value.toFixed(3)}
      </div>
    </div>
  );
};
```

---

## 五、综合示例：完整的图表组件

```typescript
import React, { useMemo } from "react";
import { 
  Sequence, 
  spring, 
  useCurrentFrame, 
  useVideoConfig, 
  interpolate 
} from "remotion";
import { YAxis } from "./YAxis";
import { SPRING_CONFIG, ANIMATION_CONFIG } from "../config/animation";

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: ChartData[];
  width: number;
  height: number;
  title?: string;
  startFrame?: number;
}

export const AnimatedBarChart: React.FC<BarChartProps> = ({
  data,
  width,
  height,
  title,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 计算图表范围
  const { min, max } = useMemo(() => {
    const maxValue = Math.max(...data.map((d) => d.value)) * 1.2;
    return { min: 0, max: maxValue };
  }, [data]);

  // 动画值
  const titleOpacity = spring({
    frame: frame - startFrame,
    fps,
    config: SPRING_CONFIG.gentle,
  });

  const yAxisOpacity = spring({
    frame: frame - startFrame - 5,
    fps,
    config: SPRING_CONFIG.gentle,
  });

  return (
    <div style={{ width, height }}>
      {/* 标题 */}
      {title && (
        <div style={{ 
          opacity: titleOpacity,
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
        }}>
          {title}
        </div>
      )}

      <div style={{ display: "flex", height: height - 50 }}>
        {/* Y 轴 */}
        <div style={{ opacity: yAxisOpacity }}>
          <YAxis
            min={min}
            max={max}
            height={height - 50}
            tickCount={5}
            formatLabel={(v) => v.toFixed(0)}
          />
        </div>

        {/* 柱状图 */}
        <div style={{ 
          flex: 1, 
          display: "flex", 
          alignItems: "flex-end",
          gap: 10,
          padding: "0 20px",
        }}>
          {data.map((item, index) => {
            const barStartFrame = startFrame + 10 + index * 5;
            const barProgress = spring({
              frame: frame - barStartFrame,
              fps,
              config: SPRING_CONFIG.smooth,
            });

            const barHeight = interpolate(
              item.value * barProgress,
              [min, max],
              [0, height - 50]
            );

            return (
              <Sequence
                key={index}
                from={barStartFrame}
                name={`Bar: ${item.label}`}
              >
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}>
                  <div style={{
                    width: "100%",
                    height: barHeight,
                    background: item.color,
                    borderRadius: 4,
                  }} />
                  <span style={{ 
                    marginTop: 5, 
                    fontSize: 12,
                    color: "#666",
                  }}>
                    {item.label}
                  </span>
                </div>
              </Sequence>
            );
          })}
        </div>
      </div>
    </div>
  );
};
```

---

**文档更新时间**: 2026-04-14
**相关文档**: [动画改进详解](./ANIMATION_IMPROVEMENTS.md) | [最佳实践总结](./REMOTION_BEST_PRACTICES.md)