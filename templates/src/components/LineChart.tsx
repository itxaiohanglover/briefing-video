import { useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../colors";
import { LineChartData } from "../types";

interface LineChartProps {
  data: LineChartData;
  height?: number;
  delay?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,  // 增大默认高度
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const maxValue = Math.max(...data.data);
  const points = data.data.map(
    (val, i) => `${i * 60},${height - (val / maxValue) * (height - 20)}`
  ).join(" ");

  // 线条绘制动画（添加缓动）
  const pathLength = 2000;
  const strokeDashoffset = interpolate(
    frame,
    [delay, delay + 60],
    [pathLength, 0],
    {
      easing: (t) => t * (2 - t), // Easing.out(Easing.quad) - 平滑绘制
      extrapolateRight: "clamp",
    }
  );

  return (
    <div style={{ width: "100%", height: `${height}px`, position: "relative" }}>
      <svg
        viewBox={`0 0 ${(data.data.length - 1) * 60} ${height}`}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Y 轴网格线 */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="0"
            y1={i * (height / 4)}
            x2={(data.data.length - 1) * 60}
            y2={i * (height / 4)}
            stroke={COLORS.borderFaint}
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* 区域填充（渐变） */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={data.color || COLORS.accent} stopOpacity="0.3" />
            <stop offset="100%" stopColor={data.color || COLORS.accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 填充区域 */}
        <polygon
          points={`0,${height} ${points} ${(data.data.length - 1) * 60},${height}`}
          fill="url(#areaGradient)"
          opacity={interpolate(frame, [delay, delay + 30], [0, 0.5], {
            extrapolateRight: "clamp",
          })}
        />

        {/* 曲线 */}
        <path
          d={`M ${points}`}
          stroke={data.color || COLORS.accent}
          strokeWidth="4"
          fill="none"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 数据点 */}
        {data.data.map((val, i) => {
          const pointDelay = delay + i * 8;
          const opacity = interpolate(
            frame,
            [pointDelay, pointDelay + 15],
            [0, 1],
            { extrapolateRight: "clamp" }
          );
          const scale = interpolate(
            frame,
            [pointDelay, pointDelay + 15],
            [0, 1],
            { extrapolateRight: "clamp" }
          );

          return (
            <g key={i}>
              {/* 外圈 */}
              <circle
                cx={i * 60}
                cy={height - (val / maxValue) * (height - 20)}
                r="8"
                fill={data.color || COLORS.accent}
                opacity={opacity * 0.3}
                transform={`scale(${scale})`}
                style={{ transformOrigin: `${i * 60}px ${height - (val / maxValue) * (height - 20)}px` }}
              />
              {/* 内圈 */}
              <circle
                cx={i * 60}
                cy={height - (val / maxValue) * (height - 20)}
                r="5"
                fill={COLORS.surface}
                stroke={data.color || COLORS.accent}
                strokeWidth="2"
                opacity={opacity}
                transform={`scale(${scale})`}
                style={{ transformOrigin: `${i * 60}px ${height - (val / maxValue) * (height - 20)}px` }}
              />
            </g>
          );
        })}
      </svg>

      {/* 标题 */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          fontSize: "18px",
          color: COLORS.textSecondary,
          fontWeight: 600,
          opacity: interpolate(frame, [delay, delay + 20], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {data.label}
      </div>
    </div>
  );
};
