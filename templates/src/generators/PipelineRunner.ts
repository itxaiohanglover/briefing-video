import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ParsedMarkdownDocument } from '../parser/types.ts';
import { ConfigGenerator } from './ConfigGenerator.ts';
import { SceneRegistryGenerator } from './SceneRegistryGenerator.ts';
import { TimingGenerator } from './TimingGenerator.ts';
import { SceneConfigValidator } from '../utils/SceneConfigValidator.ts';

export interface PipelineRunnerInput {
  document: ParsedMarkdownDocument;
  outputDir: string;
}

export interface PipelineRunnerResult {
  scenesPath: string;
  timingPath: string;
  sceneRegistryPath: string;
}

export class PipelineRunner {
  private readonly configGenerator = new ConfigGenerator();
  private readonly timingGenerator = new TimingGenerator();
  private readonly sceneRegistryGenerator = new SceneRegistryGenerator();
  private readonly validator = new SceneConfigValidator();

  run(input: PipelineRunnerInput): PipelineRunnerResult {
    const scenes = this.configGenerator.generate(input.document);
    const timing = this.timingGenerator.generate(input.document);

    // 验证配置
    const validationErrors = this.validator.validate(scenes.scenes);
    if (validationErrors.length > 0) {
      console.warn('Scene configuration validation warnings:');
      validationErrors.forEach((error) => {
        console.warn(
          `  Scene ${error.sceneIndex}: ${error.field} - ${error.message}`
        );
      });
    }

    const scenesPath = join(input.outputDir, 'scenes.json');
    const timingDir = join(input.outputDir, 'public', 'audio');
    const timingPath = join(timingDir, 'timing.json');
    const sceneRegistryResult = this.sceneRegistryGenerator.generate(input);

    mkdirSync(timingDir, { recursive: true });
    writeFileSync(scenesPath, JSON.stringify(scenes, null, 2));
    writeFileSync(timingPath, JSON.stringify(timing, null, 2));

    return {
      scenesPath,
      timingPath,
      sceneRegistryPath: sceneRegistryResult.outputPath,
    };
  }
}
