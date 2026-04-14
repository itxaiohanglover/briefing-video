/**
 * 公共场景布局组件
 * 减少重复代码，提供统一的场景结构
 */

import React from "react";
import { COLORS } from "../colors";

/**
 * 场景容器布局
 * 提供标准的场景结构（顶部 + 底部 + 字幕）
 */
export const SceneLayout: React.FC<{
  children: React.ReactNode;
  background?: string;
  overlay?: React.ReactNode;
  subtitles?: React.ReactNode;
}> = ({ children, background, overlay, subtitles }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: background || COLORS.bgSubtitle,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* 背景装饰层 */}
      {overlay && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          {overlay}
        </div>
      )}

      {/* 内容区域 */}
      {children}

      {/* 字幕层 */}
      {subtitles && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          {subtitles}
        </div>
      )}
    </div>
  );
};

/**
 * 垂直分区布局
 * 将场景分为上中下三个区域
 */
export const VerticalSectionLayout: React.FC<{
  top?: React.ReactNode;
  topHeight?: string | number;
  middle?: React.ReactNode;
  middleHeight?: string | number;
  bottom?: React.ReactNode;
  bottomHeight?: string | number;
  children?: React.ReactNode;
}> = ({ top, topHeight = "auto", middle, middleHeight = "auto", bottom, bottomHeight = "auto", children }) => {
  return (
    <>
      {top && (
        <div
          style={{
            flex: "0 0 auto",
            height: topHeight,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {top}
        </div>
      )}

      {middle && (
        <div
          style={{
            flex: "0 0 auto",
            height: middleHeight,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {middle}
        </div>
      )}

      {bottom && (
        <div
          style={{
            flex: "0 0 auto",
            height: bottomHeight,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {bottom}
        </div>
      )}

      {children}
    </>
  );
};

/**
 * 网格背景装饰
 */
export const GridBackground: React.FC<{
  size?: number;
  opacity?: number;
  color?: string;
}> = ({ size = 50, opacity = 0.08, color = "rgba(255,255,255,0.08)" }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
        pointerEvents: "none",
      }}
    />
  );
};

/**
 * 中心内容容器
 * 确保内容居中且宽度受限
 */
export const CenteredContent: React.FC<{
  children: React.ReactNode;
  maxWidth?: number | string;
  padding?: string;
  style?: React.CSSProperties;
}> = ({ children, maxWidth = 900, padding = "60px 80px", style }) => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth,
        margin: "0 auto",
        padding,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 毛玻璃卡片容器
 */
export const GlassCard: React.FC<{
  children: React.ReactNode;
  blur?: number;
  padding?: string;
  borderRadius?: string;
  opacity?: number;
  scale?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  blur = 20,
  padding = "40px",
  borderRadius = "24px",
  opacity = 1,
  scale = 1,
  style,
}) => {
  return (
    <div
      style={{
        background: COLORS.surface,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        borderRadius,
        padding,
        border: `1px solid ${COLORS.borderFaint}`,
        boxShadow: COLORS.shadowCard,
        opacity,
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * 装饰性分隔线
 */
export const DecorativeLine: React.FC<{
  width?: number | string;
  height?: number | string;
  color?: string;
  opacity?: number;
}> = ({ width = 200, height = 4, color, opacity = 1 }) => {
  const lineColor = color || COLORS.accent;

  return (
    <div
      style={{
        width,
        height,
        background: `linear-gradient(90deg, transparent, ${lineColor}, transparent)`,
        opacity,
      }}
    />
  );
};

/**
 * 徽章标签（如 NEWS 角标）
 */
export const BadgeLabel: React.FC<{
  text: string;
  rotate?: number;
  opacity?: number;
  background?: string;
  color?: string;
  fontSize?: number | string;
  padding?: string;
}> = ({
  text,
  rotate = 0,
  opacity = 1,
  background = COLORS.accent,
  color = COLORS.textPrimary,
  fontSize = 40,
  padding = "12px 24px",
}) => {
  return (
    <div
      style={{
        transform: `rotate(${rotate}deg)`,
        opacity,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          background,
          padding,
          borderRadius: "4px",
          boxShadow: COLORS.shadowLabel,
        }}
      >
        <span
          style={{
            color,
            fontSize,
            fontWeight: "bold",
            letterSpacing: "3px",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

/**
 * 引号装饰
 */
export const QuoteDecorations: React.FC<{
  size?: number | string;
  color?: string;
}> = ({ size = 120, color = COLORS.accentLight }) => {
  return (
    <>
      <div
        style={{
          fontSize: size,
          color,
          lineHeight: 0.5,
          marginBottom: "20px",
          fontFamily: "Georgia, serif",
        }}
      >
        "
      </div>
    </>
  );
};

/**
 * 绝对定位容器
 * 用于精确控制元素位置
 */
export const AbsolutePosition: React.FC<{
  children: React.ReactNode;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  transform?: string;
  style?: React.CSSProperties;
}> = ({ children, top, right, bottom, left, transform, style }) => {
  return (
    <div
      style={{
        position: "absolute",
        top,
        right,
        bottom,
        left,
        transform,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
