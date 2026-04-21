import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface TemplateRegistryEntry {
  name: string;
  file: string;
}

interface TemplateRegistry {
  scenes?: Record<string, TemplateRegistryEntry>;
  animations?: Record<string, TemplateRegistryEntry>;
  colors?: Record<string, TemplateRegistryEntry>;
}

export class TemplateLoader {
  private readonly registry: TemplateRegistry;
  private readonly projectDir: string;

  constructor(projectDir: string) {
    this.projectDir = projectDir;
    const registryPath = join(this.projectDir, 'user-templates', 'registry.json');

    this.registry = existsSync(registryPath)
      ? (JSON.parse(readFileSync(registryPath, 'utf-8')) as TemplateRegistry)
      : {};
  }

  getScene(sceneId: string): TemplateRegistryEntry | null {
    return this.registry.scenes?.[sceneId] ?? null;
  }

  getAnimation(animationId: string): TemplateRegistryEntry | null {
    return this.registry.animations?.[animationId] ?? null;
  }

  getColor(colorId: string): TemplateRegistryEntry | null {
    return this.registry.colors?.[colorId] ?? null;
  }
}
