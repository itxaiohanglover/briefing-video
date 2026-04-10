# Rule: 内容格式规范

## Markdown 文件结构

每个场景对应一个 Markdown 文件，按序号命名：

```
content/
├── 01-intro.md       # 场景1：开场
├── 02-slideshow.md   # 场景2：图片轮播
├── 03-subtitle.md    # 场景3：字幕段落
├── 04-dashboard.md   # 场景4：数据展示
└── 05-outro.md       # 场景5：结尾
```

## 文件格式

```markdown
---
scene: intro          # 场景类型（必选）
image: cover.jpg      # 主图（可选）
layout: split         # 布局（可选，覆盖默认）
---

# 大标题

正文内容，支持多段...

## 小标题（可选）

更多内容...

![图片描述](image.jpg)  # 图片引用
```

## Frontmatter 配置

### 通用配置

| 字段 | 类型 | 说明 |
|------|------|------|
| `scene` | string | 场景类型：intro/slideshow/subtitle/dashboard/outro |
| `enabled` | boolean | 是否启用（默认 true）|

### Intro 场景配置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `image` | string | - | 封面图片 |
| `layout` | string | split | 布局：split/background |
| `imagePosition` | string | left | 图片位置：left/right |
| `imageWidth` | number | 45 | 图片宽度百分比 |
| `imageOpacity` | number | 0.9 | 图片透明度 |

### Slideshow 场景配置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `kenBurns` | boolean | true | Ken Burns 动效 |
| `imageOpacity` | number | 0.55 | 图片透明度 |

### Dashboard 场景配置

| 字段 | 类型 | 说明 |
|------|------|------|
| `metrics` | array | 数据指标（自动从正文提取）|

## 场景类型说明

### intro - 开场

- 用途：视频开头，大标题+导语
- 布局：支持分屏（左侧图片 45%，右侧标题）
- 字数建议：30-40 字

```markdown
---
scene: intro
image: cover.jpg
layout: split
---

# 遂宁锂电产业突破千亿产值

2024年，全市锂电产业产值突破千亿大关...
```

### slideshow - 图片轮播

- 用途：展示多张图片配简短说明
- 支持：Ken Burns 缩放平移动效
- 字数建议：每图 20-30 字

```markdown
---
scene: slideshow
---

射洪锂电化工园区日吞吐量达到500吨。

![射洪园区](photo1.jpg)

重庆大学锂电研究院建成投用。

![研究院](photo2.jpg)
```

### subtitle - 字幕段落

- 用途：纯文字内容，大字字幕展示
- 特点：毛玻璃背景，NEWS 角标
- 字数建议：40-60 字

```markdown
---
scene: subtitle
---

目前，遂宁已形成从矿石开采到电池回收的完整产业链...
```

### dashboard - 数据仪表盘

- 用途：展示关键数据指标
- 自动提取：数字 + 单位（亿/万/%/家）
- 字数建议：60-80 字

```markdown
---
scene: dashboard
---

2024年数据显示：锂电产业产值达1050亿元，同比增长35%。
碳酸锂产能占全国的15%。企业数量突破200家。
```

### outro - 结尾

- 用途：视频结尾，总结+展望
- 特点：底部新闻条滚动
- 字数建议：20-30 字

```markdown
---
scene: outro
---

未来，遂宁将继续深耕锂电产业，打造世界级锂电产业集群。
```

## 字数控制

- **单场景**：≤ 80 字（约 20-25 秒）
- **总字数**：≤ 240 字（约 60-75 秒）

超过字数限制时：
1. 提示用户精简内容
2. 或建议拆分为更多场景
3. 或提高 TTS 语速
