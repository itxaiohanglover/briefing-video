import { useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../colors";
import { TimelineStep } from "../types";

interface TimelineStepsProps {
  steps: TimelineStep[];
  delay?: number;
}

export const TimelineSteps: React.FC<TimelineStepsProps> = ({
  steps,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        alignItems: "flex-start",
        padding: "20px",
      }}
    >
      {steps.map((step, index) => {
        const stepDelay = delay + index * 15;

        // 圆圈动画
        const circleScale = interpolate(
          frame,
          [stepDelay, stepDelay + 20],
          [0, 1],
          { extrapolateRight: "clamp" }
        );

        // 进度条动画
        const progress = interpolate(
          frame,
          [stepDelay, stepDelay + 40],
          [0, step.completed ? 100 : 0],
          { extrapolateRight: "clamp" }
        );

        // 文字淡入
        const textOpacity = interpolate(
          frame,
          [stepDelay + 10, stepDelay + 30],
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
            }}
          >
            {/* 圆圈 */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: step.completed ? COLORS.accent : COLORS.surfaceLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
                transform: `scale(${circleScale})`,
                boxShadow: step.completed
                  ? `0 0 20px ${COLORS.accent}60`
                  : "none",
              }}
            >
              {step.completed && (
                <span
                  style={{
                    color: "white",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </span>
              )}
            </div>

            {/* 标签 */}
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: COLORS.textPrimary,
                marginBottom: "8px",
                textAlign: "center",
                opacity: textOpacity,
              }}
            >
              {step.label}
            </div>

            {/* 描述（可选） */}
            {step.description && (
              <div
                style={{
                  fontSize: "16px",
                  color: COLORS.textSecondary,
                  textAlign: "center",
                  opacity: textOpacity,
                }}
              >
                {step.description}
              </div>
            )}

            {/* 进度条 */}
            <div
              style={{
                width: "100%",
                height: "4px",
                background: COLORS.surfaceLight,
                borderRadius: "2px",
                marginTop: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: step.completed ? COLORS.accent : COLORS.surfaceLight,
                  borderRadius: "2px",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
