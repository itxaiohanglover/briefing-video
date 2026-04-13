# Briefing Video 优化计划总结

## 项目概述

**项目名称**: briefing-video - 政务/产业新闻简报短视频自动生成工具
**优化目标**: 从 `input/news.md + images/ → out/video.mp4` 端到端优化
**视频规格**: 30fps, 1080×1920 (9:16 竖屏), 适配视频号/抖音
**配色方案**: 深蓝暗色系 + #e94560 红粉强调色

---

## 已完成的修改 ✅

### 1. 字幕同步问题修复

**问题**: 字幕只在第一场景显示，场景 2-5 无字幕

**根本原因**: `TimedSubtitles` 组件中字幕帧计算错误
```typescript
// 错误：使用绝对帧
const absoluteFrame = frame + sceneStartFrame;
const currentSentenceData = sentences.find(
  (s) => absoluteFrame >= s.start_frame && absoluteFrame < s.end_frame
);

// 正确：使用相对帧（timing.json 中的 start_frame 已经是场景内相对帧）
const currentSentenceData = sentences.find(
  (s) => frame >= s.start_frame && frame < s.end_frame
);
```

**修改文件**:
- `templates/src/components/TimedSubtitles.tsx`

**验证**: 所有 5 个场景字幕正常显示

---

### 2. Scene01 布局问题修复

**问题**: 文字跑到左边挡住图片，图片和文字都在左边

**根本原因**: 使用 `SidePanelImage` 组件，其 `position: absolute` 脱离 flex 布局

**解决方案**: 移除 `SidePanelImage`，改用内联 flex 布局
```typescript
{/* 左侧图片区域 - 45% */}
<div style={{ width: "45%", height: "100%", ... }}>
  <img src={staticFile(`images/${image}`)} ... />
  <div style={{ background: "linear-gradient(to right, ...)" }} />
</div>

{/* 右侧标题区域 - 55% */}
<div style={{ width: "55%", ... }}>
  {/* 标题内容 */}
</div>
```

**修改文件**:
- `templates/src/scenes/Scene01.tsx`

**动画优化**: 移除水平滑动，改为垂直上浮淡入
```typescript
// Before: 水平滑入
const titleX = interpolate(frame, [10, 40], [width * 0.3, 0]);

// After: 垂直上浮
const titleY = interpolate(frame, [10, 35], [20, 0]);
```

---

### 3. 字幕样式统一

**问题**: Scene03 使用 quote 样式字幕，与其他场景不一致

**解决方案**: 移除 `style="quote"` 参数
```typescript
// Before
<TimedSubtitles sentences={timing.sentences} sceneStartFrame={timing.start_frame} style="quote" />

// After
<TimedSubtitles sentences={timing.sentences} sceneStartFrame={timing.start_frame} />
```

**修改文件**:
- `templates/src/scenes/Scene03.tsx`

---

### 4. Scene03 背景网格可见性修复

**问题**: 背景网格几乎不可见

**解决方案**: 提高透明度
```typescript
// Before: 0.03
backgroundImage: `
  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
`

// After: 0.08
backgroundImage: `
  linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
`
```

**修改文件**:
- `templates/src/scenes/Scene03.tsx`

---

### 5. Dashboard 数据重复修复

**问题**: 数据显示 "10%%" 重复符号

**根本原因**: Scene04 数据转换时 `unit` 和 `suffix` 都被赋值为 '%'
```typescript
// Bug 代码
const dataCards = rawMetrics.map((m) => ({
  unit: m.suffix || m.unit,  // unit = '%'
  suffix: m.suffix,           // suffix = '%'
}));
// Rendering: {card.suffix}{card.unit} = "%%"
```

**解决方案**: 移除 unit 字段，只用 suffix
```typescript
const dataCards = rawMetrics.map((m) => ({
  suffix: m.suffix || m.unit,  // 优先 suffix，fallback unit
}));
// Rendering: {card.suffix} = "%"
```

**修改文件**:
- `templates/src/scenes/Scene04.tsx` (line 39)

---

### 6. Scene05 底部红色条移除

**问题**: 结尾场景底部有红色 BREAKING news ticker，不符合结尾氛围

**解决方案**: 删除整个 ticker 部分（约 30 行代码）

**修改文件**:
- `templates/src/scenes/Scene05.tsx`

---

### 7. 中文引号预处理

**问题**: Edge TTS 遇到 U+201C/U+201D（"/"）等字符返回 "No audio was received"

**解决方案**: 在 `generate_audio.py` 中预处理
```python
TTS_CHAR_REPLACEMENTS = {
    "\u201c": "",   # " 左双引号
    "\u201d": "",   # " 右双引号
    "\u2018": "",   # ' 左单引号
    "\u2019": "",   # ' 右单引号
}

def preprocess_text_for_tts(text: str) -> str:
    for char, replacement in TTS_CHAR_REPLACEMENTS.items():
        text = text.replace(char, replacement)
    return text
```

