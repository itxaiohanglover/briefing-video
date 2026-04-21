import { Scene01 } from './Scene01.tsx';
import { Scene02 } from './Scene02.tsx';
import { Scene03 } from './Scene03.tsx';
import { Scene04 } from './Scene04.tsx';
import { Scene05 } from './Scene05.tsx';
import type { ComponentType } from 'react';
import type { SceneProps } from '../types.ts';

export const sceneComponents: Record<string, ComponentType<SceneProps>> = {
  intro: Scene01,
  slideshow: Scene02,
  subtitle: Scene03,
  dashboard: Scene04,
  outro: Scene05,
};
