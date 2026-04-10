import { staticFile, interpolate, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";

interface BackgroundMusicProps {
  src: string;
  videoDurationInFrames: number;
  volume?: number;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src,
  videoDurationInFrames,
  volume = 0.25,
}) => {
  const { fps } = useVideoConfig();

  // 音量曲线：开头淡入 1s → 中间恒定 → 结尾淡出 1s
  const volumeCurve = (f: number) => {
    const fadeInFrames = fps; // 1秒淡入
    const fadeOutFrames = fps; // 1秒淡出
    const fadeOutStart = videoDurationInFrames - fadeOutFrames;

    return interpolate(
      f,
      [0, fadeInFrames, fadeOutStart, videoDurationInFrames],
      [0, volume, volume, 0],
      { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
    );
  };

  return (
    <Audio
      src={staticFile(src)}
      volume={volumeCurve}
      loop
    />
  );
};
