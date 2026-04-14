/**
 * 动画配置中心
 * 统一管理所有动画的时序、缓动函数、延迟参数
 */

export const ANIMATION_CONFIG = {
  // 场景入场动画
  scene: {
    fadeIn: {
      duration: 20, // 帧数 (30fps ≈ 0.67s)
      startFrame: 0,
    },
    scaleIn: {
      duration: 25, // 帧数 (30fps ≈ 0.83s)
      startFrame: 0,
      from: 0.9,
      to: 1,
    },
  },

  // Scene03 动画时序
  scene03: {
    keywords: {
      delay: 20, // 起始帧
      itemDelay: 10, // 每个关键词间隔
    },
    highlightBox: {
      delay: 30,
    },
    content: {
      delay: 0,
      lineDelay: 10, // 每行文字间隔
    },
    newsBadge: {
      delay: 5,
      duration: 20,
    },
    timeline: {
      delay: 50,
      stepDelay: 12, // 每个步骤间隔
    },
  },

  // Scene04 动画时序
  scene04: {
    dataCards: {
      delay: 0,
      cardDelay: 8, // 每个卡片间隔
      numberDuration: 40, // 数字递增时长
    },
    barChart: {
      delay: 60,
      barDelay: 10, // 每个柱子间隔
      growDuration: 40,
    },
    lineChart: {
      delay: 80,
      drawDuration: 60, // 线条绘制时长
      pointDelay: 8, // 每个数据点间隔
    },
    chainNodes: {
      delay: 0,
      nodeDelay: 12,
    },
  },

  // Scene05 动画时序
  scene05: {
    logo: {
      startFrame: 0,
    },
    title: {
      startFrame: 0,
    },
    typewriter: {
      startFrame: 40,
      charDelay: 3, // 每个字符间隔
    },
    decor: {
      fadeIn: [30, 50],
    },
    cta: {
      startFrame: 70,
      buttonDelay: 10, // 每个按钮间隔
    },
  },

  // 图表动画配置
  chart: {
    bar: {
      growDuration: 40,
      fadeInDuration: 20,
    },
    line: {
      drawDuration: 60,
      areaFadeDuration: 30,
      pointDelay: 8,
      pointPopDuration: 15,
    },
    gauge: {
      animateDuration: 60,
    },
  },

  // 通用组件动画
  component: {
    fadeInUp: {
      duration: 20,
      yOffset: 30, // 上浮距离
    },
    scaleIn: {
      duration: 15,
    },
    pulse: {
      duration: 60, // 脉冲周期
    },
  },
} as const;

/**
 * Spring 动画配置
 */
export const SPRING_CONFIG = {
  // 默认 - 快速弹性
  default: {
    stiffness: 120,
    damping: 20,
  },

  // 柔和 - 缓慢弹性
  soft: {
    stiffness: 80,
    damping: 15,
  },

  // 弹跳 - 高弹性
  bouncy: {
    stiffness: 200,
    damping: 10,
  },

  // 平滑 - 几乎无弹性
  smooth: {
    stiffness: 100,
    damping: 25,
  },
} as const;

/**
 * 辅助函数：计算延迟
 */
export const calculateDelay = (baseDelay: number, index: number, itemDelay: number) => {
  return baseDelay + index * itemDelay;
};

/**
 * 辅助函数：检查帧是否在动画范围内
 */
export const isFrameInRange = (frame: number, startFrame: number, duration: number) => {
  return frame >= startFrame && frame <= startFrame + duration;
};
