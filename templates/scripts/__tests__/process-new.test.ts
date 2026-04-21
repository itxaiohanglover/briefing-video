import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { processNewDocument, resolveProcessNewCliArgs } from '../process-new.ts';


test('processes new.md file and writes generated config files', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'briefing-video-process-'));

  try {
    const inputDir = join(tempDir, 'input');
    mkdirSync(inputDir, { recursive: true });

    const markdownPath = join(inputDir, 'new.md');
    writeFileSync(
      markdownPath,
      `# 今日新闻简报\n\n---\n## 📋 元数据配置\n---\n\n风格: deep-blue\n时长: 60-120秒\n分辨率: 1080x1920\n背景音乐: public/audio/background.mp3\n\n---\n## 🎬 场景规划\n---\n\n### 场景 1: 开场\n\n**类型**: intro\n**时长**: 4秒\n\n**内容配置**:\n- 标题: "今日新闻简报"\n- 副标题: "聚焦热点"\n\n**配音**: "欢迎收看今日新闻简报。"\n`,
      'utf-8',
    );

    const result = processNewDocument({
      inputPath: markdownPath,
      outputDir: tempDir,
    });

    const scenes = JSON.parse(readFileSync(result.scenesPath, 'utf-8'));
    const timing = JSON.parse(readFileSync(result.timingPath, 'utf-8'));

    assert.equal(scenes.title, '今日新闻简报');
    assert.equal(scenes.scenes[0].type, 'intro');
    assert.equal(timing.sections[0].duration_frames, 120);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('uses markdown parent directory as default output directory', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'briefing-video-process-'));

  try {
    const inputDir = join(tempDir, 'input');
    mkdirSync(inputDir, { recursive: true });

    const markdownPath = join(inputDir, 'new.md');
    writeFileSync(
      markdownPath,
      `# 默认输出目录测试\n\n---\n## 📋 元数据配置\n---\n\n分辨率: 1080x1920\n\n---\n## 🎬 场景规划\n---\n\n### 场景 1: 概览\n\n**类型**: subtitle\n**时长**: 3秒\n\n**内容配置**:\n- 文字内容: |\n    概览内容\n\n**配音**: "概览配音"\n`,
      'utf-8',
    );

    const result = processNewDocument({
      inputPath: markdownPath,
    });

    assert.equal(result.scenesPath, join(dirname(markdownPath), 'scenes.json'));
    assert.equal(result.timingPath, join(dirname(markdownPath), 'public', 'audio', 'timing.json'));
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('resolves CLI args for input and output paths', () => {
  const result = resolveProcessNewCliArgs([
    'C:/project/input/new.md',
    '--output-dir',
    'C:/project/output',
  ]);

  assert.deepEqual(result, {
    inputPath: 'C:/project/input/new.md',
    outputDir: 'C:/project/output',
  });
});
