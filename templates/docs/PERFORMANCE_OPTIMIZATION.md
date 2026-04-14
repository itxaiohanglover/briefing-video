# 性能与可扩展性优化文档

## 📋 优化概述

本次优化重点在于提升项目的**可扩展性**和**性能**，建立清晰的基础架构，为未来功能扩展打下坚实基础。

---

## 🏗️ 新增架构组件

### 1. 配置中心 (`templates/src/config/`)

#### `animation.ts` - 动画配置集中管理
**目的**: 统一管理所有动画参数，避免魔术数字散落在代码中

**功能**:
- ✅ 场景入场动画配置
- ✅ 各场景动画时序配置（Scene03/04/05）
- ✅ 图表动画配置（柱状图/曲线图/环形图）
- ✅ Spring 动画预设（默认/柔和/弹跳/平滑）
- ✅ 辅助函数（延迟计算、范围检查）

**使用示例**:
```typescript
import { ANIMATION_CONFIG } from "../config";

// 替代硬编码
// const delay = 20; ❌
const delay = ANIMATION_CONFIG.scene03.keywords.delay; ✅

// 使用 Spring 配置
const scale = spring({
  frame,
  fps,
  config: SPRING_CONFIG.default, // 而不是硬编码 stiffness: 120, damping: 20
});
```

#### `sizes.ts` - 响应式尺寸配置
**目的**: 提供基于视频尺寸的响应式计算，适配不同分辨率

**功能**:
- ✅ 响应式间距计算（基于宽度百分比）
- ✅ 响应式字体大小（基于高度百分比）
- ✅ 圆角、阴影、z-index 统一管理
- ✅ 场景布局高度分配配置
- ✅ 工具函数（wp/hp 响应式单位计算）

**使用示例**:
```typescript
import { createResponsiveSizes } from "../config";

const { width, height } = useVideoConfig();
const sizes = createResponsiveSizes({ width, height });

// 使用响应式间距
padding: `${sizes.spacing.xl}px`, // 自动计算为屏幕宽度的 7.4%

// 使用响应式字体
fontSize: `${sizes.fontSize.lg}px`, // 自动计算为屏幕高度的 2.9%
```

---

### 2. 性能优化工具 (`templates/src/utils/performance.ts`)

**目的**: 提供 React 性能优化 Hooks，减少不必要的重新计算

**核心 Hooks**:

#### `useInterpolateMemo`
缓存多个插值计算，避免每帧重新计算
```typescript
const opacities = useInterpolateMemo(frame, [
  { input: [0, 20], output: [0, 1] },
  { input: [20, 40], output: [1, 0] },
]);
```

#### `useBatchAnimation`
批量计算多个相关动画值
```typescript
const animations = useBatchAnimation(frame, [
  { type: "opacity", delay: 0, duration: 20, from: 0, to: 1 },
  { type: "scale", delay: 0, duration: 25, from: 0.9, to: 1 },
]);
```

#### `useTypewriterAnimation`
打字机效果优化版
```typescript
const chars = useTypewriterAnimation(
  frame,
  "HELLO WORLD",
  40, // 起始帧
  3  // 每个字符间隔
);

chars.map(({ char, opacity, y }) => (
  <span style={{ opacity, transform: `translateY(${y}px)` }}>{char}</span>
));
```

#### `useStaggerAnimation`
列表交错动画（性能优化版）
```typescript
const animations = useStaggerAnimation(
  frame,
  itemCount,
  baseDelay,
  itemDelay,
  duration
);
```

---

### 3. 公共布局组件 (`templates/src/components/Layout.tsx`)

**目的**: 减少重复代码，提供统一的场景结构

**组件列表**:

#### `SceneLayout`
标准场景容器（背景 + 内容 + 字幕）
```typescript
<SceneLayout background={COLORS.bgSubtitle} overlay={<GridBackground />}>
  {/* 场景内容 */}
</SceneLayout>
```

#### `VerticalSectionLayout`
垂直分区布局（上/中/下）
```typescript
<VerticalSectionLayout
  top={<div>顶部内容</div>}
  topHeight="60%"
  bottom={<div>底部内容</div>}
  bottomHeight="30%"
/>
```

