import test from 'node:test';
import assert from 'node:assert/strict';
import { TimingGenerator } from '../TimingGenerator.ts';

test('generates timing sections from scene durations', () => {
  const generator = new TimingGenerator();

  const result = generator.generate({
    metadata: {
      title: '今日新闻简报',
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
        },
      },
    ],
  });

  assert.equal(result.fps, 30);
  assert.equal(result.total_duration_sec, 9);
  assert.equal(result.total_frames, 270);
  assert.deepEqual(result.sections, [
    {
      name: 'scene-1',
      label: 'intro',
      start_frame: 0,
      end_frame: 120,
      duration_frames: 120,
      sentences: [
        {
          text: '欢迎收看今日新闻简报。',
          start_frame: 0,
          end_frame: 120,
        },
      ],
    },
    {
      name: 'scene-2',
      label: 'subtitle',
      start_frame: 120,
      end_frame: 270,
      duration_frames: 150,
      sentences: [
        {
          text: '本条新闻的核心要点是政策调整带来的市场变化。',
          start_frame: 120,
          end_frame: 270,
        },
      ],
    },
  ]);
});

test('skips empty narration when generating sentence timings', () => {
  const generator = new TimingGenerator();

  const result = generator.generate({
    metadata: {
      title: '测试视频',
    },
    scenes: [
      {
        id: 'scene-1',
        index: 1,
        name: '空配音场景',
        type: 'subtitle',
        duration: 3,
        narration: '   ',
        content: {
          text: '仅展示文字',
        },
      },
    ],
  });

  assert.equal(result.sections.length, 1);
  assert.deepEqual(result.sections[0].sentences, []);
});
