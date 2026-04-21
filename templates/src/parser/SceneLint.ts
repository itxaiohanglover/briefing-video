import type { ParsedMarkdownDocument } from './types.ts';

export interface LintIssue {
  path: string;
  message: string;
}

export interface LintResult {
  ok: boolean;
  warnings: LintIssue[];
}

const MAX_SCENE_COUNT = 6;
const MAX_NARRATION_LENGTH = 70;
const MAX_TEXT_LINES = 5;

export class SceneLint {
  check(document: ParsedMarkdownDocument): LintResult {
    const warnings: LintIssue[] = [];

    if (document.scenes.length > MAX_SCENE_COUNT) {
      warnings.push({
        path: 'scenes',
        message: `当前共 ${document.scenes.length} 个场景，建议合并或拆分为不超过 ${MAX_SCENE_COUNT} 个核心场景`,
      });
    }

    document.scenes.forEach((scene, index) => {
      if (scene.narration.trim().length > MAX_NARRATION_LENGTH) {
        warnings.push({
          path: `scenes[${index}].narration`,
          message: '单场景配音过长，建议拆分为多个节奏更清晰的场景',
        });
      }

      const lineCount = scene.content.text?.split('\n').filter(Boolean).length ?? 0;
      if (lineCount > MAX_TEXT_LINES) {
        warnings.push({
          path: `scenes[${index}].content.text`,
          message: '单场景文字行数过多，建议拆分内容或转为多场景呈现',
        });
      }
    });

    return {
      ok: warnings.length === 0,
      warnings,
    };
  }
}
