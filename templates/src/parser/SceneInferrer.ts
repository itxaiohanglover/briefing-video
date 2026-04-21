import type { ParsedScene, ParsedSceneContent } from './types.ts';

export interface SceneInferContext {
  isFirst: boolean;
  isLast: boolean;
}

const hasTitle = (content: ParsedSceneContent): boolean => {
  return Boolean(content.title || content.subtitle || content.image);
};

const hasText = (content: ParsedSceneContent): boolean => {
  return Boolean(content.text && content.text.trim().length > 0);
};

const hasThankYou = (scene: ParsedScene): boolean => {
  return /感谢|谢谢|thanks|watching/i.test(scene.narration) || /感谢|谢谢|thanks|watching/i.test(scene.name);
};

export class SceneInferrer {
  infer(scene: ParsedScene, context: SceneInferContext): string {
    if (scene.type && scene.type !== 'auto') {
      return scene.type;
    }

    if (context.isFirst && hasTitle(scene.content)) {
      return 'intro';
    }

    if (context.isLast && hasThankYou(scene)) {
      return 'outro';
    }

    if (hasText(scene.content)) {
      return 'subtitle';
    }

    return 'subtitle';
  }
}
