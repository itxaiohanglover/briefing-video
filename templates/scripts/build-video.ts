import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface BuildVideoCliInput {
  inputPath: string;
  outputDir?: string;
  pythonCommand?: string;
}

export interface BuildStep {
  name: 'process:new' | 'generate:audio' | 'render:video';
  command: string;
  args: string[];
  cwd: string;
}

export interface BuildVideoPlan {
  projectDir: string;
  steps: BuildStep[];
}

export const resolveBuildVideoCliArgs = (
  args: string[],
): BuildVideoCliInput => {
  const inputPath = args[0];
  const outputFlagIndex = args.indexOf('--output-dir');
  const pythonFlagIndex = args.indexOf('--python');

  if (!inputPath) {
    throw new Error('缺少 new.md 输入路径');
  }

  return {
    inputPath,
    outputDir: outputFlagIndex >= 0 ? args[outputFlagIndex + 1] : undefined,
    pythonCommand: pythonFlagIndex >= 0 ? args[pythonFlagIndex + 1] : undefined,
  };
};

export const buildBuildVideoPlan = (
  input: BuildVideoCliInput,
): BuildVideoPlan => {
  const scriptDir = fileURLToPath(new URL('.', import.meta.url));
  const projectDir = dirname(scriptDir.slice(0, -1));

  return {
    projectDir,
    steps: [
      {
        name: 'process:new',
        command: 'node',
        args: [
          '--experimental-strip-types',
          `${scriptDir}process-new.ts`,
          input.inputPath,
          '--output-dir',
          projectDir,
        ],
        cwd: projectDir,
      },
      {
        name: 'generate:audio',
        command: 'node',
        args: [
          '--experimental-strip-types',
          `${scriptDir}generate-audio.ts`,
          projectDir,
          ...(input.pythonCommand ? ['--python', input.pythonCommand] : []),
        ],
        cwd: projectDir,
      },
      {
        name: 'render:video',
        command: 'npx',
        args: ['remotion', 'render', 'src/index.ts', 'NewsVideo', join(input.outputDir ?? projectDir, 'out', 'video.mp4')],
        cwd: projectDir,
      },
    ],
  };
};

export const runBuildVideoCli = (args: string[]): void => {
  const plan = buildBuildVideoPlan(resolveBuildVideoCliArgs(args));

  for (const step of plan.steps) {
    const result = spawnSync(step.command, step.args, {
      cwd: step.cwd,
      stdio: 'inherit',
      shell: false,
    });

    if (result.status !== 0) {
      throw new Error(`${step.name} 失败，退出码: ${result.status ?? 'unknown'}`);
    }
  }
};
