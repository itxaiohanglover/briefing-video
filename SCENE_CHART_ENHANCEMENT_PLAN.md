# Scene03 和 Scene04 图表增强方案

## 目标

将简单的数字展示升级为丰富的数据可视化，包括：
- 柱状图（对比数据）
- 曲线图（趋势数据）
- 进度条/步骤条（完成度）
- 环形图/饼图（占比数据）

---

## Scene03（字幕场景）增强方案

### 当前实现
- 纯文字展示（content）
- 高亮文字（highlight）
- 背景网格
- NEWS 角标

### 增强方案

#### 1. 关键词卡片展示
**效果**：提取关键词，以卡片形式展示
**位置**：内容上方或下方
**动画**：逐个卡片淡入

```tsx
// 从 content 中提取关键词（可以是 3-5 个）
const keywords = ["锂电", "增长", "300%", "创新"];

// 渲染为卡片
<div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
  {keywords.map((keyword, i) => {
    const delay = i * 10;
    const opacity = interpolate(frame, [delay, delay + 20], [0, 1]);
    return (
      <div
        key={i}
        style={{
          background: COLORS.accent,
          padding: "8px 20px",
          borderRadius: "20px",
          opacity,
        }}
      >
        {keyword}
      </div>
    );
  })}
</div>
```

#### 2. 时间轴步骤条
**效果**：展示内容的时间线或逻辑流程
**位置**：内容左侧或底部
**动画**：逐步填充

```tsx
// 假设有 3-5 个步骤
const steps = [
  { label: "技术突破", completed: true },
  { label: "产业应用", completed: true },
  { label: "市场验证", completed: false },
];

<div style={{ display: "flex", gap: "16px" }}>
  {steps.map((step, i) => {
    const progress = interpolate(frame, [i * 15, i * 15 + 30], [0, step.completed ? 100 : 0]);
    return (
      <div key={i} style={{ flex: 1 }}>
        <div style={{ marginBottom: "8px", textAlign: "center" }}>
          {step.label}
        </div>
        <div style={{ height: "4px", background: COLORS.surfaceLight }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: COLORS.accent,
            }}
          />
        </div>
      </div>
    );
  })}
</div>
```

#### 3. 数据高亮框
**效果**：将关键数据以醒目框展示
**位置**：内容右侧或插入内容中
**动画**：边框逐步绘制

```tsx
// 假设高亮数据
const highlightData = {
  value: "300%",
  label: "同比增长",
};

<div
  style={{
    border: `3px solid ${COLORS.accent}`,
    padding: "16px 24px",
    borderRadius: "8px",
    background: "rgba(233, 69, 96, 0.1)",
  }}
>
  <div style={{ fontSize: "24px", color: COLORS.textSecondary }}>
    {highlightData.label}
  </div>
  <div style={{ fontSize: "48px", fontWeight: "bold", color: COLORS.accent }}>
    {highlightData.value}
  </div>
</div>
```

---

## Scene04（数据仪表板）增强方案

### 当前实现
- 数据卡片（metrics）
- 数字递增动画
- 可选产业链流程条

### 增强方案

#### 1. 柱状图（对比数据）
**效果**：垂直或水平柱状图，对比多个数据
**位置**：替换部分数据卡片
**动画**：柱子逐步增长

```tsx
// 假设有对比数据
const barData = [
  { label: "2022", value: 45 },
  { label: "2023", value: 72 },
  { label: "2024", value: 120 },
];

<div style={{ display: "flex", gap: "24px", alignItems: "flex-end" }}>
  {barData.map((item, i) => {
    const delay = i * 10;
    const height = interpolate(
      frame,
      [delay, delay + 40],
      [0, item.value],
      { extrapolateRight: "clamp" }
    );
    const opacity = interpolate(frame, [delay, delay + 20], [0, 1]);

    return (
      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: "60%",
            height: `${height * 2}px`,  // 缩放因子
            background: COLORS.cardColors[i % COLORS.cardColors.length],
            borderRadius: "8px 8px 0 0",
            opacity,
            transition: "opacity 0.3s",
          }}
        />
        <div style={{ marginTop: "8px", fontSize: "20px", color: COLORS.textSecondary }}>
          {item.label}
        </div>
        <div style={{ fontSize: "24px", fontWeight: "bold", color: COLORS.textPrimary }}>
          {item.value}
        </div>
      </div>
    );
  })}
</div>
```

#### 2. 曲线图（趋势数据）
**效果**：SVG 折线图，展示数据趋势
**位置**：独立卡片区域
**动画**：线条逐步绘制

```tsx
// 假设有趋势数据
const trendData = [30, 45, 60, 55, 80, 95, 110];
const maxVal = Math.max(...trendData);

// SVG 曲线
<div style={{ width: "100%", height: "200px", position: "relative" }}>
  <svg viewBox="0 0 400 200" style={{ width: "100%", height: "100%" }}>
    {/* Y 轴网格线 */}
    {[0, 1, 2, 3, 4].map((i) => (
      <line
        key={i}
        x1="0" y1={i * 40} x2="400" y2={i * 40}
        stroke={COLORS.borderLight}
        strokeWidth="1"
      />
    ))}

    {/* 曲线路径（逐步绘制） */}
    <path
      d={`M ${trendData.map((val, i) => `${i * 60} ${200 - (val / maxVal) * 180}`).join(" L ")}`}
      stroke={COLORS.accent}
      strokeWidth="4"
      fill="none"
      strokeDasharray="2000"
      strokeDashoffset={interpolate(frame, [0, 60], [2000, 0])}
    />

    {/* 数据点 */}
    {trendData.map((val, i) => {
      const delay = i * 8;
      const opacity = interpolate(frame, [delay, delay + 15], [0, 1]);
      return (
        <circle
          key={i}
          cx={i * 60}
          cy={200 - (val / maxVal) * 180}
          r="6"
          fill={COLORS.accent}
          opacity={opacity}
        />
      );
    })}
  </svg>
</div>
```

