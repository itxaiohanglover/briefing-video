import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ParsedScene } from './types.ts';

export interface MaterialMapping {
  file: string;
  scene: string;
}

const isFile = (path: string): boolean => statSync(path).isFile();

export class MaterialMapper {
  map(materialsDir: string, scenes: ParsedScene[]): MaterialMapping[] {
    const files = readdirSync(materialsDir)
      .filter((file) => isFile(join(materialsDir, file)));

    return files.map((file) => {
      const matchedScene = scenes.find((scene) => scene.content.image?.includes(file)) ?? scenes[0];

      return {
        file,
        scene: matchedScene.id ?? `scene-${matchedScene.index}`,
      };
    });
  }
}
