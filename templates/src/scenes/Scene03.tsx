import { useVideoConfig, useCurrentFrame, interpolate } from "remotion";
import { TimedSubtitles } from "../components/TimedSubtitles";
import { SceneData, TimingSection } from "../types";
import { COLORS } from "../colors";

interface SceneProps {
  sceneData: SceneData;
  durationInFrames: number;
  timing?: TimingSection;
}

export const Scene03: React.FC<SceneProps> = ({ sceneData, durationInFrames, timing }) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  const { content, highlight } = sceneData;

  // 入场动画
  const containerOpacity = interpolate(
    frame,
    [0, 20],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const containerScale = interpolate(
    frame,
    [0, 25],
    [0.9, 1],
    { extrapolateRight: "clamp" }
  );

  // 文字逐行显示效果
  const lines: string[] = (content?.split("\n") || []).filter(Boolean);
  const lineDelay = 10; // 每行延迟10帧

  // NEWS 角标动画
  const badgeRotate = interpolate(
    frame,
    [5, 25],
    [-90, 0],
    { extrapolateRight: "clamp" }
  );

  const badgeOpacity = interpolate(
    frame,
    [5, 25],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  // 高亮文字闪烁效果
  const highlightPulse = interpolate(
    frame % 60,
    [0, 30, 60],
    [1, 0.7, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: COLORS.bgSubtitle,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "80px",
        boxSizing: "border-box",
      }}
    >

      {/* 背景装饰 - 网格 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          pointerEvents: "none",
        }}
      />

      {/* NEWS 角标 */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          right: "60px",
          transform: `rotate(${badgeRotate}deg)`,
          opacity: badgeOpacity,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            background: COLORS.accent,
            padding: "12px 24px",
            borderRadius: "4px",
            boxShadow: COLORS.shadowLabel,
          }}
        >
          <span
            style={{
              color: COLORS.textPrimary,
              fontSize: "40px",
              fontWeight: "bold",
              letterSpacing: "3px",
            }}
          >
            NEWS
          </span>
        </div>
      </div>

      {/* 主内容区域 - 毛玻璃背景 */}
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          background: COLORS.surface,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "60px",
          border: `1px solid ${COLORS.borderFaint}`,
          boxShadow: COLORS.shadowCard,
          opacity: containerOpacity,
          transform: `scale(${containerScale})`,
        }}
      >
        {/* 引号装饰 */}
        <div
          style={{
            fontSize: "120px",
            color: COLORS.accentLight,
            lineHeight: 0.5,
            marginBottom: "20px",
            fontFamily: "Georgia, serif",
          }}
        >
          "
        </div>

        {/* 字幕内容 */}
        <div
          style={{
            color: COLORS.textPrimary,
            fontSize: "56px",
            lineHeight: 1.6,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {lines.map((line, index) => {
            const lineOpacity = interpolate(
              frame,
              [index * lineDelay, index * lineDelay + 15],
              [0, 1],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
            );

            const lineY = interpolate(
              frame,
              [index * lineDelay, index * lineDelay + 15],
              [20, 0],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
            );

            const isHighlight = highlight && line.includes(highlight);

            return (
              <p
                key={index}
                style={{
                  margin: "16px 0",
                  opacity: lineOpacity,
                  transform: `translateY(${lineY}px)`,
                  color: isHighlight ? COLORS.accent : COLORS.textPrimary,
                  textShadow: isHighlight
                    ? `0 0 ${20 * highlightPulse}px rgba(233, 69, 96, 0.5)`
                    : "none",
                }}
              >
                {line}
              </p>
            );
          })}
        </div>

        {/* 底部引号 */}
        <div
          style={{
            fontSize: "120px",
            color: COLORS.accentLight,
            lineHeight: 0.5,
            marginTop: "20px",
            textAlign: "right",
            fontFamily: "Georgia, serif",
          }}
        >
          "
        </div>
      </div>

      {/* 底部装饰线 */}
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          width: "200px",
          height: "4px",
          background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
          opacity: containerOpacity,
        }}
      />

      {/* 字幕 - 使用 timing.json 精确同步 */}
      {timing?.sentences && (
        <TimedSubtitles
          sentences={timing.sentences}
          sceneStartFrame={timing.start_frame}
          style="quote"
        />
      )}
    </div>
  );
};
