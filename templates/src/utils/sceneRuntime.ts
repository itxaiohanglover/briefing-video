import type { ComponentType } from 'react';
import type { SceneData, SceneProps, TimingSection } from '../types.ts';

export const buildSceneAudioSrc = (index: number): string => {
  return `audio/scene_${String(index + 1).padStart(2, '0')}.mp3`;
};

export const resolveTimingSection = (
  sections: TimingSection[],
  scene: SceneData,
  index: number,
): TimingSection | undefined => {
  return (
    sections.find((section) => section.name === scene.id) ??
    sections[index] ??
    sections.find((section) => section.label === scene.type)
  );
};

export const resolveSceneComponent = <T extends ComponentType<SceneProps>>(
  components: Record<string, T>,
  scene: Pick<SceneData, 'type' | 'template'>,
): T | undefined => {
  return (scene.template ? components[scene.template] : undefined) ?? components[scene.type];
};
