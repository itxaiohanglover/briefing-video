import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface GenerateAudioCliInput {
  projectDir: string;
  pythonCommand?: string;
}

export interface GenerateAudioInvocation {
  command: string;
  args: string[];
  cwd: string;
  env?: NodeJS.ProcessEnv;
}

export const resolveGenerateAudioCliArgs = (
  args: string[],
): GenerateAudioCliInput => {
  const projectDir = args[0];
  const pythonFlagIndex = args.indexOf('--python');
  const pythonCommand =
    pythonFlagIndex >= 0 ? args[pythonFlagIndex + 1] : undefined;

  if (!projectDir) {
    throw new Error('缺少项目目录路径');
  }

  return {
    projectDir,
    pythonCommand,
  };
};

export const buildGenerateAudioInvocation = (
  input: GenerateAudioCliInput,
): GenerateAudioInvocation => {
  const command = input.pythonCommand ?? 'python';
  const scriptPath = join(
    fileURLToPath(new URL('.', import.meta.url)),
    'generate_audio.py',
  );

  return {
    command,
    args: [scriptPath],
    cwd: input.projectDir,
    env: {
      BRIEFING_VIDEO_AUDIO_NAMING: 'legacy-sequence',
    },
  };
};

export const runGenerateAudioCli = (args: string[]): void => {
  const invocation = buildGenerateAudioInvocation(resolveGenerateAudioCliArgs(args));
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: invocation.cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...invocation.env,
    },
  });

  if (result.status !== 0) {
    throw new Error(`音频生成失败，退出码: ${result.status ?? 'unknown'}`);
  }
};