**修改文件**:
- `scripts/generate_audio.py`

---

### 8. 背景音乐默认复制

**问题**: 新项目缺少 background.mp3 导致崩溃

**解决方案**: 从 project2 复制默认 BGM (387KB) 到 templates/public/audio/

**修改文件**:
- `templates/public/audio/background.mp3` (新增)

---

### 9. 配色方案统一

**问题**: 各场景配色不一致

**解决方案**: 重写 `colors.ts` 为深蓝暗色系 + #e94560 强调色
```typescript
export const COLORS = {
  bgIntro: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  bgSubtitle: 'linear-gradient(180deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
  bgDashboard: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)',
  bgOutro: 'linear-gradient(180deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%)',
  accent: '#e94560',
  cardColors: ['#e94560', '#00d9ff', '#f9a825', '#00e676'],
  // ... surface, border, shadow colors
};
```

**修改文件**:
- `templates/src/colors.ts`

---

### 10. README.md 优化

**新增内容**:
- 架构图引用 (`assets/frame.png`)
- Logo 路径更新 (`assets/logo.png`)
- 目录结构说明
- 优化工作流图示

**修改文件**:
- `README.md`

---

### 11. Chrome 可执行文件配置

**问题**: Remotion v4 `REMOTION_CHROME_EXECUTABLE` 环境变量不可靠

**解决方案**: 使用 `Config.setBrowserExecutable()` 在 `remotion.config.ts` 中配置

**修改文件**:
- `remotion.config.ts`

---

## 已规划的优化 📋

### Scene05 结尾动画增强 ✅ 已完成

**目标**: 提升视觉冲击力和品牌记忆点，符合短视频最佳实践

**已实施方案**:

1. **文字 Logo "NEWS DAILY"** ✅
   - 位置：主标题上方
   - 效果：spring 弹性缩放淡入（0-25 帧，0-0.83秒）
   - 样式：42px, bold, #e94560, letter-spacing: 4px
   - 技术：spring 动画（stiffness 120, damping 20）

2. **打字机副标题** ✅
   - 位置：主标题下方
   - 效果：逐字符淡入 + 上浮
   - 时序：40 帧开始（1.33秒），每字符延迟 3 帧
   - 文本：subtitle || "THANKS FOR WATCHING"
   - 技术：split('').map() 渲染每个字符

3. **头像旋转光环** ✅
   - 位置：底部 25%，居中
   - 效果：上下边框旋转（0-360度贯穿全场景）
   - 样式：100px 圆形，3px 边框，#e94560
   - 技术：interpolate(frame, [0, durationInFrames], [0, 360])

4. **3 个 CTA 按钮（点赞/转发/关注）** ✅
   - 位置：底部 12%，横向排列
   - 效果：错位弹入（70 帧开始，delay 0/10/20 帧）
   - 技术：spring 弹性缩放 + 淡入
   - 样式：❤️ 点赞、🔄 转发、➕ 关注
   - 动画参数：stiffness 120, damping 20

**时间轴**:
```
0-0.83s (0-25帧)   : Logo "NEWS DAILY" 弹性缩放淡入
0.83-1.33s (25-40帧) : 主标题弹性缩放淡入
1.33-2s (40-60帧)   : 副标题打字机（逐字符显示）
2-2.33s (60-70帧)   : 装饰元素渐显（光晕、分隔线）
2.33s+ (70帧+)      : 头像光环旋转
2.33-4s (70-120帧)  : 3 个 CTA 按钮错位弹入（点赞→转发→关注）
```

**修改文件**:
- ✅ `templates/src/scenes/Scene05.tsx`
- 实际新增：+120 行（引入 spring 动画系统）

**技术亮点**:
- Spring 动画替换线性插值（更自然）
- 错位弹入形成视觉冲击
- 旋转光环增加动态感
- 打字机效果提升精致感

**符合短视频最佳实践**:
- ✅ 品牌名（NEWS DAILY）
- ✅ 头像旋转光环
- ✅ 三按钮（点赞/转发/关注）
- ✅ 横向错位弹入
- ✅ Spring 动画（stiffness 120, damping 20）
- ✅ 布局居中

---

### 音频控制优化 ✅ 已完成

**目标**: 符合短视频最佳实践（音量 0.28~0.35，前1秒淡入，后1.5秒淡出）

**已实施方案**:

1. **音量调整** ✅
   - 修改前：0.2（Root.tsx 硬编码）
   - 修改后：0.3（BackgroundMusic 默认值）
   - 符合：0.28~0.35 范围 ✅

2. **淡出时间延长** ✅
   - 修改前：1 秒（30 帧）
   - 修改后：1.5 秒（45 帧）
   - 实现：`Math.floor(fps * 1.5)`

