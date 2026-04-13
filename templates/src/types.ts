// 核心类型定义

export type Orientation = 'portrait' | 'landscape';
export type SceneType = 'intro' | 'slideshow' | 'subtitle' | 'dashboard' | 'outro';
export type LayoutType = 'split' | 'background' | 'solid';

export interface Dimensions {
  width: number;
  height: number;
}

export interface MetricData {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  color?: string;
  // 历史数据（用于迷你曲线图）
  history?: number[];
  // 图表类型（可选，覆盖默认类型）
  chartType?: 'bar' | 'line' | 'gauge' | 'number';
}

export interface ChainNode {
  id: string;
  label: string;
  icon?: string;
}

// 图表数据类型
export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  label: string;
  data: number[];
  color?: string;
}

export interface GaugeData {
  label: string;
  value: number; // 0-100
  suffix?: string;
}

// 关键词卡片数据
export interface KeywordCard {
  text: string;
  color?: string;
}

// 时间轴步骤数据
export interface TimelineStep {
  label: string;
  completed: boolean;
  description?: string;
}

// 数据高亮框数据
export interface HighlightBox {
  value: string;
  label: string;
  color?: string;
}

export interface SceneData {
  id: string;
  type: SceneType;
  enabled: boolean;
  narration: string;
  title?: string;
  subtitle?: string;

  // 布局
  layout?: LayoutType;

  // 图片
  image?: string;
  images?: string[];
  captions?: string[];
  imagePosition?: 'left' | 'right';
  imageWidth?: number;
  imageOpacity?: number;
  kenBurns?: boolean;

  // 样式
  bgBlur?: boolean;
  newsBadge?: boolean;
  newsTicker?: boolean;

  // 数据
  metrics?: MetricData[];
  dataCards?: MetricData[]; // 兼容旧名称

  // 产业链流程（可选）
  chainNodes?: ChainNode[];

  // 字幕内容
  content?: string;
  highlight?: string;

  // Scene03 增强：关键词、时间轴、高亮框
  keywords?: KeywordCard[];
  timeline?: TimelineStep[];
  highlightBox?: HighlightBox;

  // Scene04 增强：图表数据
  barChart?: BarChartData[];
  lineChart?: LineChartData;
  gaugeChart?: GaugeData;
}

export interface VideoConfig {
  title: string;
  totalDuration: number;
  orientation: Orientation;
  source: string;
  scenes: SceneData[];
}

export interface SceneProps {
  sceneData: SceneData;
  durationInFrames: number;
}

// TTS 配置
export interface TTSConfig {
  provider: 'edge-tts' | 'minimax';
  voiceId?: string;
  speed?: number;
}

// 字幕配置
export interface SubtitleConfig {
  enabled: boolean;
  highlightCurrent: boolean;
  backgroundOpacity: number;
  fontSize: number;
  position: 'top' | 'center' | 'bottom';
}

// 时间轴数据
export interface SentenceTiming {
  text: string;
  start_frame: number;
  end_frame: number;
}

export interface TimingSection {
  name: string;
  start_frame: number;
  end_frame: number;
  duration_frames: number;
  label: string;
  sentences: SentenceTiming[];
}

export interface TimingData {
  fps: number;
  total_frames: number;
  total_duration_sec: number;
  sections: TimingSection[];
}
