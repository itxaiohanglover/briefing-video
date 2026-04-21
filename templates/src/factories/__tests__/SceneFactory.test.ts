import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MarkdownParser } from '../../parser/MarkdownParser.ts';
import { ConfigGenerator } from '../../generators/ConfigGenerator.ts';
import { SceneFactory } from '../SceneFactory.ts';
import { resolveSceneComponentPath } from '../runtime.ts';

test('parses template field and preserves it in generated scene config', () => {
  const markdown = `# 模板测试\n\n---\n## 📋 元数据配置\n---\n\n分辨率: 1080x1920\n\n---\n## 🎬 场景规划\n---\n\n### 场景 1: 开场\n\n**类型**: intro\n**模板**: cinematic-intro\n**时长**: 4秒\n\n**内容配置**:\n- 标题: "模板测试"\n\n**配音**: "欢迎收看模板测试。"\n`;

  const parser = new MarkdownParser();
  const generator = new ConfigGenerator();

  const document = parser.parse(markdown);
  const config = generator.generate(document);

  assert.equal(document.scenes[0].template, 'cinematic-intro');
  assert.equal(config.scenes[0].template, 'cinematic-intro');
});

test('prefers user template over builtin scene when registry has template entry', () => {
  const projectDir = mkdtempSync(join(tmpdir(), 'briefing-video-scene-factory-'));

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
        },
        null,
        2,
      ),
      'utf-8',
    );

    const factory = new SceneFactory(projectDir);

    const result = factory.resolve({
      type: 'intro',
      template: 'cinematic-intro',
    });

    assert.deepEqual(result, {
      kind: 'custom',
      id: 'cinematic-intro',
      file: 'user-templates/scenes/CinematicIntro.tsx',
    });
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }
});

test('resolves builtin runtime path when no custom template is provided', () => {
  const result = resolveSceneComponentPath({
    kind: 'builtin',
    type: 'intro',
  });

  assert.equal(result, './Scene01.tsx');
});

test('resolves custom runtime path from registry entry', () => {
  const result = resolveSceneComponentPath({
    kind: 'custom',
    id: 'cinematic-intro',
    file: 'user-templates/scenes/CinematicIntro.tsx',
  });

  assert.equal(result, '../../user-templates/scenes/CinematicIntro.tsx');
});
