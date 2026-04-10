import React from 'react';
import { useCurrentFrame, interpolate, spring } from 'remotion';

interface BackgroundPhotoProps {
  src: string;
  style?: React.CSSProperties;
  opacity?: number;
  kenBurns?: boolean;
  durationInFrames?: number;
}

export const BackgroundPhoto: React.FC<BackgroundPhotoProps> = ({
  src,
  style = {},
  opacity = 0.55,
  kenBurns = false,
  durationInFrames = 150,
}) => {
  const frame = useCurrentFrame();

  // Ken Burns effect: slow zoom and pan
  const kenBurnsStyle: React.CSSProperties = React.useMemo(() => {
    if (!kenBurns) return {};

    const scale = interpolate(
      frame,
      [0, durationInFrames],
      [1, 1.1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );

    const translateX = interpolate(
      frame,
      [0, durationInFrames],
      [0, -20],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );

    const translateY = interpolate(
      frame,
      [0, durationInFrames],
      [0, -10],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );

    return {
      transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
    };
  }, [frame, kenBurns, durationInFrames]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
        ...style,
      }}
    >
      <img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity,
          ...kenBurnsStyle,
        }}
      />
    </div>
  );
};

export default BackgroundPhoto;
