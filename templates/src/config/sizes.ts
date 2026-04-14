/**
 * 样式配置中心
 * 统一管理尺寸、间距、字体等样式常量
 * 支持响应式计算（基于视频尺寸）
 */

import { Dimensions } from "../types";

/**
 * 响应式尺寸计算
 */
export const createResponsiveSizes = (dimensions: Dimensions) => {
  const { width, height } = dimensions;

  return {
    // 间距（基于宽度百分比）
    spacing: {
      xs: Math.round(width * 0.0185),  // 20px ≈ 1.85% of 1080
      sm: Math.round(width * 0.0278),  // 30px ≈ 2.78% of 1080
      md: Math.round(width * 0.037),   // 40px ≈ 3.7% of 1080
      lg: Math.round(width * 0.0556),  // 60px ≈ 5.56% of 1080
      xl: Math.round(width * 0.074),   // 80px ≈ 7.4% of 1080
      xxl: Math.round(width * 0.0926), // 100px ≈ 9.26% of 1080
    },

    // 字体大小（基于高度百分比）
    fontSize: {
      xs: Math.round(height * 0.017),   // 32px ≈ 1.7% of 1920
      sm: Math.round(height * 0.021),   // 40px ≈ 2.1% of 1920
      base: Math.round(height * 0.026), // 50px ≈ 2.6% of 1920
      lg: Math.round(height * 0.029),   // 56px ≈ 2.9% of 1920
      xl: Math.round(height * 0.037),   // 72px ≈ 3.7% of 1920
      xxl: Math.round(height * 0.044),  // 84px ≈ 4.4% of 1920
      xxxl: Math.round(height * 0.062), // 120px ≈ 6.2% of 1920
    },

    // 圆角
    borderRadius: {
      sm: "4px",
      md: "8px",
      lg: "12px",
      xl: "16px",
      xxl: "24px",
      full: "50%",
    },

    // 图表尺寸
    chart: {
      barWidth: 0.8,          // 柱子宽度占可用空间的百分比
      barGap: 32,             // 柱子间距（px）
      pointRadius: 8,         // 数据点半径
      pointInnerRadius: 5,    // 数据点内圈半径
      strokeWidth: 4,         // 线条宽度
      gridLines: 5,           // 网格线数量
    },

    // 卡片尺寸
    card: {
      padding: {
        compact: "12px 16px",  // 紧凑模式
        normal: "16px 20px",   // 正常模式
        spacious: "20px 24px", // 宽松模式
      },
    },

    // 场景布局高度分配
    layout: {
      scene03: {
        top: "60%",     // 顶部内容区域
        bottom: "30%",  // 底部时间轴区域
        padding: "20px 80px 120px", // 内边距
      },
      scene04: {
        title: "5%",     // 标题区域
        dataCards: "20%", // 数据卡片区域
        barChart: "30%",  // 柱状图区域
        lineChart: "25%", // 曲线图区域
        padding: "10px 80px", // 内边距
      },
      scene05: {
        top: "8%",       // 顶部 CTA 区域
        center: "50%",   // 中间内容区域
      },
    },

    // 动画尺寸
    animation: {
      pulseScale: 1.1,        // 脉冲缩放倍数
      hoverScale: 1.05,       // 悬停缩放倍数
      pressScale: 0.95,       // 按压缩放倍数
      rotateBadge: -90,       // 徽章初始旋转角度
      translateY: 20,         // 上浮距离
      translateX: 30,         // 右移距离
    },

    // 网格背景
    grid: {
      size: 50,              // 网格单元大小
      opacity: 0.08,         // 线条透明度
    },

    // 阴影
    shadow: {
      sm: "0 2px 8px rgba(0,0,0,0.1)",
      md: "0 4px 15px rgba(0,0,0,0.2)",
      lg: "0 8px 30px rgba(0,0,0,0.3)",
      xl: "0 25px 50px rgba(0,0,0,0.4)",
    },

    // z-index 层级
    zIndex: {
      background: -1,
      base: 0,
      decor: 1,
      content: 10,
      overlay: 100,
      modal: 1000,
    },
  };
};

/**
 * 默认尺寸（1080×1920 竖屏）
 */
export const DEFAULT_SIZES = createResponsiveSizes({
  width: 1080,
  height: 1920,
});

/**
 * 尺寸工具函数
 */
export const sizeTools = {
  /**
   * 基于宽度计算百分比
   */
  wp: (percentage: number, screenWidth: number) => {
    return Math.round(screenWidth * (percentage / 100));
  },

  /**
   * 基于高度计算百分比
   */
  hp: (percentage: number, screenHeight: number) => {
    return Math.round(screenHeight * (percentage / 100));
  },

  /**
   * 响应式字体大小（最小值、首选值、最大值）
   */
  responsiveFontSize: (
    min: number,
    preferred: number,
    max: number,
    screenHeight: number
  ) => {
    const preferredPercent = (preferred / screenHeight) * 100;
    const minPercent = (min / screenHeight) * 100;
    const maxPercent = (max / screenHeight) * 100;

    return `clamp(${minPercent}vh, ${preferredPercent}vh, ${maxPercent}vh)`;
  },

  /**
   * 计算间距（基于 8px 栅格）
   */
  space: (multiplier: number) => {
    return `${multiplier * 8}px`;
  },
};
