import test from 'node:test';
import assert from 'node:assert/strict';
import { SceneLint } from '../SceneLint.ts';

test('reports split hints when scene count and narration are too large', () => {
  const lint = new SceneLint();

  const result = lint.check({
    metadata: {
      title: '测试标题',
      style: 'deep-blue',
      duration: { min: 60, max: 120 },
      resolution: { width: 1080, height: 1920 },
    },
    scenes: [
      {
        id: 'scene-1',
        index: 1,
        name: '过长场景',
        type: 'subtitle',
        duration: 'auto',
        narration:
          '这一段配音非常长，非常长，非常长，非常长，非常长，非常长，非常长，非常长，非常长，非常长，非常长，非常长，已经明显超出了单个场景建议承载的信息密度。',
        content: {
          text: '第一行\n第二行\n第三行\n第四行\n第五行\n第六行',
        },
      },
      {
        id: 'scene-2',
        index: 2,
        name: '场景2',
        type: 'subtitle',
        duration: 'auto',
        narration: '正常配音',
        content: { text: '内容' },
      },
      {
        id: 'scene-3',
        index: 3,
        name: '场景3',
        type: 'subtitle',
        duration: 'auto',
        narration: '正常配音',
        content: { text: '内容' },
      },
      {
        id: 'scene-4',
        index: 4,
        name: '场景4',
        type: 'subtitle',
        duration: 'auto',
        narration: '正常配音',
        content: { text: '内容' },
      },
      {
        id: 'scene-5',
        index: 5,
        name: '场景5',
        type: 'subtitle',
        duration: 'auto',
        narration: '正常配音',
        content: { text: '内容' },
      },
      {
        id: 'scene-6',
        index: 6,
        name: '场景6',
        type: 'subtitle',
        duration: 'auto',
        narration: '正常配音',
        content: { text: '内容' },
      },
      {
        id: 'scene-7',
        index: 7,
        name: '场景7',
        type: 'subtitle',
        duration: 'auto',
        narration: '正常配音',
        content: { text: '内容' },
      },
    ],
  });

  assert.equal(result.ok, false);
  assert.deepEqual(
    result.warnings.map((warning) => warning.path),
    ['scenes', 'scenes[0].narration', 'scenes[0].content.text'],
  );
});
