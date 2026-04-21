# Briefing Video 错误分析与优化方案

## 错误 1: `staticFile()` 重复调用

### 错误现象
```
Error: The value "/static-6778e0d6d7ff/audio/background.mp3" is already prefixed
with the static base /static-6778e0d6d7ff. You don't need to call staticFile() on it.
```

### 根本原因
- `Root.tsx` 中调用 `staticFile("audio/background.mp3")`
- 传给 `BackgroundMusic` 组件
- 组件内部再次调用 `staticFile(src)`
- 导致路径被重复添加前缀

### 优化方案

#### 方案 1: 统一在组件内部调用 `staticFile()`（推荐）

**修改前**：
```tsx
// Root.tsx
<BackgroundMusic
  src={staticFile("audio/background.mp3")}
  videoDurationInFrames={totalFrames}
/>

// BackgroundMusic.tsx
<Audio src={staticFile(src)} volume={volumeCurve} loop />
```

**修改后**：
```tsx
// Root.tsx - 只传相对路径
<BackgroundMusic
  src="audio/background.mp3"
  videoDurationInFrames={totalFrames}
/>

// BackgroundMusic.tsx - 组件内部统一处理
<Audio src={staticFile(src)} volume={volumeCurve} loop />
```

**优点**：
- 职责清晰：调用者只需传相对路径
- 避免重复：`staticFile()` 只在最终使用处调用一次
- 符合 React 组件封装原则

#### 方案 2: 添加类型约束防止误用

```typescript
// types.ts
export type StaticFilePath = string & { readonly __brand: 'StaticFilePath' };

export const createStaticFilePath = (path: string): StaticFilePath => {
  // 验证路径不以 public/ 或 /static- 开头
  if (path.startsWith('public/') || path.startsWith('/static-')) {
    throw new Error(`Invalid static file path: ${path}. Use relative path without 'public/' prefix.`);
  }
  return path as StaticFilePath;
};

// BackgroundMusic.tsx
interface BackgroundMusicProps {
  src: StaticFilePath;  // 类型约束
  videoDurationInFrames: number;
  volume?: number;
}
```

---

## 错误 2: `barChart` 数据格式错误

### 错误现象
```
TypeError: data.map is not a function
```

### 根本原因
- `BarChart` 组件期望 `data: BarChartData[]` 数组格式
- `scenes.json` 中配置为对象格式：
  ```json
  "barChart": {
    "data": [120, 180, 250, 380, 550],
    "labels": ["2022", "2023", "2024", "2025", "2026"],
    "color": "#e94560"
  }
  ```
- 组件尝试调用 `data.map()` 时失败

### 优化方案

#### 方案 1: 修改配置格式为数组（已采用）

**修改前**：
```json
"barChart": {
  "data": [120, 180, 250, 380, 550],
  "labels": ["2022", "2023", "2024", "2025", "2026"],
  "color": "#e94560"
}
```

**修改后**：
```json
"barChart": [
  { "label": "2022", "value": 120 },
  { "label": "2023", "value": 180 },
  { "label": "2024", "value": 250 },
  { "label": "2025", "value": 380 },
  { "label": "2026", "value": 550, "color": "#e94560" }
]
```

#### 方案 2: 在 ConfigGenerator 中添加数据格式转换

```typescript
// ConfigGenerator.ts
private transformBarChartData(scene: ParsedScene): BarChartData[] | undefined {
  if (!scene.content.barChart) return undefined;

  const chart = scene.content.barChart;

  // 如果已经是数组格式，直接返回
  if (Array.isArray(chart)) {
    return chart;
  }

  // 如果是对象格式，转换为数组
  if (typeof chart === 'object' && 'data' in chart) {
    const { data, labels, color } = chart as any;
    return data.map((value: number, index: number) => ({
      label: labels?.[index] ?? `${index}`,
      value,
      color: color || COLORS.accent,
    }));
  }

  return undefined;
}
```

#### 方案 3: 添加运行时类型验证

```typescript
// validators.ts
import { BarChartData } from '../types';

export function validateBarChartData(data: unknown): BarChartData[] {
  if (!Array.isArray(data)) {
    throw new Error('barChart must be an array of { label, value } objects');
  }

  return data.map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`barChart[${index}] must be an object`);
    }
    if (typeof item.label !== 'string') {
      throw new Error(`barChart[${index}].label must be a string`);
    }
    if (typeof item.value !== 'number') {
      throw new Error(`barChart[${index}].value must be a number`);
    }
    return item as BarChartData;
  });
}

// Scene04.tsx
const validatedBarChart = props.barChart ? validateBarChartData(props.barChart) : undefined;
```

---

## 错误 3: 音频文件命名不一致

### 问题现象
- Python 脚本生成 `scene-1.mp3`
- Root.tsx 期望 `scene_01.mp3`
- 需要手动设置环境变量 `BRIEFING_VIDEO_AUDIO_NAMING=legacy-sequence`

### 根本原因
- 新旧工作流命名约定不一致
- 没有统一的命名规范文档

### 优化方案

#### 方案 1: 统一命名规范并文档化

**命名规范**：
```
音频文件: scene_XX.mp3  (两位数字，从 01 开始)
图片文件: 描述性名称.png (如 射洪锂电化工园区-1.png)
配置文件: scenes.json, timing.json
```

