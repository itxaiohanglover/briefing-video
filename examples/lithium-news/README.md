# 遂宁锂电产业示例

这是一个展示 briefing-video Skill 功能的示例项目，基于遂宁锂电产业突破千亿产值的新闻报道。

## 文件说明

```
input/          # 【放入】原始新闻文档和图片
├── news.md     # 大段新闻原文
└── *.jpg       # 配图素材

images/         # 视频使用的图片素材
```

## 快速开始

```bash
# 1. 复制此示例作为起点
cp -r examples/lithium-news my-project
cd my-project

# 2. 安装依赖（如未安装）
npm install

# 3. 生成视频
/briefing-video build
```

输出视频将保存在 `out/video.mp4`。

## 数据来源

原文：四川在线《遂宁：如何再赴新"锂"想？》
作者：袁敏 阚莹莹
