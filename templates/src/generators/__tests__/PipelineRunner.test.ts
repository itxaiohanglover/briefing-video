import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PipelineRunner } from '../PipelineRunner.ts';

test('writes scenes.json and timing.json from parsed markdown document', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'briefing-video-pipeline-'));

  try {
    const runner = new PipelineRunner();

    const result = runner.run({
      document: {
        metadata: {
          title: '今日新闻简报',
          duration: { min: 60, max: 120 },
          resolution: { width: 1080, height: 1920 },
          backgroundMusic: 'public/audio/background.mp3',
        },
        scenes: [
          {
            id: 'scene-1',
            index: 1,
            name: '开场',
            type: 'intro',
            duration: 4,
            narration: '欢迎收看今日新闻简报。',
            content: {
              title: '今日新闻简报',
              subtitle: '聚焦热点',
            },
          },
        ],
      },
      outputDir: tempDir,
    });

    assert.equal(result.scenesPath, join(tempDir, 'scenes.json'));
    assert.equal(result.timingPath, join(tempDir, 'public', 'audio', 'timing.json'));
    assert.equal(result.sceneRegistryPath, join(tempDir, 'src', 'scenes', 'generated.ts'));

    const scenes = JSON.parse(readFileSync(result.scenesPath, 'utf-8'));
    const timing = JSON.parse(readFileSync(result.timingPath, 'utf-8'));

    assert.equal(scenes.title, '今日新闻简报');
    assert.equal(scenes.scenes.length, 1);
    assert.equal(timing.sections.length, 1);
    assert.equal(timing.sections[0].name, 'scene-1');
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test('creates nested output directories when missing', () => {
  const baseDir = mkdtempSync(join(tmpdir(), 'briefing-video-pipeline-'));
  const outputDir = join(baseDir, 'nested', 'project');

  try {
    const runner = new PipelineRunner();

    const result = runner.run({
      document: {
        metadata: {
          title: '目录创建测试',
        },
        scenes: [
          {
            id: 'scene-1',
            index: 1,
            name: '概览',
            type: 'subtitle',
            duration: 3,
            narration: '概览配音',
            content: {
              text: '概览内容',
            },
          },
        ],
      },
      outputDir,
    });

    assert.equal(existsSync(result.scenesPath), true);
    assert.equal(existsSync(result.timingPath), true);
    assert.equal(existsSync(result.sceneRegistryPath), true);
  } finally {
    rmSync(baseDir, { recursive: true, force: true });
  }
});
