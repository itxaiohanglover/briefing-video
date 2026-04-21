import type { ParsedMarkdownDocument } from '../parser/types.ts';
import type { Orientation, SceneData, VideoConfig } from '../types.ts';

const toOrientation = (width: number, height: number): Orientation => {
  return width >= height ? 'landscape' : 'portrait';
};

export class ConfigGenerator {
  generate(document: ParsedMarkdownDocument): VideoConfig & { backgroundMusic?: string } {
    const resolution = document.metadata.resolution ?? { width: 1080, height: 1920 };

    const scenes: SceneData[] = document.scenes.map((scene) => {
      const baseScene: SceneData = {
        id: scene.id,
        type: (scene.type ?? 'subtitle') as SceneData['type'],
        enabled: true,
        narration: scene.narration,
      };

      if (scene.template) {
        baseScene.template = scene.template;
      }

      if (scene.content.title) {
        baseScene.title = scene.content.title;
      }
      if (scene.content.subtitle) {
        baseScene.subtitle = scene.content.subtitle;
      }
      if (scene.content.image) {
        baseScene.image = scene.content.image;
      }
      if (scene.content.layout) {
        baseScene.layout = scene.content.layout as SceneData['layout'];
      }
      if (scene.content.text) {
        baseScene.content = scene.content.text;
      }
      if (scene.content.highlight) {
        baseScene.highlight = scene.content.highlight;
      }

      return baseScene;
    });

    return {
      title: document.metadata.title,
      totalDuration: document.metadata.duration?.max ?? 0,
      orientation: toOrientation(resolution.width, resolution.height),
      source: 'new.md',
      backgroundMusic: document.metadata.backgroundMusic,
      scenes,
    };
  }
}
