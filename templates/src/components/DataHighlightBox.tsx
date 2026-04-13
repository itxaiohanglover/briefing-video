import { useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../colors";
import { HighlightBox } from "../types";

interface DataHighlightBoxProps {
  data: HighlightBox;
  delay?: number;
}

export const DataHighlightBox: React.FC<DataHighlightBoxProps> = ({
  data,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  // 容器淡入
  const containerOpacity = interpolate(
    frame,
    [delay, delay + 30],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  // 容器缩放
  const containerScale = interpolate(
    frame,
    [delay, delay + 30],
    [0.9, 1],
    { extrapolateRight: "clamp" }
  );

  // 边框绘制动画
  const borderProgress = interpolate(
    frame,
    [delay + 10, delay + 50],
    [0, 100],
    { extrapolateRight: "clamp" }
  );

  // 数值递增动画
  const valueOpacity = interpolate(
    frame,
    [delay + 20, delay + 40],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "relative",
        border: `3px solid ${data.color || COLORS.accent}`,
        padding: "24px 32px",
        borderRadius: "16px",
        background: `${data.color || COLORS.accent}10`,
        opacity: containerOpacity,
        transform: `scale(${containerScale})`,
        boxShadow: `0 8px 32px ${(data.color || COLORS.accent)}30`,
      }}
    >
      {/* 边框动画 - 四个角 */}
      <div
        style={{
          position: "absolute",
          top: "-3px",
          left: "-3px",
          width: "20px",
          height: "20px",
          borderTop: `3px solid ${data.color || COLORS.accent}`,
          borderLeft: `3px solid ${data.color || COLORS.accent}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-3px",
          right: "-3px",
          width: "20px",
          height: "20px",
          borderTop: `3px solid ${data.color || COLORS.accent}`,
          borderRight: `3px solid ${data.color || COLORS.accent}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-3px",
          left: "-3px",
          width: "20px",
          height: "20px",
          borderBottom: `3px solid ${data.color || COLORS.accent}`,
          borderLeft: `3px solid ${data.color || COLORS.accent}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-3px",
          right: "-3px",
          width: "20px",
          height: "20px",
          borderBottom: `3px solid ${data.color || COLORS.accent}`,
          borderRight: `3px solid ${data.color || COLORS.accent}`,
        }}
      />

      {/* 内容 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* 标签 */}
        <div
          style={{
            fontSize: "24px",
            color: COLORS.textSecondary,
            fontWeight: 600,
            letterSpacing: "1px",
          }}
        >
          {data.label}
        </div>

        {/* 数值 */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: data.color || COLORS.accent,
            lineHeight: 1,
            opacity: valueOpacity,
            textShadow: `0 4px 20px ${(data.color || COLORS.accent)}40`,
          }}
        >
          {data.value}
        </div>
      </div>
    </div>
  );
};
