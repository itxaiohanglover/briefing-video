// 配色常量 - 新闻风格

export const COLORS = {
  // 背景
  bgPrimary: '#0a0a0f',
  bgSecondary: '#1a1a2e',
  gradientBg: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',

  // 文字
  textPrimary: '#ffffff',
  textSecondary: '#a0a8c0',
  textMuted: '#6b7280',

  // 强调色
  accent: '#007AFF',
  highlight: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',

  // 卡片/表面
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceHover: 'rgba(255, 255, 255, 0.12)',

  // 边框
  border: 'rgba(255, 255, 255, 0.15)',

  // 遮罩
  overlay: 'rgba(5, 5, 16, 0.40)',
  overlayStrong: 'rgba(5, 5, 16, 0.72)',

  // 阴影
  shadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
  shadowLight: '0 4px 20px rgba(0, 0, 0, 0.3)',
} as const;

// 场景特定配色
export const SCENE_COLORS = {
  intro: {
    title: COLORS.textPrimary,
    subtitle: COLORS.textSecondary,
    accent: COLORS.highlight,
  },
  slideshow: {
    caption: COLORS.textPrimary,
    overlay: COLORS.overlay,
  },
  subtitle: {
    text: COLORS.textPrimary,
    badge: COLORS.highlight,
    background: 'rgba(0, 0, 0, 0.20)',
  },
  dashboard: {
    number: COLORS.accent,
    label: COLORS.textSecondary,
    cardBg: COLORS.surface,
  },
  outro: {
    title: COLORS.textPrimary,
    subtitle: COLORS.textSecondary,
    ticker: COLORS.highlight,
  },
} as const;
