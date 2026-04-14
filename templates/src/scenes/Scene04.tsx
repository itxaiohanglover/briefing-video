import React from "react";
import { useVideoConfig, useCurrentFrame, interpolate, Sequence } from "remotion";
import { TimedSubtitles } from "../components/TimedSubtitles";
import { SceneData, TimingSection } from "../types";
import { COLORS } from "../colors";
import { BarChart } from "../components/BarChart";
import { LineChart } from "../components/LineChart";
import { GaugeChart } from "../components/GaugeChart";

interface SceneProps {
  sceneData: SceneData;
  durationInFrames: number;
  timing?: TimingSection;
}

interface DataCard {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  color?: string;
}

// 默认配色
const DEFAULT_COLORS = COLORS.cardColors;

export const Scene04: React.FC<SceneProps> = ({ sceneData, durationInFrames, timing }) => {
  const { fps, width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // 支持 metrics 或 dataCards
  const rawMetrics = (sceneData as any).metrics || (sceneData as any).dataCards || [];

  // 产业链流程数据（可选）
  const chainNodes = (sceneData as any).chainNodes || [];
  const showChain = chainNodes.length > 0;

  // 转换为统一格式
  const dataCards: DataCard[] = rawMetrics.map((m: any, index: number) => ({
    label: m.label,
    value: typeof m.value === 'number' ? m.value : parseFloat(m.value) || 0,
    suffix: m.suffix || m.unit,  // 优先 suffix，fallback unit
    prefix: m.prefix,
    color: m.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  // 入场动画（添加缓动）
  const containerOpacity = interpolate(frame, [0, 20], [0, 1], {
    easing: (t) => t * (2 - t), // Easing.out(Easing.quad) - 平滑淡入
    extrapolateRight: "clamp",
  });

  // 渲染数据卡片 - 超紧凑版（最小高度）
  const renderDataCard = (card: DataCard, index: number) => {
    const delay = index * 8;

    // 简单淡入+位移
    const progress = interpolate(
      frame,
      [delay, delay + 20],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // 数字递增动画
    const numberProgress = interpolate(
      frame,
      [delay + 10, delay + 50],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    const animatedValue = Math.floor(card.value * numberProgress);
    const cardColor = card.color || COLORS.accent;

    return (
      <div
        key={index}
        style={{
          background: COLORS.surface,
          backdropFilter: "blur(16px)",
          borderRadius: "12px",
          padding: "12px 16px",  // 进一步缩小 padding
          border: `1px solid ${cardColor}30`,
          display: "flex",
          flexDirection: "row",  // 横向布局，更紧凑
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          transform: `translateY(${(1 - progress) * 20}px)`,
          opacity: progress,
          flex: 1,  // 让卡片均匀分布
        }}
      >
        {/* 左侧：标签 */}
        <span
          style={{
            color: COLORS.textMuted,
            fontSize: "16px",  // 进一步缩小
            letterSpacing: "1px",
          }}
        >
          {card.label}
        </span>

        {/* 右侧：数值 */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
          <span
            style={{
              color: cardColor,
              fontSize: "32px",  // 缩小字号
              fontWeight: "bold",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {animatedValue.toLocaleString()}
          </span>
          <span style={{ color: cardColor, fontSize: "16px", opacity: numberProgress }}>
            {card.suffix || ""}
          </span>
        </div>
      </div>
    );
  };

  // 渲染产业链流程条（简化版）
  const renderChainFlow = () => {
    if (!showChain) return null;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          opacity: containerOpacity,
        }}
      >
        {chainNodes.map((node: any, index: number) => {
          const nodeDelay = index * 12;
          const nodeProgress = interpolate(
            frame,
            [nodeDelay, nodeDelay + 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <React.Fragment key={node.id || index}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  opacity: 0.4 + nodeProgress * 0.6,
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: nodeProgress > 0.5
                      ? `linear-gradient(135deg, ${COLORS.accent}, #c73e54)`
                      : COLORS.surfaceLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>{node.icon || "●"}</span>
                </div>
                <span style={{ color: COLORS.textPrimary, fontSize: "18px", whiteSpace: "nowrap" }}>
                  {node.label}
                </span>
              </div>
              {index < chainNodes.length - 1 && (
                <div style={{ width: "30px", height: "2px", background: COLORS.surfaceLight, marginTop: "-20px" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: COLORS.bgDashboard,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* 背景装饰 - 网格 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          pointerEvents: "none",
        }}
      />

      {/* 标题 Sequence - 从 0 帧开始 */}
      <Sequence
        from={0}
        durationInFrames={durationInFrames}
        premountFor={Math.round(0.5 * fps)}
        layout="none"
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px 80px",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "rgba(233, 69, 96, 0.9)",
              color: COLORS.textPrimary,
              padding: "8px 20px",
              borderRadius: "4px",
              fontSize: "20px",
              fontWeight: "bold",
              letterSpacing: "2px",
              opacity: containerOpacity,
            }}
          >
            {showChain ? "产业链图谱" : "核心数据"}
          </span>
        </div>
      </Sequence>

      {/* 数据卡片 Sequence - 从 0 帧开始 */}
      <Sequence
        from={0}
        durationInFrames={durationInFrames}
        premountFor={Math.round(0.5 * fps)}
        layout="none"
      >
        <div
          style={{
            position: "absolute",
            top: "5%",
            left: 0,
            right: 0,
            height: "20%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 80px",
            boxSizing: "border-box",
          }}
        >
          {/* 数据卡片网格 - 横向紧凑布局 */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              width: "100%",
              maxWidth: "900px",
              justifyContent: "center",
            }}
          >
            {dataCards.map((card, index) => renderDataCard(card, index))}
          </div>

          {/* 产业链流程条（可选） */}
          {showChain && renderChainFlow()}
        </div>
      </Sequence>

      {/* 柱状图 Sequence - 从 60 帧开始（2秒 @ 30fps） */}
      <Sequence
        from={60}
        durationInFrames={durationInFrames - 60}
        premountFor={Math.round(0.5 * fps)}
        layout="none"
      >
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: 0,
            right: 0,
            height: "30%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 80px",
            boxSizing: "border-box",
          }}
        >
          {(sceneData as any).barChart && (
            <div style={{ width: "100%", maxWidth: "900px" }}>
              <BarChart data={(sceneData as any).barChart!} height={200} delay={0} />
            </div>
          )}
        </div>
      </Sequence>

      {/* 曲线图 Sequence - 从 80 帧开始（约2.67秒 @ 30fps） */}
      <Sequence
        from={80}
        durationInFrames={durationInFrames - 80}
        premountFor={Math.round(0.5 * fps)}
        layout="none"
      >
        <div
          style={{
            position: "absolute",
            top: "55%",
            left: 0,
            right: 0,
            height: "25%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 80px",
            boxSizing: "border-box",
          }}
        >
          {(sceneData as any).lineChart && (
            <div style={{ width: "100%", maxWidth: "900px" }}>
              <LineChart data={(sceneData as any).lineChart!} height={200} delay={0} />
            </div>
          )}
        </div>
      </Sequence>

      {/* 底部字幕缓冲区（剩余空间）- 确保 120px padding */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "20%",
          padding: "20px 80px 120px",
          boxSizing: "border-box",
        }}
      />

      {/* 字幕 */}
      {timing?.sentences && (
        <TimedSubtitles
          sentences={timing.sentences}
          sceneStartFrame={timing.start_frame}
        />
      )}
    </div>
  );
};