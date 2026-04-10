/**
 * 大段文档智能切分器
 * 将 input/news.md 自动切分为 content/ 下的 5 个场景文件
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ParsedInput {
  title: string;
  source?: string;
  author?: string;
  intro: string;
  slides: { text: string; imageHint?: string }[];
  subtitle: string;
  metrics: { text: string; numbers: { label: string; value: number; suffix: string }[] };
  outro: string;
}

/**
 * 从 input/news.md 解析大段文档
 */
export function parseInputFile(inputPath: string): ParsedInput {
  const content = fs.readFileSync(inputPath, 'utf-8');

  // 解析 frontmatter
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  let frontmatter: Record<string, any> = {};
  let body = content;

  if (frontmatterMatch) {
    const yamlContent = frontmatterMatch[1];
    body = content.slice(frontmatterMatch[0].length);

    yamlContent.split('\n').forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        frontmatter[match[1]] = match[2].trim().replace(/^["']|["']$/g, '');
      }
    });
  }

  // 提取标题 (# 标题)
  const titleMatch = body.match(/^#\s+(.+)$/m);
  const title = frontmatter.title || (titleMatch ? titleMatch[1].trim() : '新闻标题');

  // 清理 body：移除标题
  let cleanBody = body.replace(/^#\s+.+$/m, '').trim();

  // 按段落分割
  const paragraphs = cleanBody
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // 智能切分逻辑
  return splitIntoScenes(paragraphs, title, frontmatter);
}

/**
 * 将段落切分为 5 个场景
 */
function splitIntoScenes(
  paragraphs: string[],
  title: string,
  frontmatter: Record<string, any>
): ParsedInput {
  // 合并所有文本
  const fullText = paragraphs.join('\n\n');

  // Scene 1: Intro - 取前1-2段（约30-40字）
  const introText = paragraphs.slice(0, 2).join(' ').slice(0, 60);

  // Scene 2: Slideshow - 取接下来的2-3段，每段配一张图
  const slideParagraphs = paragraphs.slice(2, 5);
  const slides = slideParagraphs.map((p, i) => ({
    text: p.slice(0, 50),
    imageHint: `photo${i + 1}.jpg`
  }));

  // Scene 3: Subtitle - 找一个总结性段落（40-60字）
  const subtitleParagraph = paragraphs.find(p =>
    p.length > 40 && p.length < 80 &&
    (p.includes('形成') || p.includes('产业') || p.includes('目前'))
  ) || paragraphs[Math.min(5, paragraphs.length - 1)] || '';

  // Scene 4: Dashboard - 找包含数字的段落
  const dashboardParagraph = paragraphs.find(p =>
    /\d+[%亿元万]/.test(p) && p.length > 30
  ) || paragraphs[Math.min(6, paragraphs.length - 1)] || '';

  // 提取数字指标
  const numbers = extractNumbers(dashboardParagraph);

  // Scene 5: Outro - 最后一段或展望段落
  const outroParagraph = paragraphs.find(p =>
    p.includes('未来') || p.includes('展望') || p.includes('将')
  ) || paragraphs[paragraphs.length - 1] || '';

  return {
    title,
    source: frontmatter.source,
    author: frontmatter.author,
    intro: introText || '2024年，全市锂电产业产值突破千亿大关。',
    slides: slides.length > 0 ? slides : [{ text: '产业发展迅速。', imageHint: 'photo1.jpg' }],
    subtitle: subtitleParagraph.slice(0, 80) || '已形成完整产业链。',
    metrics: {
      text: dashboardParagraph.slice(0, 100),
      numbers
    },
    outro: outroParagraph.slice(0, 50) || '未来将继续深耕产业。'
  };
}

/**
 * 从文本中提取数字指标
 */
function extractNumbers(text: string): { label: string; value: number; suffix: string }[] {
  const numbers: { label: string; value: number; suffix: string }[] = [];

  const patterns = [
    { regex: /(\d+)亿/g, suffix: '亿元' },
    { regex: /(\d+)万/g, suffix: '万' },
    { regex: /(\d+)%/g, suffix: '%' },
    { regex: /(\d+)家/g, suffix: '家' }
  ];

  for (const { regex, suffix } of patterns) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      const value = parseInt(match[1], 10);
      const contextStart = Math.max(0, match.index - 15);
      const context = text.slice(contextStart, match.index).trim();
      const label = context.slice(-6).replace(/[：:]/, '') || '数据';

      numbers.push({ label, value, suffix });
      if (numbers.length >= 4) break;
    }
    if (numbers.length >= 4) break;
  }

  // 默认值
  if (numbers.length === 0) {
    numbers.push(
      { label: '产值', value: 1000, suffix: '亿元' },
      { label: '增长', value: 35, suffix: '%' }
    );
  }

  return numbers.slice(0, 4);
}

/**
 * 生成 content/ 目录下的 5 个场景文件
 */
export function generateContentFiles(parsed: ParsedInput, contentDir: string): void {
  // 确保目录存在
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  // 清理现有文件
  fs.readdirSync(contentDir)
    .filter(f => f.endsWith('.md'))
    .forEach(f => fs.unlinkSync(path.join(contentDir, f)));

  // Scene 01: Intro
  const introContent = `---
scene: intro
image: cover.jpg
layout: split
imagePosition: left
---

# ${parsed.title}

${parsed.intro}
`;
  fs.writeFileSync(path.join(contentDir, '01-intro.md'), introContent);

  // Scene 02: Slideshow
  const slideContent = parsed.slides.map((s, i) =>
    `${s.text}\n\n![图片${i + 1}](${s.imageHint || `photo${i + 1}.jpg`})`
  ).join('\n\n');

  const slideshowContent = `---
scene: slideshow
---

${slideContent}
`;
  fs.writeFileSync(path.join(contentDir, '02-slideshow.md'), slideshowContent);

  // Scene 03: Subtitle
  const subtitleContent = `---
scene: subtitle
---

${parsed.subtitle}
`;
  fs.writeFileSync(path.join(contentDir, '03-subtitle.md'), subtitleContent);

  // Scene 04: Dashboard
  const dashboardContent = `---
scene: dashboard
---

${parsed.metrics.text}
`;
  fs.writeFileSync(path.join(contentDir, '04-dashboard.md'), dashboardContent);

  // Scene 05: Outro
  const outroContent = `---
scene: outro
---

${parsed.outro}
`;
  fs.writeFileSync(path.join(contentDir, '05-outro.md'), outroContent);
}

/**
 * 主入口：解析 input 并生成 content
 */
export function processInputToContent(projectDir: string): ParsedInput {
  const inputPath = path.join(projectDir, 'input', 'news.md');

  if (!fs.existsSync(inputPath)) {
    throw new Error(`未找到 input/news.md，请确保文件存在: ${inputPath}`);
  }

  const parsed = parseInputFile(inputPath);
  const contentDir = path.join(projectDir, 'content');

  generateContentFiles(parsed, contentDir);

  console.log(`✅ 已生成 ${contentDir} 下的 5 个场景文件`);
  return parsed;
}
