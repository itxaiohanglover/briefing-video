import type { ParsedMarkdownDocument, ParsedMetadata, ParsedScene } from './types.ts';

const stripQuotes = (value: string): string => value.replace(/^"|"$/g, '').trim();

const parseDurationRange = (value: string): { min: number; max: number } => {
  const match = value.match(/(\d+)\s*-\s*(\d+)\s*秒/);
  if (!match) {
    return { min: 60, max: 120 };
  }

  return {
    min: Number(match[1]),
    max: Number(match[2]),
  };
};

const parseResolution = (value: string): { width: number; height: number } => {
  const match = value.match(/(\d+)x(\d+)/i);
  if (!match) {
    return { width: 1080, height: 1920 };
  }

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  };
};

export class MarkdownParser {
  parse(content: string): ParsedMarkdownDocument {
    const lines = content.replace(/\r\n/g, '\n').split('\n');

    const metadata: ParsedMetadata = {
      title: '',
      style: 'deep-blue',
      duration: { min: 60, max: 120 },
      resolution: { width: 1080, height: 1920 },
      colorScheme: 'default',
    };

    const scenes: ParsedScene[] = [];

    let currentScene: ParsedScene | null = null;
    let inContentConfig = false;
    let currentMultilineKey: 'text' | null = null;
    let multilineBuffer: string[] = [];

    const flushMultiline = () => {
      if (currentScene && currentMultilineKey) {
        currentScene.content[currentMultilineKey] = multilineBuffer.join('\n').trim();
      }
      currentMultilineKey = null;
      multilineBuffer = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (!trimmed) {
        if (currentMultilineKey && rawLine.startsWith('    ')) {
          multilineBuffer.push('');
        }
        continue;
      }

      if (trimmed.startsWith('# ')) {
        metadata.title = trimmed.slice(2).trim();
        continue;
      }

      if (trimmed === '## 📋 元数据配置' || trimmed === '## 🎬 场景规划') {
        flushMultiline();
        inContentConfig = false;
        continue;
      }

      if (trimmed.startsWith('### 场景 ')) {
        flushMultiline();
        if (currentScene) {
          scenes.push(currentScene);
        }

        const name = trimmed.split(':').slice(1).join(':').trim();
        currentScene = {
          id: `scene-${scenes.length + 1}`,
          index: scenes.length + 1,
          name,
          type: 'subtitle',
          duration: 'auto',
          narration: '',
          content: {},
        };
        inContentConfig = false;
        continue;
      }

      if (!currentScene) {
        const separatorIndex = trimmed.indexOf(':');
        if (separatorIndex > 0) {
          const key = trimmed.slice(0, separatorIndex).trim();
          const value = trimmed.slice(separatorIndex + 1).trim();

          if (key === '风格') metadata.style = value;
          if (key === '时长') metadata.duration = parseDurationRange(value);
          if (key === '分辨率') metadata.resolution = parseResolution(value);
          if (key === '背景音乐') metadata.backgroundMusic = value;
          if (key === '配色方案') metadata.colorScheme = value;
        }
        continue;
      }

      if (trimmed === '**内容配置**:') {
        flushMultiline();
        inContentConfig = true;
        continue;
      }

      const strongField = trimmed.match(/^\*\*(.+?)\*\*:\s*(.*)$/);
      if (strongField) {
        flushMultiline();
        inContentConfig = false;
        const [, key, rawValue] = strongField;
        const value = rawValue.trim();

        if (key === '类型') currentScene.type = value;
        if (key === '模板') currentScene.template = value;
        if (key === '时长') currentScene.duration = value === 'auto' ? 'auto' : Number(value.replace(/秒$/, ''));
        if (key === '配音') currentScene.narration = stripQuotes(value);
        continue;
      }

      if (inContentConfig && trimmed.startsWith('- ')) {
        const contentLine = trimmed.slice(2);
        const separatorIndex = contentLine.indexOf(':');
        if (separatorIndex === -1) continue;

        const key = contentLine.slice(0, separatorIndex).trim();
        const value = contentLine.slice(separatorIndex + 1).trim();

        if (key === '标题') currentScene.content.title = stripQuotes(value);
        if (key === '副标题') currentScene.content.subtitle = stripQuotes(value);
        if (key === '图片') currentScene.content.image = stripQuotes(value);
        if (key === '布局') currentScene.content.layout = stripQuotes(value);
        if (key === '高亮关键词') currentScene.content.highlight = stripQuotes(value);
        if (key === '文字内容' && value === '|') {
          currentMultilineKey = 'text';
          multilineBuffer = [];
        }
        continue;
      }

      if (currentMultilineKey === 'text' && rawLine.startsWith('    ')) {
        multilineBuffer.push(rawLine.slice(4));
        continue;
      }

      if (currentMultilineKey) {
        flushMultiline();
      }
    }

    flushMultiline();
    if (currentScene) {
      scenes.push(currentScene);
    }

    return { metadata, scenes };
  }
}
