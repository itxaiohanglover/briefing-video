# Rule: 项目初始化

## 触发条件

用户在项目目录执行 `/briefing-video init` 或 `/briefing-video`

## 初始化流程

### Step 1: 检查当前目录

```bash
# 检查是否已有项目文件
if (存在 package.json 或 scenes.json):
    询问用户："检测到现有项目，是否重新初始化？"
    if (用户选择否):
        退出
```

### Step 2: 复制模板文件

```
从 ~/.claude/skills/briefing-video/templates/ 复制：
├── package.json
├── tsconfig.json
├── remotion.config.ts
└── src/
    ├── index.ts
    ├── Root.tsx
    ├── types.ts
    ├── colors.ts
    ├── scenes/
    │   ├── Scene01.tsx
    │   ├── Scene02.tsx
    │   ├── Scene03.tsx
    │   ├── Scene04.tsx
    │   └── Scene05.tsx
    └── components/
        ├── index.ts
        ├── TimedSubtitles.tsx
        ├── AudioWaveform.tsx
        ├── BackgroundMusic.tsx
        ├── BackgroundPhoto.tsx
        └── SidePanelImage.tsx
```

### Step 3: 创建用户目录

```bash
mkdir -p content/ images/ public/audio out/
```

### Step 4: 创建示例内容文件

创建 `content/01-intro.md`：
```markdown
---
scene: intro
image: cover.jpg
layout: split
---

# 标题

这里是导语内容...
```

### Step 5: 安装依赖

```bash
npm install
```

### Step 6: 提示用户

```
✅ 初始化完成！

下一步：
1. 编辑 content/*.md 放入你的新闻内容
2. 放入图片到 images/ 目录
3. 运行 /briefing-video build 生成视频

文件说明：
- content/01-intro.md    - 开场场景
- content/02-slideshow.md - 图片轮播
- content/03-subtitle.md  - 字幕段落
- content/04-dashboard.md - 数据展示
- content/05-outro.md     - 结尾
```

## 初始化后目录结构

```
my-project/
├── content/           # 用户编辑
├── images/            # 用户放入
├── public/
│   └── audio/         # 自动生成
├── src/
│   ├── scenes/        # 场景组件
│   ├── components/    # 共享组件
│   ├── Root.tsx
│   └── ...
├── out/               # 输出目录
├── package.json
├── tsconfig.json
└── remotion.config.ts
```
