import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MarkdownParser } from '../MarkdownParser.ts';

test('parses metadata and scenes from new.md document', () => {
  const fixturePath = resolve(import.meta.dirname, './fixtures/sample-new.md');
  const content = readFileSync(fixturePath, 'utf-8');

  const parser = new MarkdownParser();
  const result = parser.parse(content);

  assert.equal(result.metadata.title, '今日新闻简报');
  assert.equal(result.metadata.style, 'deep-blue');
  assert.deepEqual(result.metadata.duration, { min: 60, max: 120 });
  assert.deepEqual(result.metadata.resolution, { width: 1080, height: 1920 });
  assert.equal(result.metadata.backgroundMusic, 'public/audio/background.mp3');
  assert.equal(result.scenes.length, 2);
  assert.equal(result.scenes[0].name, '开场');
  assert.equal(result.scenes[0].type, 'intro');
  assert.equal(result.scenes[0].content.title, '今日新闻简报');
  assert.equal(result.scenes[0].content.layout, 'split');
  assert.equal(result.scenes[1].type, 'subtitle');
  assert.match(result.scenes[1].narration, /核心要点/);
});
