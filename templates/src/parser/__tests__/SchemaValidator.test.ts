import test from 'node:test';
import assert from 'node:assert/strict';
import { SchemaValidator } from '../SchemaValidator.ts';

test('reports missing scene narration as validation error', () => {
  const validator = new SchemaValidator();

  const result = validator.validate({
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
        name: '开场',
        type: 'intro',
        duration: 'auto',
        narration: '',
        content: {
          title: '测试标题',
        },
      },
    ],
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0].message, /配音|narration/i);
});

test('reports unsupported scene type as validation error', () => {
  const validator = new SchemaValidator();

  const result = validator.validate({
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
        name: '未知场景',
        type: 'unknown',
        duration: 'auto',
        narration: '正常配音',
        content: {
          title: '测试标题',
        },
      },
    ],
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].path, 'scenes[0].type');
  assert.match(result.errors[0].message, /类型|type/i);
});

test('reports invalid metadata duration range and scene duration', () => {
  const validator = new SchemaValidator();

  const result = validator.validate({
    metadata: {
      title: '测试标题',
      style: 'deep-blue',
      duration: { min: 120, max: 60 },
      resolution: { width: 1080, height: 1920 },
    },
    scenes: [
      {
        id: 'scene-1',
        index: 1,
        name: '开场',
        type: 'intro',
        duration: 0,
        narration: '正常配音',
        content: {
          title: '测试标题',
        },
      },
    ],
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 2);
  assert.deepEqual(
    result.errors.map((error) => error.path),
    ['metadata.duration', 'scenes[0].duration'],
  );
});

test('reports missing scene name and intro title content', () => {
  const validator = new SchemaValidator();

  const result = validator.validate({
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
        name: '',
        type: 'intro',
        duration: 'auto',
        narration: '正常配音',
        content: {},
      },
    ],
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 2);
  assert.deepEqual(
    result.errors.map((error) => error.path),
    ['scenes[0].name', 'scenes[0].content.title'],
  );
});
