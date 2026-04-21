import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { MarkdownParser } from '../MarkdownParser.ts';
import { SceneInferrer } from '../SceneInferrer.ts';
import { MaterialMapper } from '../MaterialMapper.ts';

test('infers auto scene types and maps local material files', () => {
  const fixturePath = resolve(import.meta.dirname, './fixtures/sample-auto.md');
  const content = readFileSync(fixturePath, 'utf-8');

  const parser = new MarkdownParser();
  const document = parser.parse(content);
  const inferrer = new SceneInferrer();

  const inferredFirst = inferrer.infer(document.scenes[0], {
    isFirst: true,
    isLast: false,
  });
  const inferredSecond = inferrer.infer(document.scenes[1], {
    isFirst: false,
    isLast: true,
  });

  assert.equal(inferredFirst, 'intro');
  assert.equal(inferredSecond, 'outro');

  const materialsDir = resolve(import.meta.dirname, './fixtures/materials');
  rmSync(materialsDir, { force: true, recursive: true });
  mkdirSync(materialsDir, { recursive: true });
  writeFileSync(resolve(materialsDir, 'cover.png'), 'fake-image');

  const mapper = new MaterialMapper();
  const mappings = mapper.map(materialsDir, document.scenes);

  assert.equal(mappings.length, 1);
  assert.equal(mappings[0].file, 'cover.png');
  assert.equal(mappings[0].scene, document.scenes[0].id);
});
