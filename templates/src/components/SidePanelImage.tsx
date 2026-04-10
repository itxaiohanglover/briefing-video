import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface SidePanelImageProps {
  src: string;
  position?: 'left' | 'right';
  width?: string | number;
  opacity?: number;
  style?: React.CSSProperties;
  kenBurns?: boolean;
  durationInFrames?: number;
}

export const SidePanelImage: React.FC<SidePanelImageProps> = ({
  src,
  position = 'right',
  width = '45%',
  opacity = 0.9,
  style = {},
  kenBurns = false,
  durationInFrames = 150,
}) => {
  const frame = useCurrentFrame();

  // Ken Burns effect for side panel
  const kenBurnsStyle: React.CSSProperties = React.useMemo(() => {
    if (!kenBurns) return {};

    const scale = interpolate(
      frame,
      [0, durationInFrames],
      [1, 1.08],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );

    return {
      transform: `scale(${scale})`,
    };
  }, [frame, kenBurns, durationInFrames]);

  const isLeft = position === 'left';

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        [isLeft ? 'left' : 'right']: 0,
        width,
        height: '100%',
        overflow: 'hidden',
        zIndex: 1,
        ...style,
      }}
    >
      {/* Image container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
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

      {/* Gradient overlay for edge blending */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          [isLeft ? 'right' : 'left']: 0,
          width: '80px',
          height: '100%',
          background: isLeft
            ? 'linear-gradient(to right, transparent, rgba(0,0,0,0.8))'
            : 'linear-gradient(to left, transparent, rgba(0,0,0,0.8))',
          pointerEvents: 'none',
        }}
      />

      {/* Top gradient for seamless blend */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '60px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom gradient for seamless blend */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '60px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default SidePanelImage;
