import type { SceneResolution } from './SceneFactory.ts';

const BUILTIN_SCENE_PATHS: Record<string, string> = {
  intro: './Scene01.tsx',
  slideshow: './Scene02.tsx',
  subtitle: './Scene03.tsx',
  dashboard: './Scene04.tsx',
  outro: './Scene05.tsx',
};

export const resolveSceneComponentPath = (
  resolution: SceneResolution,
): string => {
  if (resolution.kind === 'custom') {
    return `../../${resolution.file}`;
  }

  return BUILTIN_SCENE_PATHS[resolution.type] ?? './Scene03.tsx';
};
