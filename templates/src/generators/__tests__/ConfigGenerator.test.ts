import test from 'node:test';
import assert from 'node:assert/strict';
import { ConfigGenerator } from '../ConfigGenerator.ts';

test('generates scenes config from parsed markdown document', () => {
  const generator = new ConfigGenerator();

  const result = generator.generate({
    metadata: {
      title: '今日新闻简报',
      style: 'deep-blue',
      duration: { min: 60, max: 120 },
      resolution: { width: 1080, height: 1920 },
      backgroundMusic: 'public/audio/background.mp3',
      colorScheme: 'default',
    },
    scenes: [
      {
        id: 'scene-1',
        index: 1,
        name: '开场',
        type: 'intro',
        duration: 'auto',
        narration: '欢迎收看今日新闻简报。',
        content: {
          title: '今日新闻简报',
          subtitle: '聚焦热点 · 洞察趋势',
          image: 'materials/intro-bg.png',
          layout: 'split',
        },
      },
      {
        id: 'scene-2',
        index: 2,
        name: '核心内容',
        type: 'subtitle',
        duration: 'auto',
        narration: '本条新闻的核心要点是政策调整带来的市场变化。',
        content: {
          text: '本条新闻的核心要点是政策调整带来的市场变化。',
          highlight: '核心要点',
        },
      },
    ],
  });

  assert.equal(result.title, '今日新闻简报');
  assert.equal(result.orientation, 'portrait');
  assert.equal(result.backgroundMusic, 'public/audio/background.mp3');
  assert.equal(result.scenes.length, 2);
  assert.deepEqual(result.scenes[0], {
    id: 'scene-1',
    type: 'intro',
    enabled: true,
    narration: '欢迎收看今日新闻简报。',
    title: '今日新闻简报',
    subtitle: '聚焦热点 · 洞察趋势',
    image: 'materials/intro-bg.png',
    layout: 'split',
  });
  assert.deepEqual(result.scenes[1], {
    id: 'scene-2',
    type: 'subtitle',
    enabled: true,
    narration: '本条新闻的核心要点是政策调整带来的市场变化。',
    content: '本条新闻的核心要点是政策调整带来的市场变化。',
    highlight: '核心要点',
  });
});

test('uses defaults for source orientation and duration fallback', () => {
  const generator = new ConfigGenerator();

  const result = generator.generate({
    metadata: {
      title: '横屏视频',
      resolution: { width: 1920, height: 1080 },
    },
    scenes: [
      {
        id: 'scene-1',
        index: 1,
        name: '概览',
        narration: '概览配音',
        content: {
          text: '概览内容',
        },
      },
    ],
  });

  assert.equal(result.orientation, 'landscape');
  assert.equal(result.totalDuration, 0);
  assert.equal(result.source, 'new.md');
  assert.equal(result.scenes[0].type, 'subtitle');
});
