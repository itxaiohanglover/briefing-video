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
mkdir -p input/ content/ images/ public/audio out/
```

### Step 4: 创建示例输入文件

创建 `input/news.md`（用户原始文档）：

```markdown
---
title: 遂宁锂电产业突破千亿产值
source: 四川在线
---

# 遂宁：如何再赴新"锂"想？

当2026年的春天如约而至时，锂电产业领域的一场"寒冬"似乎正迎来回暖迹象...

## 关键数据

- 产业产值：突破1050亿元
- 全国占比：15%
- 企业数量：200家
```

**说明**：用户只需将原始新闻文档放入 `input/` 目录，构建时会自动切分到 `content/`。

### Step 5: 安装依赖

```bash
npm install
```

### Step 6: 提示用户

```
✅ 初始化完成！

使用方式：
1. 【推荐】将原始新闻文档放入 input/news.md
2. 放入图片到 images/ 目录
3. 运行 /briefing-video build 生成视频

AI 会自动将 input/news.md 切分为 content/ 下的 5 个场景。

文件说明：
- input/news.md         - 【放入】原始大段文档
- content/*.md          - 【自动生成】切分后的场景
- images/               - 【放入】配图素材
```

## 初始化后目录结构

```
my-project/
├── input/             # 【放入】原始大段文档
│   └── news.md
├── content/           # 【AI生成】切分后的5场景
│   ├── 01-intro.md
│   ├── 02-slideshow.md
│   ├── 03-subtitle.md
│   ├── 04-dashboard.md
│   └── 05-outro.md
├── images/            # 【放入】配图素材
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
