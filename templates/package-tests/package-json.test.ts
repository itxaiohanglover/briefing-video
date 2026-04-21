import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(
  readFileSync(
    'C:/Users/artboy/.claude/skills/briefing-video/.worktrees/phase1-parser/templates/package.json',
    'utf-8',
  ),
);

test('exposes process:new npm script', () => {
  assert.equal(
    packageJson.scripts['process:new'],
    'node --experimental-strip-types scripts/process-new.ts',
  );
});

test('exposes generate:audio npm script', () => {
  assert.equal(
    packageJson.scripts['generate:audio'],
    'node --experimental-strip-types scripts/generate-audio.ts',
  );
});

test('exposes build:video npm script', () => {
  assert.equal(
    packageJson.scripts['build:video'],
    'node --experimental-strip-types scripts/build-video.ts',
  );
});
