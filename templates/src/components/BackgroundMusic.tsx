import { staticFile, interpolate, useVideoConfig } from "remotion";
import { Audio } from "remotion";

interface BackgroundMusicProps {
  src?: string;
  videoDurationInFrames: number;
  volume?: number;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src = "audio/background.mp3",
  videoDurationInFrames,
  volume = 0.3,
}) => {
  const { fps } = useVideoConfig();

  // 音量曲线：开头淡入 1s → 中间恒定 → 结尾淡出 1.5s
  const volumeCurve = (f: number) => {
    const fadeInFrames = fps; // 1 秒淡入
    const fadeOutFrames = Math.floor(fps * 1.5); // 1.5 秒淡出
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
