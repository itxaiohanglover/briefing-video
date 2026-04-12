import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface AudioWaveformProps {
  /**
   * 音频数据 - 可以是频率数组或模拟数据
   * 如果没有提供，将使用随机模拟数据
   */
  audioData?: number[];
  /**
   * 显示模式
   * "bars" - 频谱条形图（默认）
   * "wave" - 填充波形
   * "dots" - 脉冲圆点
   */
  mode?: "bars" | "wave" | "dots";
  /**
   * 位置
   * "bottom" - 底部（默认）
   * "top" - 顶部
   * "center" - 中心
   */
  position?: "bottom" | "top" | "center";
  /**
   * 条形/圆点数量
   */
  barCount?: number;
  /**
   * 高度（像素）
   */
  height?: number;
  /**
   * 透明度
   */
  opacity?: number;
  /**
   * 颜色
   */
  color?: string;
  /**
   * 是否响应帧动画（模拟音频律动）
   */
  animated?: boolean;
}

/**
 * 音频波形可视化组件
 * 模拟音频频率可视化效果，作为视频背景层
 */
export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioData,
  mode = "bars",
  position = "bottom",
  barCount = 32,
  height = 60,
  opacity = 0.3,
  color = "#e94560",
  animated = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height: videoHeight } = useVideoConfig();

  // 生成模拟音频数据（如果没有提供）
  const generateAudioData = (frameNum: number): number[] => {
    const data: number[] = [];
    for (let i = 0; i < barCount; i++) {
      // 使用多个正弦波叠加模拟音频律动
      const baseFreq = 0.1;
      const wave1 = Math.sin(frameNum * baseFreq + i * 0.3);
      const wave2 = Math.sin(frameNum * 0.15 + i * 0.5) * 0.5;
      const wave3 = Math.cos(frameNum * 0.08 + i * 0.2) * 0.3;

      // 确定性伪随机（基于帧号和索引，保证每帧渲染一致）
      const noise = (Math.sin(frameNum * 12.9898 + i * 78.233) * 43758.5453 % 1 - 0.5) * 0.2;

      // 归一化到 0-1
      const value = Math.max(0, Math.min(1, (wave1 + wave2 + wave3 + noise + 1.5) / 3));
      data.push(value);
    }
    return data;
  };

  const data = audioData || (animated ? generateAudioData(frame) : generateAudioData(0));

  // 计算位置
  const getPositionStyle = (): React.CSSProperties => {
    switch (position) {
      case "top":
        return { top: 100, left: 0, right: 0 };
      case "center":
        return {
          top: "50%",
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
        };
      case "bottom":
      default:
        return { bottom: 180, left: 0, right: 0 }; // 留出字幕空间
    }
  };

  // 渲染条形图
  const renderBars = () => {
    const barWidth = (width * 0.8) / barCount;
    const gap = barWidth * 0.3;
    const actualBarWidth = barWidth - gap;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: gap,
          height: height,
        }}
      >
        {data.map((value, index) => (
          <div
            key={index}
            style={{
              width: actualBarWidth,
              height: `${value * 100}%`,
              backgroundColor: color,
              borderRadius: actualBarWidth / 2,
              opacity: 0.5 + value * 0.5,
              transition: animated ? "height 0.05s ease-out" : undefined,
            }}
          />
        ))}
      </div>
    );
  };

  // 渲染波形
  const renderWave = () => {
    const points: string[] = [];
    const step = (width * 0.8) / (barCount - 1);

    // 生成波形路径
    for (let i = 0; i < barCount; i++) {
      const x = i * step;
      const y = height - data[i] * height;
      points.push(`${x},${y}`);
    }

    // 添加底部闭合点
    points.push(`${width * 0.8},${height}`);
    points.push(`0,${height}`);

    const pathData = `M ${points.join(" L ")} Z`;

    return (
      <svg
        width={width * 0.8}
        height={height}
        viewBox={`0 0 ${width * 0.8} ${height}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
            <stop offset="100%" stopColor={color} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <path d={pathData} fill="url(#waveGradient)" />
      </svg>
    );
  };

  // 渲染圆点
  const renderDots = () => {
    const dotSpacing = (width * 0.8) / barCount;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: dotSpacing * 0.5,
          height: height,
        }}
      >
        {data.map((value, index) => (
          <div
            key={index}
            style={{
              width: 4 + value * 8,
              height: 4 + value * 8,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: 0.3 + value * 0.7,
              transform: `scale(${0.5 + value})`,
              transition: animated ? "all 0.05s ease-out" : undefined,
            }}
          />
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (mode) {
      case "wave":
        return renderWave();
      case "dots":
        return renderDots();
      case "bars":
      default:
        return renderBars();
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        ...getPositionStyle(),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: opacity,
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      {renderContent()}
    </div>
  );
};

export default AudioWaveform;