3. **淡入时间保持** ✅
   - 1 秒（30 帧）
   - 已符合标准，无需修改

**修改文件**:
- ✅ `templates/src/components/BackgroundMusic.tsx`
  - volume 默认值：0.25 → 0.3
  - fadeOutFrames：fps → Math.floor(fps * 1.5)
- ✅ `templates/src/Root.tsx`
  - 移除 `volume={0.2}` prop

**技术亮点**:
- 音量曲线平滑过渡（0 → 0.3 → 0.3 → 0）
- 单一数据源（BackgroundMusic 默认值）
- 代码更易维护

**符合短视频最佳实践**:
- ✅ 背景音乐音量 0.3（在 0.28~0.35 范围内）
- ✅ 前 1 秒淡入
- ✅ 后 1.5 秒淡出

**详情**: 见 `IMPLEMENTATION_REPORT_Audio_Optimization.md`

---

## 待进一步优化的方向 🔮

### 1. Scene01 开场动画增强

**可能的优化**:
- 标题打字机效果（逐字符显示）
- 使用 spring 动画替代 linear 插值
- 添加场景标题过场

### 2. Scene02-04 场景间过渡

**可能的优化**:
- 场景间过场标题（1.5秒淡入淡出）
- Scene02 性能优化（条件渲染当前图片，避免渲染所有图片 DOM）

### 3. 全局性能优化

**已发现的优化点**:
- Scene03: map() 中创建 interpolators，可使用 useMemo
- 所有场景: 线性插值可改为 spring + easing 提升自然度

### 4. 用户体验优化

**可能的优化**:
- 添加场景配置化支持（Logo、二维码等通过 scenes.json 配置）
- 增加更多预设样式主题
- 支持自定义配色方案

---

## Git 提交历史

已推送 7 个 commits 到远程仓库：

1. 修复字幕同步问题（所有 5 个场景）
2. 修复 Scene01 布局问题
3. 统一字幕样式
4. 修复 Scene03 网格可见性
5. 修复 Dashboard 数据重复
6. 优化 README.md 和配色方案
7. 修复中文引号和背景音乐问题

---

## 技术债务和已知问题 ⚠️

### 性能相关

1. **Scene02 图片渲染**: 当前渲染所有图片 DOM，应改为条件渲染
2. **Scene03 插值器**: 在 map() 中创建，应使用 useMemo 优化
3. **渲染时间**: 部分复杂场景渲染时间较长，可进一步优化

### 用户体验

1. **场景标题**: Scene02-04 缺少场景标题，用户不知道当前是什么内容
2. **配置灵活性**: Logo、二维码等硬编码在组件中，应改为配置化
3. **错误处理**: 缺少对缺失文件（图片、音频）的友好提示

### 代码质量

1. **类型定义**: 部分 any 类型可改进
2. **代码重复**: 部分动画逻辑可抽取为共用 hooks
3. **测试覆盖**: 缺少单元测试和集成测试

---

## 文件清单

### 核心文件
- `templates/src/scenes/Scene01.tsx` - 开场场景（已修复布局）
- `templates/src/scenes/Scene02.tsx` - 图片轮播（待优化性能）
- `templates/src/scenes/Scene03.tsx` - 字幕场景（已修复网格）
- `templates/src/scenes/Scene04.tsx` - 数据仪表板（已修复重复）
- `templates/src/scenes/Scene05.tsx` - 结尾场景（待增强动画）

### 共享组件
- `templates/src/components/TimedSubtitles.tsx` - 字幕组件（已修复同步）
- `templates/src/colors.ts` - 配色方案（已统一）
- `templates/src/types.ts` - 类型定义

### 配置和脚本
- `scripts/generate_audio.py` - TTS 音频生成（已修复中文引号）
- `remotion.config.ts` - Remotion 配置（已修复 Chrome 路径）
- `README.md` - 项目文档（已优化）

### 资源文件
- `templates/public/audio/background.mp3` - 默认背景音乐（已添加）
- `assets/frame.png` - 架构图（已添加）
- `assets/logo.png` - Logo（已添加）

---

## 下一步行动

**立即执行**:
1. 实施 Scene05 增强动画（Logo + 打字机 + 关注按钮）
2. 测试验证动画效果和时序

**近期规划**:
3. Scene01 开场动画增强
4. Scene02 性能优化
5. 场景间过渡标题

**长期目标**:
6. 全局性能优化
7. 用户体验优化
8. 测试覆盖和质量保障

---

## 总结

**已完成**: 11 项修复和优化，涵盖字幕同步、布局、样式、数据、音频、配色、文档等核心问题

**进行中**: Scene05 结尾动画增强（已确认方案，待实施）

**待规划**: 开场动画、性能优化、场景过渡、用户体验提升

**整体进度**: 核心功能已稳定，进入体验优化阶段 🎯
