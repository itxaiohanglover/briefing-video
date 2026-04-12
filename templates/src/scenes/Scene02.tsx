import { useVideoConfig, useCurrentFrame, staticFile, interpolate } from "remotion";
import { TimedSubtitles } from "../components/TimedSubtitles";
import { SceneData, TimingSection } from "../types";
import { COLORS } from "../colors";

interface SceneProps {
  sceneData: SceneData;
  durationInFrames: number;
  timing?: TimingSection;
}

interface ImageItem {
  src: string;
  caption?: string;
}

export const Scene02: React.FC<SceneProps> = ({ sceneData, durationInFrames, timing }) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  const { images = [], captions = [] } = sceneData as SceneData & { images: string[]; captions: string[] };

  // 计算当前显示的图片索引
  const imagesPerImage = durationInFrames / images.length;
  const currentImageIndex = Math.min(
    Math.floor(frame / imagesPerImage),
    images.length - 1
  );

  // 当前图片的进度 (0-1)
  const imageProgress = (frame % imagesPerImage) / imagesPerImage;

  // Ken Burns 效果 - 缩放和位移
  const scale = interpolate(
    imageProgress,
    [0, 1],
    [1, 1.15]
  );

  const translateX = interpolate(
    imageProgress,
    [0, 1],
    [0, -30]
  );

  const translateY = interpolate(
    imageProgress,
    [0, 1],
    [0, -20]
  );

  // 图片切换淡入淡出
  const fadeProgress = (frame % imagesPerImage) / 30; // 前30帧淡入
  const fadeOutProgress = (imagesPerImage - (frame % imagesPerImage)) / 30; // 后30帧淡出

  const opacity = Math.min(
    fadeProgress < 1 ? fadeProgress : 1,
    fadeOutProgress < 1 ? fadeOutProgress : 1
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: COLORS.bgSlideshow,
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* 图片轮播区域 */}
      {images.map((imgSrc, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: index === currentImageIndex ? opacity : 0,
          }}
        >
          <img
            src={staticFile(`images/${imgSrc}`)}
            alt={`slide-${index}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${index === currentImageIndex ? scale : 1}) translate(${index === currentImageIndex ? translateX : 0}px, ${index === currentImageIndex ? translateY : 0}px)`,
            }}
          />
          {/* 暗角效果 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: COLORS.overlayVignette,
              pointerEvents: "none",
            }}
          />
        </div>
      ))}

      {/* 图片说明 - 毛玻璃标签样式 */}
      {captions[currentImageIndex] && (
        <div
          style={{
            position: "absolute",
            bottom: "140px",
            left: "50%",
            transform: "translateX(-50%)",
            background: COLORS.surfaceLight,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "20px 48px",
            borderRadius: "16px",
            maxWidth: "80%",
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: COLORS.shadowCaption,
          }}
        >
          <p
            style={{
              color: COLORS.textPrimary,
              fontSize: "40px",
              margin: 0,
              textAlign: "center",
              fontWeight: 600,
              textShadow: COLORS.shadowText,
              letterSpacing: "1px",
            }}
          >
            {captions[currentImageIndex]}
          </p>
        </div>
      )}

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
