import React from 'react';

/**
 * YAxis 组件配置接口
 */
export interface YAxisProps {
  /** 刻度值数组（从下到上递增） */
  steps: number[];
  /** Y 轴高度（像素） */
  height: number;
  /** 刻度标签颜色 */
  color?: string;
  /** 刻度标签字号 */
  fontSize?: number;
  /** 右侧内边距（用于与图表区域分隔） */
  paddingRight?: number;
  /** 是否反向显示（从大到小，默认 true） */
  reverse?: boolean;
  /** 数字格式化函数 */
  formatNumber?: (value: number) => string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * Y 轴组件 - 用于图表左侧的刻度标签显示
 *
 * @example
 * ```tsx
 * // 基础用法
 * <YAxis steps={[0, 25, 50, 75, 100]} height={400} />
 *
 * // 自定义样式
 * <YAxis
 *   steps={[0, 1000, 2000, 3000]}
 *   height={300}
 *   color="#999"
 *   fontSize={18}
 *   formatNumber={(v) => `${v}万`}
 * />
 *
 * // 集成到柱状图
 * <div style={{ display: 'flex' }}>
 *   <YAxis steps={ySteps} height={chartHeight} />
 *   <div style={{ flex: 1 }}>
 *     {/* 柱状图内容 *\/}
 *   </div>
 * </div>
 * ```
 */
export const YAxis: React.FC<YAxisProps> = ({
  steps,
  height,
  color = '#999',
  fontSize = 20,
  paddingRight = 16,
  reverse = true,
  formatNumber = (value) => value.toLocaleString(),
  style,
}) => {
  // 根据 reverse 参数决定是否反转刻度
  const displaySteps = reverse ? [...steps].reverse() : steps;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height,
        paddingRight,
        ...style,
      }}
    >
      {displaySteps.map((step, index) => (
        <div
          key={`${step}-${index}`}
          style={{
            color,
            fontSize,
            textAlign: 'right',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          {formatNumber(step)}
        </div>
      ))}
    </div>
  );
};

/**
 * 辅助函数：基于数据范围自动生成刻度值
 *
 * @param minValue - 数据最小值
 * @param maxValue - 数据最大值
 * @param stepsCount - 刻度数量（默认 5）
 * @returns 刻度值数组
 *
 * @example
 * ```tsx
 * const steps = generateYAxisSteps(0, 450, 5);
 * // 返回: [0, 100, 200, 300, 400, 500]
 *
 * <YAxis steps={steps} height={400} />
 * ```
 */
export const generateYAxisSteps = (
  minValue: number,
  maxValue: number,
  stepsCount: number = 5
): number[] => {
  // 计算数据范围
  const range = maxValue - minValue;

  // 计算合适的刻度间隔（向上取整到易读的数值）
  const rawStep = range / stepsCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalizedStep = rawStep / magnitude;

  let niceStep: number;
  if (normalizedStep <= 1) {
    niceStep = magnitude;
  } else if (normalizedStep <= 2) {
    niceStep = 2 * magnitude;
  } else if (normalizedStep <= 5) {
    niceStep = 5 * magnitude;
  } else {
    niceStep = 10 * magnitude;
  }

  // 生成刻度数组
  const steps: number[] = [];
  const startValue = Math.floor(minValue / niceStep) * niceStep;
  const endValue = Math.ceil(maxValue / niceStep) * niceStep;

  for (let value = startValue; value <= endValue; value += niceStep) {
    steps.push(value);
  }

  return steps;
};