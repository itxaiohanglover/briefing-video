import React from "react";
import { useVideoConfig, useCurrentFrame, interpolate } from "remotion";
import { TimedSubtitles } from "../components/TimedSubtitles";
import { SceneData, TimingSection } from "../types";
import { COLORS } from "../colors";

interface SceneProps {
  sceneData: SceneData;
  durationInFrames: number;
  timing?: TimingSection;
}

interface DataCard {
  label: string;
  value: number;
  unit?: string;
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
    unit: m.suffix || m.unit,
    suffix: m.suffix,
    prefix: m.prefix,
    color: m.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  // 标题入场
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // 渲染数据卡片 - 简洁淡入动画
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
          borderRadius: "16px",
          padding: "32px",
          border: `1px solid ${cardColor}30`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          transform: `translateY(${(1 - progress) * 30}px)`,
          opacity: progress,
        }}
      >
        {/* 标签 */}
        <span
          style={{
            color: COLORS.textMuted,
            fontSize: "26px",
            marginBottom: "12px",
            letterSpacing: "2px",
          }}
        >
          {card.label}
        </span>

        {/* 数值 */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
          <span
            style={{
              color: cardColor,
              fontSize: "64px",
              fontWeight: "bold",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {card.prefix || ""}{animatedValue.toLocaleString()}
          </span>
          <span style={{ color: cardColor, fontSize: "28px", opacity: numberProgress }}>
            {card.suffix || ""}{card.unit || ""}
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
          position: "absolute",
          bottom: showChain ? "160px" : "100px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          opacity: titleOpacity,
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
        padding: showChain ? "60px 80px 200px" : "80px",
        boxSizing: "border-box",
      }}
    >
      {/* 标题 */}
      <div style={{ textAlign: "center", marginBottom: "40px", opacity: titleOpacity }}>
        <span
          style={{
            display: "inline-block",
            background: "rgba(233, 69, 96, 0.9)",
            color: COLORS.textPrimary,
            padding: "10px 24px",
            borderRadius: "4px",
            fontSize: "22px",
            fontWeight: "bold",
            letterSpacing: "2px",
            marginBottom: "16px",
          }}
        >
          {showChain ? "产业链图谱" : "核心数据"}
        </span>
      </div>

      {/* 数据卡片网格 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(dataCards.length, 2)}, 1fr)`,
          gridTemplateRows: `repeat(${Math.ceil(dataCards.length / 2)}, 1fr)`,
          gap: "24px",
          flex: 1,
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {dataCards.map((card, index) => renderDataCard(card, index))}
      </div>

      {/* 产业链流程条（可选） */}
      {renderChainFlow()}

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
