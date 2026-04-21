export interface ParsedDurationRange {
  min: number;
  max: number;
}

export interface ParsedResolution {
  width: number;
  height: number;
}

export interface ParsedMetadata {
  title: string;
  style?: string;
  duration?: ParsedDurationRange;
  resolution?: ParsedResolution;
  backgroundMusic?: string;
  colorScheme?: string;
}

export interface ParsedSceneContent {
  title?: string;
  subtitle?: string;
  image?: string;
  layout?: string;
  text?: string;
  highlight?: string;
}

export interface ParsedScene {
  id: string;
  index: number;
  name: string;
  type?: string;
  template?: string;
  duration?: number | 'auto';
  narration: string;
  content: ParsedSceneContent;
}

export interface ParsedMarkdownDocument {
  metadata: ParsedMetadata;
  scenes: ParsedScene[];
}
