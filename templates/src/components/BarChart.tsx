import { useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../colors";
import { BarChartData } from "../types";

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  delay?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,  // 增大默认高度
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div
      style={{
        display: "flex",
        gap: "32px",
        alignItems: "flex-end",
        height: `${height}px`,
        padding: "20px",
      }}
    >
      {data.map((item, index) => {
        const itemDelay = delay + index * 10;
        const barHeight = interpolate(
          frame,
          [itemDelay, itemDelay + 40],
          [0, Math.min((item.value / maxValue) * (height - 40), height - 40)],  // 调整为 height - 40
          { extrapolateRight: "clamp" }
        );
        const opacity = interpolate(
          frame,
          [itemDelay, itemDelay + 20],
          [0, 1],
          { extrapolateRight: "clamp" }
        );

        return (
          <div
            key={index}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity,
            }}
          >
            {/* 柱子 */}
            <div
              style={{
                width: "80%",  // 增大柱子宽度
                height: `${barHeight}px`,
                background: item.color || COLORS.cardColors[index % COLORS.cardColors.length],
                borderRadius: "8px 8px 0 0",
                boxShadow: `0 4px 15px ${(item.color || COLORS.cardColors[index % COLORS.cardColors.length])}40`,
              }}
            />
            {/* 标签 */}
            <div
              style={{
                marginTop: "16px",
                fontSize: "22px",  // 增大字号
                color: COLORS.textSecondary,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {item.label}
            </div>
            {/* 数值 */}
            <div
              style={{
                fontSize: "28px",  // 增大字号
                fontWeight: "bold",
                color: COLORS.textPrimary,
              }}
            >
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