#### 3. 环形图（占比数据）
**效果**：圆环图，展示部分占比
**位置**：替换单个数据卡片
**动画**：圆环逐步填充

```tsx
// 假设有占比数据
const gaugeData = {
  value: 75,  // 75%
  label: "市场份额",
};

// 环形进度条
<div style={{ position: "relative", width: "150px", height: "150px" }}>
  <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
    {/* 背景圆环 */}
    <circle
      cx="50" cy="50" r="40"
      stroke={COLORS.surfaceLight}
      strokeWidth="12"
      fill="none"
    />
    {/* 进度圆环 */}
    <circle
      cx="50" cy="50" r="40"
      stroke={COLORS.accent}
      strokeWidth="12"
      fill="none"
      strokeDasharray={`${2 * Math.PI * 40}`}
      strokeDashoffset={2 * Math.PI * 40 * (1 - interpolate(frame, [0, 50], [0, gaugeData.value / 100], { extrapolateRight: "clamp" }) / 100)}
      strokeLinecap="round"
    />
  </svg>
  {/* 中心文字 */}
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: "32px", fontWeight: "bold", color: COLORS.textPrimary }}>
      {gaugeData.value}%
    </div>
    <div style={{ fontSize: "16px", color: COLORS.textSecondary }}>
      {gaugeData.label}
    </div>
  </div>
</div>
```

#### 4. 多维度数据卡片
**效果**：每个数据卡片包含小型图表
**位置**：替换现有数据卡片
**动画**：数字 + 小型图表同步动画

```tsx
// 假设每个 metric 包含历史数据
const metricWithHistory = {
  label: "产量",
  value: 120,
  suffix: "万吨",
  history: [80, 95, 110, 120],  // 趋势数据
};

// 卡片包含迷你曲线图
<div
  style={{
    background: COLORS.surface,
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
  }}
>
  <div style={{ marginBottom: "16px" }}>
    <div style={{ fontSize: "24px", color: COLORS.textSecondary, marginBottom: "8px" }}>
      {metricWithHistory.label}
    </div>
    <div style={{ fontSize: "48px", fontWeight: "bold", color: COLORS.accent }}>
      {metricWithHistory.value}
      <span style={{ fontSize: "24px" }}>{metricWithHistory.suffix}</span>
    </div>
  </div>

  {/* 迷你曲线图 */}
  <svg viewBox="0 0 100 30" style={{ width: "100%", height: "30px" }}>
    <path
      d={`M ${metricWithHistory.history.map((val, i) => `${i * 30} ${30 - (val / Math.max(...metricWithHistory.history)) * 25}`).join(" L ")}`}
      stroke={COLORS.accent}
      strokeWidth="2"
      fill="none"
      opacity="0.6"
    />
  </svg>
</div>
```

---

## 配置化支持

为了让这些图表灵活使用，可以在 `scenes.json` 中添加配置：

```json
{
  "scene3": {
    "content": "...",
    "keywords": ["锂电", "增长", "300%", "创新"],
    "timeline": [
      { "label": "技术突破", "completed": true },
      { "label": "产业应用", "completed": true },
      { "label": "市场验证", "completed": false }
    ],
    "highlightBox": {
      "value": "300%",
      "label": "同比增长"
    }
  },
  "scene4": {
    "metrics": [...],
    "charts": {
      "barChart": {
        "data": [
          { "label": "2022", "value": 45 },
          { "label": "2023", "value": 72 },
          { "label": "2024", "value": 120 }
        ]
      },
      "trendChart": {
        "data": [30, 45, 60, 55, 80, 95, 110]
      },
      "gaugeChart": {
        "value": 75,
        "label": "市场份额"
      }
    }
  }
}
```

---

## 实施优先级

### Scene03（中优先级）
1. ✅ 关键词卡片展示（简单但有效）
2. ✅ 时间轴步骤条（增强逻辑性）
3. ⭕ 数据高亮框（可选）

### Scene04（高优先级）
1. ✅ 柱状图（对比数据）- 视觉冲击力强
2. ✅ 曲线图（趋势数据）- 展示变化
3. ✅ 环形图（占比数据）- 简洁明了
4. ⭕ 多维度数据卡片（结合小型图表）

---

## 技术实现要点

### 1. 使用纯 CSS/SVG
- **优势**: 性能最好，Remotion 渲染快
- **劣势**: 需要自己实现，但代码简单

### 2. 动画使用 interpolate
- **优势**: 与 Remotion 深度集成
- **优势**: 可以精确控制时序

### 3. 避免重量级图表库
- **原因**: Recharts 等库会拖慢渲染
- **替代**: 纯 CSS/SVG 实现

---

## 下一步行动

1. 确认优先实施哪些图表类型
2. 从 Scene04 开始（数据场景更适合图表）
3. 逐步实现并测试
4. 根据效果调整参数

---

**总结**: 使用纯 CSS/SVG 实现图表，性能最佳且灵活度高。优先实施柱状图、曲线图、环形图，让数据展示更丰富。
