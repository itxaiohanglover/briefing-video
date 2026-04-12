import React from "react";
import { staticFile, interpolate, useVideoConfig, useCurrentFrame } from "remotion";
import { Audio } from "remotion";

interface BackgroundMusicProps {
  src?: string;
  videoDurationInFrames: number;
  volume?: number;
  enabled?: boolean;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src = "audio/background.mp3",
  videoDurationInFrames,
  volume = 0.25,
  enabled = true,
}) => {
  const { fps } = useVideoConfig();

  if (!enabled) return null;

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

  try {
    return (
      <Audio
        src={staticFile(src)}
        volume={volumeCurve}
        loop
        onError={() => {}}
      />
    );
  } catch {
    return null;
  }
};
