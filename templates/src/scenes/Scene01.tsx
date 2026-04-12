import { useVideoConfig, useCurrentFrame, staticFile, interpolate } from "remotion";
import { TimedSubtitles } from "../components/TimedSubtitles";
import { SceneData, TimingSection } from "../types";

interface SceneProps {
  sceneData: SceneData;
  durationInFrames: number;
  timing?: TimingSection;
}

export const Scene01: React.FC<SceneProps> = ({ sceneData, durationInFrames, timing }) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // 入场动画 - 左侧图片滑入
  const imageX = interpolate(
    frame,
    [0, 30],
    [-width * 0.45, 0],
    { extrapolateRight: "clamp" }
  );

  // 入场动画 - 右侧标题滑入
  const titleX = interpolate(
    frame,
    [10, 40],
    [width * 0.3, 0],
    { extrapolateRight: "clamp" }
  );

  // 标题透明度
  const titleOpacity = interpolate(
    frame,
    [10, 40],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  // 副标题延迟入场
  const subtitleY = interpolate(
    frame,
    [30, 50],
    [30, 0],
    { extrapolateRight: "clamp" }
  );

  const subtitleOpacity = interpolate(
    frame,
    [30, 50],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const { title, subtitle, image } = sceneData;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "row",
      }}
    >

      {/* 左侧图片区域 - 45% */}
      <div
        style={{
          width: "45%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          transform: `translateX(${imageX}px)`,
        }}
      >
        {image && (
          <img
            src={staticFile(`images/${image}`)}
            alt="intro"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        {/* 渐变遮罩 - 右侧与内容区融合 */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "100px",
            height: "100%",
            background: "linear-gradient(to right, transparent, rgba(26, 26, 46, 0.8))",
          }}
        />
      </div>

      {/* 右侧标题区域 - 55% */}
      <div
        style={{
          width: "55%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          boxSizing: "border-box",
        }}
      >
        {/* 新闻标签 */}
        <div
          style={{
            transform: `translateX(${titleX}px)`,
            opacity: titleOpacity,
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "#e94560",
              color: "white",
              padding: "8px 20px",
              borderRadius: "4px",
              fontSize: "32px",
              fontWeight: "bold",
              letterSpacing: "2px",
              marginBottom: "30px",
            }}
          >
            NEWS
          </span>
        </div>

        {/* 主标题 */}
        <h1
          style={{
            fontSize: "84px",
            fontWeight: "bold",
            color: "white",
            margin: 0,
            lineHeight: 1.2,
            transform: `translateX(${titleX}px)`,
            opacity: titleOpacity,
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {title}
        </h1>

        {/* 副标题 */}
        {subtitle && (
          <p
            style={{
              fontSize: "36px",
              color: "rgba(255,255,255,0.8)",
              marginTop: "30px",
              lineHeight: 1.5,
              transform: `translateY(${subtitleY}px)`,
              opacity: subtitleOpacity,
            }}
          >
            {subtitle}
          </p>
        )}
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
