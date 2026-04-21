import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TemplateLoader } from '../TemplateLoader.ts';

test('loads user template registry from project directory', () => {
  const projectDir = mkdtempSync(join(tmpdir(), 'briefing-video-templates-'));

  try {
    const templateDir = join(projectDir, 'user-templates');
    mkdirSync(templateDir, { recursive: true });
    writeFileSync(
      join(templateDir, 'registry.json'),
      JSON.stringify(
        {
          scenes: {
            'cinematic-intro': {
              name: '电影感开场',
              file: 'user-templates/scenes/CinematicIntro.tsx',
            },
          },
          animations: {
            cinematic: {
              name: '电影感动画',
              file: 'user-templates/animations/cinematic.ts',
            },
          },
        },
        null,
        2,
      ),
      'utf-8',
    );

    const loader = new TemplateLoader(projectDir);

    assert.deepEqual(loader.getScene('cinematic-intro'), {
      name: '电影感开场',
      file: 'user-templates/scenes/CinematicIntro.tsx',
    });
    assert.deepEqual(loader.getAnimation('cinematic'), {
      name: '电影感动画',
      file: 'user-templates/animations/cinematic.ts',
    });
    assert.equal(loader.getScene('missing-scene'), null);
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});
