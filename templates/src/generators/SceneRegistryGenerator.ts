import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ParsedMarkdownDocument } from '../parser/types.ts';
import { SceneFactory } from '../factories/SceneFactory.ts';
import { resolveSceneComponentPath } from '../factories/runtime.ts';

export interface SceneRegistryGeneratorInput {
  document: ParsedMarkdownDocument;
  outputDir: string;
}

export interface SceneRegistryGeneratorResult {
  outputPath: string;
}

interface CustomSceneImport {
  id: string;
  alias: string;
  importPath: string;
}

const BUILTIN_IMPORTS = [
  "import { Scene01 } from './Scene01.tsx';",
  "import { Scene02 } from './Scene02.tsx';",
  "import { Scene03 } from './Scene03.tsx';",
  "import { Scene04 } from './Scene04.tsx';",
  "import { Scene05 } from './Scene05.tsx';",
  "import type { ComponentType } from 'react';",
  "import type { SceneProps } from '../types.ts';",
].join('\n');

const BUILTIN_REGISTRY = [
  '  intro: Scene01,',
  '  slideshow: Scene02,',
  '  subtitle: Scene03,',
  '  dashboard: Scene04,',
  '  outro: Scene05,',
].join('\n');

const renderContent = (customImports: CustomSceneImport[]): string => {
  const importLines = customImports
    .map((entry) => `import * as ${entry.alias}Module from '${entry.importPath}';`)
    .join('\n');

  const customRegistry = customImports
    .map(
      (entry) =>
        `  '${entry.id}': resolveModuleComponent(${entry.alias}Module),`,
    )
    .join('\n');

  return `${BUILTIN_IMPORTS}${importLines ? `\n${importLines}` : ''}

type SceneComponent = ComponentType<SceneProps>;

type SceneComponentModule = {
  default?: SceneComponent;
} & Record<string, unknown>;

const resolveModuleComponent = (sceneModule: SceneComponentModule): SceneComponent => {
  const component =
    sceneModule.default ??
    Object.values(sceneModule).find((value) => typeof value === 'function');

  if (!component) {
    throw new Error('自定义场景模块未导出可用组件');
  }

  return component as SceneComponent;
};

export const sceneComponents: Record<string, SceneComponent> = {
${BUILTIN_REGISTRY}${customRegistry ? `\n${customRegistry}` : ''}
};
`;
};

export class SceneRegistryGenerator {
  generate(input: SceneRegistryGeneratorInput): SceneRegistryGeneratorResult {
    const outputPath = join(input.outputDir, 'src', 'scenes', 'generated.ts');
    const factory = new SceneFactory(input.outputDir);
    const customImports = new Map<string, CustomSceneImport>();

    for (const scene of input.document.scenes) {
      if (!scene.type) {
        continue;
      }

      const resolution = factory.resolve({
        type: scene.type as never,
        template: scene.template,
      });

      if (resolution.kind !== 'custom') {
        continue;
      }

      if (!customImports.has(resolution.id)) {
        customImports.set(resolution.id, {
          id: resolution.id,
          alias: `customScene${customImports.size}`,
          importPath: resolveSceneComponentPath(resolution),
        });
      }
    }

    mkdirSync(join(input.outputDir, 'src', 'scenes'), { recursive: true });
    writeFileSync(outputPath, renderContent([...customImports.values()]));

    return { outputPath };
  }
}
