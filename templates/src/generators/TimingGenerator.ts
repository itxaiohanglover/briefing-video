import type { ParsedMarkdownDocument } from '../parser/types.ts';
import type { TimingData, TimingSection } from '../types.ts';

const FPS = 30;
const AUTO_SCENE_DURATION_SEC = 5;

const toDurationSeconds = (duration: number | 'auto' | undefined): number => {
  if (typeof duration === 'number') {
    return duration;
  }

  return AUTO_SCENE_DURATION_SEC;
};

export class TimingGenerator {
  generate(document: ParsedMarkdownDocument): TimingData {
    let currentFrame = 0;

    const sections: TimingSection[] = document.scenes.map((scene) => {
      const durationSec = toDurationSeconds(scene.duration);
      const durationFrames = durationSec * FPS;
      const startFrame = currentFrame;
      const endFrame = startFrame + durationFrames;

      currentFrame = endFrame;

      const narration = scene.narration.trim();

      return {
        name: scene.id,
        label: scene.type ?? 'subtitle',
        start_frame: startFrame,
        end_frame: endFrame,
        duration_frames: durationFrames,
        sentences: narration
          ? [
              {
                text: narration,
                start_frame: startFrame,
                end_frame: endFrame,
              },
            ]
          : [],
      };
    });

    return {
      fps: FPS,
      total_frames: currentFrame,
      total_duration_sec: currentFrame / FPS,
      sections,
    };
  }
}
