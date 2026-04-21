import test from 'node:test';
import assert from 'node:assert/strict';
import type { ComponentType } from 'react';
import type { SceneData, SceneProps, TimingSection } from '../../types.ts';
import {
  buildSceneAudioSrc,
  resolveSceneComponent,
  resolveTimingSection,
} from '../sceneRuntime.ts';

test('prefers exact timing section name match for a scene id', () => {
  const scene: SceneData = {
    id: 'scene-2',
    type: 'subtitle',
    enabled: true,
    narration: '第二段',
  };

  const sections: TimingSection[] = [
    {
      name: 'scene-1',
      start_frame: 0,
      end_frame: 90,
      duration_frames: 90,
      label: 'subtitle',
      sentences: [],
    },
    {
      name: 'scene-2',
      start_frame: 90,
      end_frame: 180,
      duration_frames: 90,
      label: 'subtitle',
      sentences: [],
    },
  ];

  assert.equal(resolveTimingSection(sections, scene, 1), sections[1]);
});

test('falls back to the same scene index instead of the first matching label', () => {
  const scene: SceneData = {
    id: 'scene-missing',
    type: 'subtitle',
    enabled: true,
    narration: '第二段',
  };

  const sections: TimingSection[] = [
    {
      name: 'scene-1',
      start_frame: 0,
      end_frame: 90,
      duration_frames: 90,
      label: 'subtitle',
      sentences: [],
    },
    {
      name: 'scene-2',
      start_frame: 90,
      end_frame: 180,
      duration_frames: 90,
      label: 'subtitle',
      sentences: [],
    },
  ];

  assert.equal(resolveTimingSection(sections, scene, 1), sections[1]);
});

test('builds legacy scene audio file names with two-digit padding', () => {
  assert.equal(buildSceneAudioSrc(0), 'audio/scene_01.mp3');
  assert.equal(buildSceneAudioSrc(9), 'audio/scene_10.mp3');
});

test('prefers template-specific scene component over builtin type mapping', () => {
  const intro = (() => null) as ComponentType<SceneProps>;
  const cinematic = (() => null) as ComponentType<SceneProps>;
  const components = {
    intro,
    'cinematic-intro': cinematic,
  } satisfies Record<string, ComponentType<SceneProps>>;

  const scene: SceneData = {
    id: 'scene-1',
    type: 'intro',
    template: 'cinematic-intro',
    enabled: true,
    narration: '欢迎收看。',
  };

  assert.equal(resolveSceneComponent(components, scene), cinematic);
});
