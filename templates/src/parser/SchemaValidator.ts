import type { ParsedMarkdownDocument, ParsedScene } from './types.ts';

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
}

const SUPPORTED_SCENE_TYPES = new Set(['auto', 'intro', 'slideshow', 'subtitle', 'dashboard', 'outro']);

const isPositiveNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
};

const requiresTitle = (scene: ParsedScene): boolean => {
  return scene.type === 'intro';
};

export class SchemaValidator {
  validate(document: ParsedMarkdownDocument): ValidationResult {
    const errors: ValidationIssue[] = [];

    if (!document.metadata?.title?.trim()) {
      errors.push({ path: 'metadata.title', message: '标题不能为空' });
    }

    if (
      document.metadata?.duration &&
      (!isPositiveNumber(document.metadata.duration.min) ||
        !isPositiveNumber(document.metadata.duration.max) ||
        document.metadata.duration.min > document.metadata.duration.max)
    ) {
      errors.push({ path: 'metadata.duration', message: '视频时长范围不合法' });
    }

    document.scenes.forEach((scene, index) => {
      if (!scene.name?.trim()) {
        errors.push({
          path: `scenes[${index}].name`,
          message: '场景名称不能为空',
        });
      }

      if (!scene.narration?.trim()) {
        errors.push({
          path: `scenes[${index}].narration`,
          message: '场景配音 narration 不能为空',
        });
      }

      if (scene.type && !SUPPORTED_SCENE_TYPES.has(scene.type)) {
        errors.push({
          path: `scenes[${index}].type`,
          message: `不支持的场景类型: ${scene.type}`,
        });
      }

      if (scene.duration !== 'auto' && !isPositiveNumber(scene.duration)) {
        errors.push({
          path: `scenes[${index}].duration`,
          message: '场景时长必须为正数秒或 auto',
        });
      }

      if (requiresTitle(scene) && !scene.content.title?.trim()) {
        errors.push({
          path: `scenes[${index}].content.title`,
          message: 'intro 场景必须提供标题',
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