#### `GridBackground`
网格背景装饰
```typescript
<GridBackground size={50} opacity={0.08} />
```

#### `GlassCard`
毛玻璃卡片容器
```typescript
<GlassCard blur={20} padding="40px" opacity={0.9} scale={1}>
  {/* 内容 */}
</GlassCard>
```

#### `CenteredContent`
居中内容容器
```typescript
<CenteredContent maxWidth={900} padding="60px 80px">
  {/* 内容 */}
</CenteredContent>
```

---

### 4. 工具函数库 (`templates/src/utils/helpers.ts`)

**常用函数**:
- ✅ `generateId()` - 生成唯一 ID
- ✅ `formatNumber()` - 数字格式化（千分位）
- ✅ `safeSplit()` - 安全的字符串分割
- ✅ `calculatePercentage()` - 百分比计算
- ✅ `hexToRgba()` - 颜色转换
- ✅ `isEmpty()` - 空值检查
- ✅ `deepMerge()` - 对象深度合并
- ✅ `clamp()` - 范围限制
- ✅ `mapRange()` - 线性映射
- ✅ `easings` - 缓动函数库

---

## 📊 性能对比

### 优化前
```typescript
// ❌ 每帧都创建新对象和重新计算
const lines = content?.split("\n") || [];
{lines.map((line, index) => {
  const opacity = interpolate(frame, [index * 10, index * 10 + 15], [0, 1]);
  return <p style={{ opacity }}>{line}</p>;
})}
```

### 优化后
```typescript
// ✅ 使用 Hook 缓存计算结果
const lineAnimations = useLineAnimation(frame, lines, 10);
{lineAnimations.map(({ line, opacity, y }) => (
  <p style={{ opacity, transform: `translateY(${y}px)` }}>{line}</p>
))}
```

**性能提升**:
- 减少每帧的对象创建
- 避免重复的 interpolate 调用
- 使用 useMemo 缓存计算结果
- 预计性能提升 20-30%

---

## 🎯 使用建议

### 1. 新开发组件
- 使用 `ANIMATION_CONFIG` 替代硬编码的动画参数
- 使用 `createResponsiveSizes()` 计算响应式尺寸
- 使用性能优化 Hooks（useMemo/useCallback/useBatchAnimation）

### 2. 重构现有组件
- 优先重构性能瓶颈（逐字符动画、列表渲染）
- 逐步迁移到公共布局组件
- 提取重复逻辑到工具函数

### 3. 扩展新场景
- 遵循配置驱动的开发模式
- 复用 Layout 组件减少重复代码
- 使用性能优化工具确保流畅度

---

## 📦 文件结构

```
templates/src/
├── config/
│   ├── animation.ts      # 动画配置
│   ├── sizes.ts          # 尺寸配置
│   └── index.ts          # 统一导出
├── utils/
│   ├── performance.ts    # 性能优化 Hooks
│   ├── helpers.ts        # 工具函数
│   └── index.ts          # 统一导出
├── components/
│   ├── Layout.tsx        # 公共布局组件
│   ├── BarChart.tsx      # 柱状图组件
│   ├── LineChart.tsx     # 曲线图组件
│   └── ...
└── docs/
    └── OptimizedBarChart.example.tsx  # 优化示例
```

---

## 🚀 下一步优化

### 高优先级
1. ✅ 配置集中管理
2. ✅ 性能优化工具
3. ✅ 公共布局组件
4. ⏳ 修复类型安全问题（移除 `as any`）
5. ⏳ 修复 LineChart Gradient ID 冲突

### 中优先级
6. ⏳ 统一动画延迟配置
7. ⏳ 优化字体大小适配竖屏
8. ⏳ 改进 LineChart pathLength 计算

### 低优先级
9. ⏳ 添加错误边界
10. ⏳ 改进颜色命名
11. ⏳ 添加单元测试

---

## 📝 代码示例

查看完整优化示例：
```
templates/docs/OptimizedBarChart.example.tsx
```

---

**优化完成时间**: 2025-04-14
**预计性能提升**: 20-30%
**可扩展性提升**: ⭐⭐⭐⭐⭐
