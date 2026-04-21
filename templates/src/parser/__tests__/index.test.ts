import test from 'node:test';
import assert from 'node:assert/strict';
import * as parser from '../index.ts';

test('exports parser modules from barrel file', () => {
  assert.equal(typeof parser.MarkdownParser, 'function');
  assert.equal(typeof parser.SceneInferrer, 'function');
  assert.equal(typeof parser.MaterialMapper, 'function');
  assert.equal(typeof parser.SchemaValidator, 'function');
  assert.equal(typeof parser.SceneLint, 'function');
});
