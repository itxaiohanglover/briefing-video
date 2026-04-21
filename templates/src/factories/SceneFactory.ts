import type { SceneType } from '../types.ts';
import { TemplateLoader } from '../utils/TemplateLoader.ts';

export interface SceneFactoryInput {
  type: SceneType;
  template?: string;
}

export type SceneResolution =
  | {
      kind: 'custom';
      id: string;
      file: string;
    }
  | {
      kind: 'builtin';
      type: SceneType;
    };

export class SceneFactory {
  private readonly templateLoader: TemplateLoader;

  constructor(projectDir: string) {
    this.templateLoader = new TemplateLoader(projectDir);
  }

  resolve(input: SceneFactoryInput): SceneResolution {
    if (input.template) {
      const customScene = this.templateLoader.getScene(input.template);
      if (customScene) {
        return {
          kind: 'custom',
          id: input.template,
          file: customScene.file,
        };
      }
    }

    return {
      kind: 'builtin',
      type: input.type,
    };
  }
}
