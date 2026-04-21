import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBuildVideoPlan,
  resolveBuildVideoCliArgs,
} from '../build-video.ts';

test('resolves build-video CLI args', () => {
  const result = resolveBuildVideoCliArgs([
    'C:/project/input/new.md',
    '--output-dir',
    'C:/project/output',
    '--python',
    'python3',
  ]);

  assert.deepEqual(result, {
    inputPath: 'C:/project/input/new.md',
    outputDir: 'C:/project/output',
    pythonCommand: 'python3',
  });
});

test('builds end-to-end workflow plan', () => {
  const result = buildBuildVideoPlan({
    inputPath: 'C:/project/input/new.md',
    outputDir: 'C:/project/output',
    pythonCommand: 'python',
  });

  assert.equal(result.steps.length, 3);
  assert.deepEqual(result.steps.map((step) => step.name), [
    'process:new',
    'generate:audio',
    'render:video',
  ]);
  assert.equal(result.steps[0].command, 'node');
  assert.equal(result.steps[1].command, 'node');
  assert.equal(result.steps[2].command, 'npx');
});

test('renders from the template project root while writing output into outputDir', () => {
  const result = buildBuildVideoPlan({
    inputPath: 'C:/project/input/new.md',
    outputDir: 'C:/project/output',
    pythonCommand: 'python',
  });

  assert.match(result.projectDir, /templates$/i);
  assert.equal(result.steps[0].cwd, result.projectDir);
  assert.equal(result.steps[1].cwd, result.projectDir);
  assert.equal(result.steps[2].cwd, result.projectDir);
  assert.deepEqual(result.steps[0].args.slice(-2), ['--output-dir', result.projectDir]);
  assert.match(result.steps[1].args[1], /generate-audio\.ts$/i);
  assert.equal(result.steps[1].args[2], result.projectDir);
});
