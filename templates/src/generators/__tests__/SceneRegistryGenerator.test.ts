import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SceneRegistryGenerator } from '../SceneRegistryGenerator.ts';

test('writes generated scene registry with custom template imports', () => {
  const projectDir = mkdtempSync(join(tmpdir(), 'briefing-video-scene-registry-'));

  try {
    mkdirSync(join(projectDir, 'src', 'scenes'), { recursive: true });
    mkdirSync(join(projectDir, 'user-templates'), { recursive: true });
    writeFileSync(
      join(projectDir, 'user-templates', 'registry.json'),
      JSON.stringify(
        {
          scenes: {
            'cinematic-intro': {
              name: '电影感开场',
              file: 'user-templates/scenes/CinematicIntro.tsx',
            },
          },
        },
        null,
        2,
      ),
      'utf-8',
    );

    const generator = new SceneRegistryGenerator();
    const result = generator.generate({
      outputDir: projectDir,
      document: {
        metadata: { title: '模板视频' },
        scenes: [
          {
            id: 'scene-1',
            index: 1,
            name: '开场',
            type: 'intro',
            template: 'cinematic-intro',
            duration: 4,
            narration: '欢迎收看。',
            content: {
              title: '模板视频',
            },
          },
        ],
      },
    });

    const content = readFileSync(result.outputPath, 'utf-8');
    assert.match(result.outputPath, /src[\\/]scenes[\\/]generated\.ts$/i);
    assert.match(content, /import \* as customScene0Module from '\.\.\/\.\.\/user-templates\/scenes\/CinematicIntro\.tsx';/);
    assert.match(content, /'cinematic-intro': resolveModuleComponent\(customScene0Module\)/);
    assert.match(content, /intro: Scene01/);
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});
