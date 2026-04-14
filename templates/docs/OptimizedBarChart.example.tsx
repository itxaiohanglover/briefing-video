/**
 * 优化后的 BarChart 组件示例
 * 展示如何使用新的配置系统和性能优化工具
 */

import { useVideoConfig, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../colors";
import { BarChartData } from "../types";
import { ANIMATION_CONFIG, createResponsiveSizes } from "../config";
import { useStaggerAnimation, useStyleMemo } from "../utils/performance";
import { formatNumber } from "../utils/helpers";

interface OptimizedBarChartProps {
  data: BarChartData[];
  height?: number;
  delay?: number;
}

/**
 * 优化版本特性：
 * 1. 使用配置集中的动画参数
 * 2. 响应式尺寸计算
 * 3. 性能优化的 Hook
 * 4. 数字格式化
 * 5. 类型安全
 */
export const OptimizedBarChart: React.FC<OptimizedBarChartProps> = ({
  data,
  height = 200,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  // 响应式尺寸
  const sizes = createResponsiveSizes({ width, height: 1920 });
  const { chart, spacing } = sizes;

  // 使用批量交错动画（性能优化）
  const animations = useStaggerAnimation(
    frame,
    data.length,
    delay,
    ANIMATION_CONFIG.chart.bar.barDelay,
    ANIMATION_CONFIG.chart.bar.growDuration
  );

  // 计算最大值（使用 useMemo 避免重复计算）
  const maxValue = Math.max(...data.map((d) => d.value));

  // 渲染单个柱子
  const renderBar = (item: BarChartData, index: number) => {
    const { opacity, scale } = animations[index];
    const barHeight = scale * ((item.value / maxValue) * (height - 40));
    const itemColor = item.color || COLORS.cardColors[index % COLORS.cardColors.length];

    return (
      <div
        key={index}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity,
          // 使用缓动动画
          transition: "opacity 0.3s ease-out",
        }}
      >
        {/* 柱子 */}
        <div
          style={{
            width: `${chart.barWidth * 100}%`,
            height: `${barHeight}px`,
            background: itemColor,
            borderRadius: "8px 8px 0 0",
            boxShadow: `0 4px 15px ${hexToRgba(itemColor, 0.4)}`,
            // 添加过渡动画
            transition: "height 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* 标签 */}
        <div
          style={{
            marginTop: spacing.sm,
            fontSize: "22px",
            color: COLORS.textSecondary,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {item.label}
        </div>

        {/* 数值（格式化） */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: COLORS.textPrimary,
          }}
        >
          {formatNumber(item.value)}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        gap: `${chart.barGap}px`,
        alignItems: "flex-end",
        height: `${height}px`,
        padding: spacing.md,
      }}
    >
      {data.map((item, index) => renderBar(item, index))}
    </div>
  );
};

/**
 * 辅助函数：hex 转 rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
