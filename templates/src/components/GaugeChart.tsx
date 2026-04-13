import { useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../colors";
import { GaugeData } from "../types";

interface GaugeChartProps {
  data: GaugeData;
  size?: number;
  delay?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  data,
  size = 150,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  // 进度动画
  const progress = interpolate(
    frame,
    [delay, delay + 50],
    [0, data.value / 100],
    { extrapolateRight: "clamp" }
  );

  // 容器淡入
  const opacity = interpolate(
    frame,
    [delay, delay + 20],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  // 数字递增动画
  const numberValue = Math.floor(data.value * progress);

  return (
    <div
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        opacity,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          width: "100%",
          height: "100%",
          transform: "rotate(-90deg)",
        }}
      >
        {/* 背景圆环 */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={COLORS.surfaceLight}
          strokeWidth="12"
          fill="none"
        />

        {/* 进度圆环 */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={COLORS.accent}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${COLORS.accent})`,
          }}
        />

        {/* 刻度线 */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * 360;
          const x1 = 50 + (radius + 8) * Math.cos((angle * Math.PI) / 180);
          const y1 = 50 + (radius + 8) * Math.sin((angle * Math.PI) / 180);
          const x2 = 50 + (radius + 15) * Math.cos((angle * Math.PI) / 180);
          const y2 = 50 + (radius + 15) * Math.sin((angle * Math.PI) / 180);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i / 4 <= progress ? COLORS.accent : COLORS.surfaceLight}
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* 中心内容 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        {/* 百分比数字 */}
        <div
          style={{
            fontSize: `${size * 0.25}px`,
            fontWeight: "bold",
            color: COLORS.textPrimary,
            lineHeight: 1,
          }}
        >
          {numberValue}
          <span
            style={{
              fontSize: `${size * 0.15}px`,
              color: COLORS.textSecondary,
            }}
          >
            %
          </span>
        </div>

        {/* 标签 */}
        <div
          style={{
            fontSize: `${size * 0.1}px`,
            color: COLORS.textSecondary,
            marginTop: "4px",
            fontWeight: 500,
          }}
        >
          {data.label}
        </div>
      </div>
    </div>
  );
};
