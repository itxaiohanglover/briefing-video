import { useVideoConfig, useCurrentFrame, interpolate, spring } from "remotion";
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

  // Logo 动画（0-25 帧，0-0.83秒）
  const logoScale = spring({
    frame,
    fps,
    config: {
      stiffness: 120,
      damping: 20,
    },
  });

  // 主标题入场动画
  const titleScale = spring({
    frame,
    fps,
    config: {
      stiffness: 120,
      damping: 20,
    },
  });

  // 副标题打字机（40 帧开始）
  const typewriterStartFrame = 40;

  // 装饰元素动画
  const decorOpacity = interpolate(
    frame,
    [30, 50],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  // 头像光环旋转
  const avatarRotation = interpolate(frame, [0, durationInFrames], [0, 360], {
    extrapolateRight: "clamp",
  });

  // CTA 按钮错位弹入（70 帧开始）
  const ctaStartFrame = 70;

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

      {/* 顶部区域：Logo + 头像 + CTA 按钮 */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 10,
          width: "100%",
        }}
      >
        {/* 文字 Logo */}
        <div
          style={{
            marginBottom: "20px",
            opacity: decorOpacity,
          }}
        >
          <span
            style={{
              fontSize: "42px",
              fontWeight: "bold",
              color: COLORS.accent,
              letterSpacing: "4px",
            }}
          >
            NEWS DAILY
          </span>
        </div>

        {/* 头像 + 旋转光环 */}
        <div
          style={{
            position: "relative",
            width: "100px",
            height: "100px",
            margin: "0 auto 30px auto",
          }}
        >
          {/* 旋转光环 */}
          <div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "3px solid transparent",
              borderTopColor: COLORS.accent,
              borderBottomColor: COLORS.accent,
              transform: `rotate(${avatarRotation}deg)`,
              opacity: decorOpacity,
            }}
          />
          {/* 头像 */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: COLORS.surface,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              opacity: decorOpacity,
            }}
          >
            📺
          </div>
        </div>

        {/* CTA 按钮组（点赞/转发/关注）*/}
        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          {[
            { icon: "❤️", label: "点赞", delay: 0 },
            { icon: "🔄", label: "转发", delay: 10 },
            { icon: "➕", label: "关注", delay: 20 },
          ].map((btn) => {
            const btnScale = spring({
              frame: frame - (ctaStartFrame + btn.delay),
              fps,
              config: {
                stiffness: 120,
                damping: 20,
              },
            });
            const btnOpacity = interpolate(
              frame,
              [ctaStartFrame + btn.delay, ctaStartFrame + btn.delay + 15],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={btn.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(233, 69, 96, 0.9)",
                  padding: "10px 24px",
                  borderRadius: "20px",
                  boxShadow: "0 4px 15px rgba(233, 69, 96, 0.4)",
                  transform: `scale(${btnScale})`,
                  opacity: btnOpacity,
                }}
              >
                <span style={{ fontSize: "28px" }}>{btn.icon}</span>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  {btn.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 中间区域：主标题 + 副标题（保持原位） */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 10,
          width: "100%",
        }}
      >
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

        {/* 打字机副标题 */}
        <p style={{ display: "inline-flex", gap: "2px" }}>
          {(subtitle || "THANKS FOR WATCHING").split("").map((char, i) => {
            const charDelay = typewriterStartFrame + i * 3;
            const charOpacity = interpolate(
              frame,
              [charDelay, charDelay + 8],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const charY = interpolate(
              frame,
              [charDelay, charDelay + 8],
              [10, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <span
                key={i}
                style={{
                  opacity: charOpacity,
                  transform: `translateY(${charY}px)`,
                  fontSize: "40px",
                  color: COLORS.textSecondary,
                  margin: 0,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </p>

        {/* 分隔线 */}
        <div
          style={{
            width: "100px",
            height: "4px",
            background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
            margin: "30px auto",
            opacity: decorOpacity,
          }}
        />
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
