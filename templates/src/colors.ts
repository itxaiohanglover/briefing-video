// 配色常量 - 新闻简报风格
// 基于深蓝暗色系 + 红粉强调色

export const COLORS = {
  // 背景渐变
  bgIntro: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  bgSubtitle: 'linear-gradient(180deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%)',
  bgDashboard: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)',
  bgOutro: 'linear-gradient(180deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%)',
  bgSlideshow: '#000000',

  // 文字
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.8)',
  textMuted: 'rgba(255,255,255,0.6)',

  // 强调色
  accent: '#e94560',
  accentLight: 'rgba(233, 69, 96, 0.3)',
  accentGlow: 'rgba(233, 69, 96, 0.15)',
  accentBoxShadow: 'rgba(233, 69, 96, 0.4)',

  // 数据卡片色
  cardColors: ['#e94560', '#00d9ff', '#f9a825', '#00e676'] as const,

  // 表面/卡片
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceLight: 'rgba(255,255,255,0.12)',
  borderLight: 'rgba(255,255,255,0.15)',
  borderFaint: 'rgba(255,255,255,0.1)',

  // 遮罩
  overlayVignette: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
  gradientBlend: (color: string) => `linear-gradient(to right, transparent, ${color})`,

  // 阴影
  shadowCard: '0 25px 50px rgba(0,0,0,0.3)',
  shadowLabel: '0 4px 15px rgba(233, 69, 96, 0.4)',
  shadowCaption: '0 8px 32px rgba(0,0,0,0.3)',
  shadowText: '0 2px 10px rgba(0,0,0,0.5)',
} as const;
