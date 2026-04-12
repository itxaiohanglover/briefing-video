/**
 * Markdown 内容解析器
 * 将 content/*.md 转换为 scenes.json
 */

import * as fs from 'fs';
import * as path from 'path';

export interface MarkdownFile {
  filename: string;
  order: number;
  frontmatter: Record<string, any>;
  title: string;
  content: string;
  images: { src: string; caption: string }[];
}

export interface ParsedScene {
  id: string;
  type: 'intro' | 'slideshow' | 'subtitle' | 'dashboard' | 'outro';
  enabled: boolean;
  narration: string;
  title?: string;
  [key: string]: any;
}

/**
 * 解析单个 Markdown 文件
 */
export function parseMarkdownFile(filePath: string): MarkdownFile {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);

  // 从文件名提取序号 (01-intro.md → 1)
  const orderMatch = filename.match(/^(\d+)/);
  const order = orderMatch ? parseInt(orderMatch[1], 10) : 0;

  // 解析 frontmatter
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  let frontmatter: Record<string, any> = {};
  let bodyContent = content;

  if (frontmatterMatch) {
    const yamlContent = frontmatterMatch[1];
    bodyContent = content.slice(frontmatterMatch[0].length);

    // 简单 YAML 解析
    yamlContent.split('\n').forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        frontmatter[key] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
  }

  // 提取标题 (# 标题)
  const titleMatch = bodyContent.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // 提取图片 ![alt](src)
  const images: { src: string; caption: string }[] = [];
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = imageRegex.exec(bodyContent)) !== null) {
    images.push({
      caption: match[1].trim(),
      src: match[2].trim()
    });
  }

  // 清理内容：移除 frontmatter 和 # 标题，保留正文
  let cleanContent = bodyContent
    .replace(/^#\s+.+$/m, '') // 移除主标题
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // 移除图片标记
    .replace(/##?\s+.+$/gm, '') // 移除小标题
    .trim();

  return {
    filename,
    order,
    frontmatter,
    title,
    content: cleanContent,
    images
  };
}

/**
 * 从 Markdown 文件生成场景数据
 */
export function generateSceneData(mdFile: MarkdownFile): ParsedScene {
  const sceneType = (mdFile.frontmatter.scene as string) || 'subtitle';
  const sceneId = `scene_${String(mdFile.order).padStart(2, '0')}`;

  const baseScene: ParsedScene = {
    id: sceneId,
    type: sceneType as any,
    enabled: true,
    narration: mdFile.content.replace(/\n+/g, ' ').trim(),
    title: mdFile.title
  };

  // 根据场景类型添加特定配置
  switch (sceneType) {
    case 'intro':
      return {
        ...baseScene,
        layout: mdFile.frontmatter.layout || 'split',
        imagePosition: mdFile.frontmatter.imagePosition || 'left',
        imageWidth: parseInt(mdFile.frontmatter.imageWidth) || 45,
        imageOpacity: parseFloat(mdFile.frontmatter.imageOpacity) || 0.9,
        image: mdFile.frontmatter.image || (mdFile.images[0]?.src)
      };

    case 'slideshow':
      return {
        ...baseScene,
        layout: 'background',
        imageOpacity: 0.55,
        kenBurns: true,
        images: mdFile.images.map(img => img.src),
        captions: mdFile.images.map(img => img.caption)
      };

    case 'subtitle':
      return {
        ...baseScene,
        layout: 'solid',
        bgBlur: true,
        newsBadge: true
      };

    case 'dashboard':
      return {
        ...baseScene,
        layout: 'solid',
        metrics: extractMetrics(mdFile.content)
      };

    case 'outro':
      return {
        ...baseScene,
        layout: 'background',
        imageOpacity: 0.4,
        newsTicker: true
      };

    default:
      return baseScene;
  }
}

/**
 * 从文本中提取数据指标
 */
function extractMetrics(text: string): { label: string; value: number; suffix: string }[] {
  const metrics: { label: string; value: number; suffix: string }[] = [];

  // 匹配模式：数字+单位（支持小数如 16.6万）
  const patterns = [
    { regex: /(\d+(?:\.\d+)?)亿/g, suffix: '亿元' },
    { regex: /(\d+(?:\.\d+)?)万/g, suffix: '万' },
    { regex: /(\d+(?:\.\d+)?)%/g, suffix: '%' },
    { regex: /(\d+(?:\.\d+)?)家/g, suffix: '家' },
    { regex: /(\d+(?:\.\d+)?)人/g, suffix: '人' }
  ];

  for (const { regex, suffix } of patterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const value = parseFloat(match[1]);
      // 简单提取上下文作为 label
      const contextStart = Math.max(0, match.index - 15);
      const context = text.slice(contextStart, match.index).trim();
      const label = context.slice(-6) || '数据';

      metrics.push({ label, value, suffix });

      if (metrics.length >= 4) break;
    }
    if (metrics.length >= 4) break;
  }

  // 如果没有提取到，使用默认值
  if (metrics.length === 0) {
    metrics.push(
      { label: '数据1', value: 100, suffix: '%' },
      { label: '数据2', value: 50, suffix: '万' },
      { label: '数据3', value: 1000, suffix: '家' },
      { label: '数据4', value: 30, suffix: '%' }
    );
  }

  return metrics.slice(0, 4);
}

/**
 * 解析所有 Markdown 文件
 */
export function parseAllMarkdown(contentDir: string): MarkdownFile[] {
  const files = fs.readdirSync(contentDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  return files.map(f => parseMarkdownFile(path.join(contentDir, f)));
}

/**
 * 生成完整的 scenes.json
 */
export function generateScenesJson(contentDir: string, title: string): object {
  const mdFiles = parseAllMarkdown(contentDir);
  const scenes = mdFiles.map(generateSceneData);

  return {
    title,
    totalDuration: 0, // 后续由音频检测更新
    orientation: 'portrait',
    source: 'content/*.md',
    scenes
  };
}
