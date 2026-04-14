import { useVideoConfig, useCurrentFrame, interpolate, spring } from "remotion";
import { TimedSubtitles } from "../components/TimedSubtitles";
import { SceneData, TimingSection } from "../types";
import { COLORS } from "../colors";

interface SceneProps {
  sceneData: SceneData;
  durationInFrames: number;
  timing?: TimingSection;
}

/**
 * 打字机效果辅助函数
 * 参考：remotion-video/skills/remotion/rules/assets/text-animations-typewriter.tsx
 */
const getTypedText = ({
  frame,
  fullText,
  pauseAfter,
  charFrames,
  pauseFrames,
}: {
  frame: number;
  fullText: string;
  pauseAfter: string;
  charFrames: number;
  pauseFrames: number;
}): string => {
  const pauseIndex = fullText.indexOf(pauseAfter);
  const preLen = pauseIndex >= 0 ? pauseIndex + pauseAfter.length : fullText.length;

  let typedChars = 0;
  if (frame < preLen * charFrames) {
    typedChars = Math.floor(frame / charFrames);
  } else if (frame < preLen * charFrames + pauseFrames) {
    typedChars = preLen; // 暂停
  } else {
    const postPhase = frame - preLen * charFrames - pauseFrames;
    typedChars = Math.min(fullText.length, preLen + Math.floor(postPhase / charFrames));
  }
  return fullText.slice(0, typedChars);
};

/**
 * 闪烁光标组件
 */
const BlinkingCursor: React.FC<{
  frame: number;
  blinkFrames: number;
  symbol?: string;
}> = ({ frame, blinkFrames, symbol = "|" }) => {
  const opacity = interpolate(
    frame % blinkFrames,
    [0, blinkFrames / 2, blinkFrames],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <span
      style={{
        opacity,
        fontSize: "inherit",
        fontWeight: "inherit",
        color: "inherit",
      }}
    >
      {symbol}
    </span>
  );
};

export const Scene05: React.FC<SceneProps> = ({ sceneData, durationInFrames, timing }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const { title, subtitle } = sceneData;

  // Logo 动画（使用 smooth 预设，无弹跳）
  const logoScale = spring({
    frame,
    fps,
    config: {
      damping: 200, // smooth
    },
  });

  // 主标题入场动画（使用 smooth 预设）
  const titleScale = spring({
    frame,
    fps,
    config: {
      damping: 200, // smooth
    },
  });

  // 打字机配置
  const typewriterStartFrame = 40;
  const CHAR_FRAMES = 3; // 每个字符 3 帧
  const CURSOR_BLINK_FRAMES = 16; // 光标每 16 帧闪烁一次
  const PAUSE_SECONDS = 0.5; // 在句号后暂停 0.5 秒

  // 装饰元素动画（添加缓动）
  const decorOpacity = interpolate(frame, [30, 50], [0, 1], {
    easing: (t) => t, // 可以添加 Easing.inOut(Easing.quad)
    extrapolateRight: "clamp",
  });

  // 头像光环旋转
  const avatarRotation = interpolate(frame, [0, durationInFrames], [0, 360], {
    extrapolateRight: "clamp",
  });

  // CTA 按钮错位弹入（使用 snappy 预设，快速最小弹跳）
  const ctaStartFrame = 70;

  // 计算打字机文本
  const pauseFrames = Math.round(fps * PAUSE_SECONDS);
  const typedText = getTypedText({
    frame: frame - typewriterStartFrame,
    fullText: subtitle || "THANKS FOR WATCHING",
    pauseAfter: "THANKS FOR WATCHING", // 在第一个句子后暂停
    charFrames: CHAR_FRAMES,
    pauseFrames,
  });

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
                damping: 20, // snappy - 快速最小弹跳
                stiffness: 200,
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

        {/* 打字机副标题（优化版） */}
        <p
          style={{
            fontSize: "40px",
            color: COLORS.textSecondary,
            margin: 0,
            minHeight: "48px", // 防止高度跳动
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <span>{typedText}</span>
          {/* 只在打字完成前显示光标 */}
          {frame >= typewriterStartFrame && typedText.length < (subtitle || "THANKS FOR WATCHING").length && (
            <BlinkingCursor frame={frame} blinkFrames={CURSOR_BLINK_FRAMES} />
          )}
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
