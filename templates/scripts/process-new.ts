import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PipelineRunnerResult } from '../src/generators/PipelineRunner.ts';
import { PipelineRunner } from '../src/generators/PipelineRunner.ts';
import { MarkdownParser } from '../src/parser/MarkdownParser.ts';

export interface ProcessNewDocumentInput {
  inputPath: string;
  outputDir?: string;
}

export const processNewDocument = (
  input: ProcessNewDocumentInput,
): PipelineRunnerResult => {
  const markdown = readFileSync(input.inputPath, 'utf-8');
  const parser = new MarkdownParser();
  const runner = new PipelineRunner();

  const document = parser.parse(markdown);
  const outputDir = input.outputDir ?? dirname(input.inputPath);

  return runner.run({
    document,
    outputDir,
  });
};

export const resolveProcessNewCliArgs = (
  args: string[],
): ProcessNewDocumentInput => {
  const inputPath = args[0];
  const outputFlagIndex = args.indexOf('--output-dir');
  const outputDir =
    outputFlagIndex >= 0 ? args[outputFlagIndex + 1] : undefined;

  if (!inputPath) {
    throw new Error('缺少 new.md 输入路径');
  }

  return {
    inputPath,
    outputDir,
  };
};

export const runProcessNewCli = (args: string[]): PipelineRunnerResult => {
  return processNewDocument(resolveProcessNewCliArgs(args));
};

const entryPath = process.argv[1];
const currentPath = fileURLToPath(import.meta.url);

if (entryPath && currentPath === entryPath) {
  runProcessNewCli(process.argv.slice(2));
}
