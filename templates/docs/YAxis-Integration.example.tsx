/**
 * YAxis 组件集成示例
 *
 * 本文件展示如何在 BarChart 中集成 YAxis 组件
 * 注意：这只是示例代码，不会实际运行
 */

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { YAxis, generateYAxisSteps } from '../components';
import { COLORS } from '../colors';
import { BarChartData } from '../types';

/**
 * 示例 1: 基础柱状图集成 YAxis
 */
interface BarChartWithYAxisProps {
  data: BarChartData[];
  height?: number;
  delay?: number;
}

export const BarChartWithYAxis: React.FC<BarChartWithYAxisProps> = ({
  data,
  height = 200,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const maxValue = Math.max(...data.map((d) => d.value));

  // 自动生成 Y 轴刻度
  const yAxisSteps = generateYAxisSteps(0, maxValue, 5);

  return (
    <div style={{ display: 'flex', gap: '16px', height: `${height}px` }}>
      {/* Y 轴 */}
      <YAxis
        steps={yAxisSteps}
        height={height}
        color={COLORS.textSecondary}
        fontSize={16}
        paddingRight={12}
      />

      {/* 柱状图区域 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: '32px',
          alignItems: 'flex-end',
          height: `${height}px`,
          padding: '20px 0',
        }}
      >
        {data.map((item, index) => {
          const itemDelay = delay + index * 10;
          const barHeight = interpolate(
            frame,
            [itemDelay, itemDelay + 40],
            [0, Math.min((item.value / maxValue) * (height - 40), height - 40)],
            {
              easing: (t) => t * (2 - t),
              extrapolateRight: 'clamp',
            }
          );

          return (
            <div
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* 柱子 */}
              <div
                style={{
                  width: '80%',
                  height: `${barHeight}px`,
                  background:
                    item.color || COLORS.cardColors[index % COLORS.cardColors.length],
                  borderRadius: '8px 8px 0 0',
                }}
              />
              {/* 标签 */}
              <div
                style={{
                  marginTop: '16px',
                  fontSize: '22px',
                  color: COLORS.textSecondary,
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 示例 2: 自定义格式的 YAxis
 */
export const BarChartWithFormattedYAxis: React.FC<BarChartWithYAxisProps> = ({
  data,
  height = 300,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  // 使用万为单位格式化
  const yAxisSteps = generateYAxisSteps(0, maxValue, 5);

  return (
    <div style={{ display: 'flex', gap: '16px', height: `${height}px` }}>
      <YAxis
        steps={yAxisSteps}
        height={height}
        color="#666"
        fontSize={18}
        formatNumber={(value) => {
          if (value >= 10000) {
            return `${(value / 10000).toFixed(1)}万`;
          }
          return value.toLocaleString();
        }}
      />
      {/* ... 柱状图内容 ... */}
    </div>
  );
};

/**
 * 示例 3: 带网格线的 YAxis（高级用法）
 */
export const BarChartWithGrid: React.FC<BarChartWithYAxisProps> = ({
  data,
  height = 300,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const yAxisSteps = generateYAxisSteps(0, maxValue, 5);
  const stepHeight = height / (yAxisSteps.length - 1);

  return (
    <div style={{ display: 'flex', gap: '16px', height: `${height}px` }}>
      <YAxis steps={yAxisSteps} height={height} />

      <div style={{ flex: 1, position: 'relative' }}>
        {/* 网格线 */}
        {yAxisSteps.map((step, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${index * stepHeight}px`,
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
        ))}

        {/* 柱状图 */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'flex-end',
            height: '100%',
            padding: '0 20px',
          }}
        >
          {/* ... 柱状图柱子 ... */}
        </div>
      </div>
    </div>
  );
};

/**
 * 完整使用示例
 */
export const ExampleUsage: React.FC = () => {
  const sampleData: BarChartData[] = [
    { label: '一月', value: 4500, color: '#4F46E5' },
    { label: '二月', value: 6200, color: '#7C3AED' },
    { label: '三月', value: 3800, color: '#06B6D4' },
    { label: '四月', value: 5100, color: '#10B981' },
  ];

  return (
    <div style={{ padding: '40px' }}>
      <h2 style={{ color: '#fff', marginBottom: '32px' }}>销售数据统计</h2>
      <BarChartWithYAxis data={sampleData} height={400} delay={10} />
    </div>
  );
};

/**
 * 集成步骤说明：
 *
 * 1. 导入组件
 *    import { YAxis, generateYAxisSteps } from '../components';
 *
 * 2. 计算刻度值
 *    const maxValue = Math.max(...data.map(d => d.value));
 *    const yAxisSteps = generateYAxisSteps(0, maxValue, 5);
 *
 * 3. 布局组合
 *    <div style={{ display: 'flex' }}>
 *      <YAxis steps={yAxisSteps} height={chartHeight} />
 *      <div style={{ flex: 1 }}>{/* 柱状图 *\/}</div>
 *    </div>
 *
 * 4. 对齐调整
 *    - 确保 YAxis 高度与柱状图区域高度一致
 *    - 使用 justifyContent: 'space-between' 自动分布刻度
 *    - 通过 paddingRight 控制轴与图的间距
 *
 * 5. 样式自定义
 *    - color: 刻度标签颜色
 *    - fontSize: 刻度标签字号
 *    - formatNumber: 自定义格式化函数（如添加单位）
 */