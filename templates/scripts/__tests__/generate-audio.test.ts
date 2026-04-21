import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGenerateAudioInvocation,
  resolveGenerateAudioCliArgs,
} from '../generate-audio.ts';

test('resolves audio CLI args', () => {
  const result = resolveGenerateAudioCliArgs([
    'C:/project/output',
    '--python',
    'python3',
  ]);

  assert.deepEqual(result, {
    projectDir: 'C:/project/output',
    pythonCommand: 'python3',
  });
});

test('builds python invocation for generate_audio.py', () => {
  const result = buildGenerateAudioInvocation({
    projectDir: 'C:/project/output',
    pythonCommand: 'python',
  });

  assert.equal(result.command, 'python');
  assert.equal(result.cwd, 'C:/project/output');
  assert.equal(result.args.length, 1);
  assert.match(result.args[0], /generate_audio\.py$/i);
});

test('requests scene_XX audio naming compatibility for the renderer', () => {
  const result = buildGenerateAudioInvocation({
    projectDir: 'C:/project/output',
    pythonCommand: 'python',
  });

  assert.deepEqual(result.env, {
    BRIEFING_VIDEO_AUDIO_NAMING: 'legacy-sequence',
  });
});