**更新 README.md**：
```markdown
## 文件命名规范

### 音频文件
- 格式: `scene_XX.mp3`
- 示例: `scene_01.mp3`, `scene_02.mp3`
- 说明: 两位数字，从 01 开始

### 图片文件
- 格式: 描述性名称.扩展名
- 示例: `射洪锂电化工园区-1.png`
- 说明: 支持中文、英文、数字、连字符

### 配置文件
- `scenes.json`: 场景配置
- `timing.json`: 时间轴配置
- `generated.ts`: 场景注册表
```

#### 方案 2: 在 Python 脚本中默认使用新命名

```python
# generate_audio.py
AUDIO_NAMING = os.environ.get("BRIEFING_VIDEO_AUDIO_NAMING", "legacy-sequence")

def resolve_audio_filename(scene: dict, index: int) -> str:
    scene_id = scene.get("id", f"scene-{index}")
    if AUDIO_NAMING == "legacy-sequence":
        return f"scene_{index:02d}.mp3"
    return f"{scene_id}.mp3"
```

#### 方案 3: 在 TS 包装器中自动设置环境变量

```typescript
// generate-audio.ts
export const buildGenerateAudioInvocation = (
  input: GenerateAudioCliInput,
): GenerateAudioInvocation => {
  return {
    command,
    args: [scriptPath],
    cwd: input.projectDir,
    env: {
      ...process.env,
      BRIEFING_VIDEO_AUDIO_NAMING: 'legacy-sequence',  // 默认使用新命名
    },
  };
};
```

---

## 综合优化建议

### 1. 类型系统增强

```typescript
// types.ts - 添加更严格的类型定义
export interface SceneData {
  id: string;
  type: SceneType;
  enabled: boolean;
  narration: string;

  // 使用联合类型区分不同场景的配置
  image?: string;  // intro, slideshow
  images?: string[];  // slideshow
  content?: string;  // subtitle
  metrics?: MetricData[];  // dashboard
  barChart?: BarChartData[];  // dashboard - 明确数组类型
  // ...
}

// 添加类型守卫
export function isIntroScene(scene: SceneData): scene is IntroSceneData {
  return scene.type === 'intro';
}

export function isDashboardScene(scene: SceneData): scene is DashboardSceneData {
  return scene.type === 'dashboard';
}
```

### 2. 配置验证器

```typescript
// validators/SceneConfigValidator.ts
export class SceneConfigValidator {
  validate(scenes: SceneData[]): ValidationResult {
    const errors: string[] = [];

    scenes.forEach((scene, index) => {
      // 验证 barChart 格式
      if (scene.barChart && !Array.isArray(scene.barChart)) {
        errors.push(`Scene ${index}: barChart must be an array`);
      }

      // 验证图片路径
      if (scene.image && !this.isValidImagePath(scene.image)) {
        errors.push(`Scene ${index}: invalid image path: ${scene.image}`);
      }

      // 验证音频文件命名
      // ...
    });

    return { valid: errors.length === 0, errors };
  }

  private isValidImagePath(path: string): boolean {
    // 不应该包含 public/ 前缀
    return !path.startsWith('public/') && !path.startsWith('/static-');
  }
}
```

### 3. 开发时错误提示

```typescript
// components/BarChart.tsx - 添加友好的错误提示
export const BarChart: React.FC<BarChartProps> = ({ data, height = 200, delay = 0 }) => {
  // 开发时验证
  if (process.env.NODE_ENV === 'development') {
    if (!Array.isArray(data)) {
      console.error(
        'BarChart: data must be an array.\n' +
        `Received: ${typeof data}\n` +
        'Expected format: [{ label: "2022", value: 120 }, ...]'
      );
      return <div style={{ color: 'red' }}>BarChart: Invalid data format</div>;
    }
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  // ...
};
```

### 4. 自动化测试

```typescript
// __tests__/config-validation.test.ts
test('validates barChart format in scenes.json', () => {
  const scenes = JSON.parse(readFileSync('scenes.json', 'utf-8')).scenes;

  scenes.forEach((scene: SceneData) => {
    if (scene.barChart) {
      expect(Array.isArray(scene.barChart)).toBe(true);
      scene.barChart.forEach((item) => {
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('value');
        expect(typeof item.value).toBe('number');
      });
    }
  });
});

test('validates image paths do not have public/ prefix', () => {
  const scenes = JSON.parse(readFileSync('scenes.json', 'utf-8')).scenes;

  scenes.forEach((scene: SceneData) => {
    if (scene.image) {
      expect(scene.image).not.toMatch(/^public\//);
    }
    if (scene.images) {
      scene.images.forEach(img => {
        expect(img).not.toMatch(/^public\//);
      });
    }
  });
});
```

### 5. 文档和示例

创建 `docs/configuration-guide.md`：
- 完整的配置示例
- 常见错误和解决方案
- 类型定义说明
- 最佳实践

---

## 实施优先级

### 高优先级（立即实施）
1. ✅ 修复 `staticFile()` 重复调用问题
2. ✅ 修正 `barChart` 数据格式
3. ✅ 统一音频文件命名

### 中优先级（本周完成）
1. 添加配置验证器
2. 更新类型定义
3. 编写配置文档

### 低优先级（后续迭代）
1. 添加开发时错误提示
2. 完善自动化测试
3. 创建配置示例库
