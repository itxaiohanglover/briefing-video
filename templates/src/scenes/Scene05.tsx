import { useVideoConfig, useCurrentFrame, interpolate } from "remotion";
import { TimedSubtitles } from "../components/TimedSubtitles";
import { SceneData, TimingSection } from "../types";
import { COLORS } from "../colors";

interface SceneProps {
  sceneData: SceneData;
  durationInFrames: number;
  timing?: TimingSection;
}

export const Scene05: React.FC<SceneProps> = ({ sceneData, durationInFrames, timing }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const { title, subtitle } = sceneData;

  // 主标题入场动画
  const titleScale = interpolate(
    frame,
    [0, 30],
    [0.8, 1],
    { extrapolateRight: "clamp" }
  );

  const titleOpacity = interpolate(
    frame,
    [0, 30],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  // 副标题延迟入场
  const subtitleY = interpolate(
    frame,
    [20, 40],
    [30, 0],
    { extrapolateRight: "clamp" }
  );

  const subtitleOpacity = interpolate(
    frame,
    [20, 40],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  // 装饰元素动画
  const decorOpacity = interpolate(
    frame,
    [30, 50],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  // 结束提示点动画
  const dotScale = interpolate(
    frame % 30,
    [0, 15, 30],
    [1, 1.3, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: COLORS.bgOutro,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >

      {/* 背景装饰 - 光晕 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background: `radial-gradient(circle, ${COLORS.accentGlow} 0%, transparent 70%)`,
          borderRadius: "50%",
          opacity: decorOpacity,
        }}
      />

      {/* 中心内容区 */}
      <div
        style={{
          textAlign: "center",
          zIndex: 10,
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
        }}
      >
        {/* 图标 */}
        <div
          style={{
            fontSize: "84px",
            marginBottom: "30px",
            opacity: decorOpacity,
          }}
        >
          📺
        </div>

        {/* 主标题 */}
        <h1
          style={{
            fontSize: "84px",
            fontWeight: "bold",
            color: COLORS.textPrimary,
            margin: 0,
            marginBottom: "20px",
            textShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {title || "谢谢观看"}
        </h1>

        {/* 副标题 */}
        <p
          style={{
            fontSize: "40px",
            color: COLORS.textSecondary,
            margin: 0,
            transform: `translateY(${subtitleY}px)`,
            opacity: subtitleOpacity,
          }}
        >
          {subtitle || "THANKS FOR WATCHING"}
        </p>

        {/* 分隔线 */}
        <div
          style={{
            width: "100px",
            height: "4px",
            background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
            margin: "40px auto",
            opacity: decorOpacity,
          }}
        />

        {/* 结束动画点 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            opacity: decorOpacity,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: COLORS.accent,
                transform: `scale(${frame > i * 10 ? dotScale : 0})`,
                opacity: frame > i * 10 ? 1 : 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* 字幕 - 使用 timing.json 精确同步 */}
      {timing?.sentences && (
        <TimedSubtitles
          sentences={timing.sentences}
          sceneStartFrame={timing.start_frame}
        />
      )}
    </div>
  );
};
