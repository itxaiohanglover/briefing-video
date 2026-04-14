/**
 * Remotion 性能优化工具
 * 提供缓存、计算优化等工具函数
 */

import { useMemo, useCallback, useRef } from "react";
import { useCurrentFrame } from "remotion";

/**
 * 动画插值缓存 Hook
 * 避免在每帧重新计算相同的插值
 */
export const useInterpolateMemo = (
  frame: number,
  ranges: Array<{ input: [number, number]; output: [number, number] }>
) => {
  return useMemo(() => {
    const { interpolate } = require("remotion");
    return ranges.map(range =>
      interpolate(frame, range.input, range.output, {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      })
    );
  }, [frame, ranges]);
};

/**
 * 批量动画计算 Hook
 * 一次计算多个相关动画值
 */
export const useBatchAnimation = (
  frame: number,
  configs: Array<{
    type: "opacity" | "scale" | "translateY" | "translateX" | "rotate";
    delay: number;
    duration: number;
    from: number;
    to: number;
  }>
) => {
  return useMemo(() => {
    const { interpolate } = require("remotion");

    return configs.map(config => {
      const { delay, duration, from, to } = config;
      return interpolate(frame, [delay, delay + duration], [from, to], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      });
    });
  }, [frame, configs]);
};

/**
 * 逐字符动画计算 Hook
 * 用于打字机效果
 */
export const useTypewriterAnimation = (
  frame: number,
  text: string,
  startFrame: number,
  charDelay: number
) => {
  return useMemo(() => {
    const { interpolate } = require("remotion");

    return text.split("").map((char, index) => {
      const charFrame = startFrame + index * charDelay;
      const opacity = interpolate(
        frame,
        [charFrame, charFrame + 8],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      const y = interpolate(
        frame,
        [charFrame, charFrame + 8],
        [10, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

      return { char, opacity, y };
    });
  }, [frame, text, startFrame, charDelay]);
};

/**
 * 逐行动画计算 Hook
 * 用于多行文字渐显
 */
export const useLineAnimation = (
  frame: number,
  lines: string[],
  lineDelay: number,
  duration: number = 15
) => {
  return useMemo(() => {
    const { interpolate } = require("remotion");

    return lines.map((line, index) => {
      const startFrame = index * lineDelay;
      const opacity = interpolate(
        frame,
        [startFrame, startFrame + duration],
        [0, 1],
        { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
      );
      const y = interpolate(
        frame,
        [startFrame, startFrame + duration],
        [20, 0],
        { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
      );

      return { line, opacity, y };
    });
  }, [frame, lines, lineDelay, duration]);
};

/**
 * 脉冲动画 Hook
 * 用于闪烁、呼吸效果
 */
export const usePulseAnimation = (
  frame: number,
  period: number = 60,
  min: number = 0.7,
  max: number = 1
) => {
  return useMemo(() => {
    const { interpolate } = require("remotion");
    return interpolate(
      frame % period,
      [0, period / 2, period],
      [max, min, max],
      { extrapolateRight: "clamp" }
    );
  }, [frame, period, min, max]);
};

/**
 * 数字递增动画 Hook
 */
export const useCountUpAnimation = (
  frame: number,
  delay: number,
  duration: number,
  targetValue: number
) => {
  return useMemo(() => {
    const { interpolate } = require("remotion");
    const progress = interpolate(
      frame,
      [delay, delay + duration],
      [0, 1],
      { extrapolateRight: "clamp" }
    );
    return Math.floor(targetValue * progress);
  }, [frame, delay, duration, targetValue]);
};

/**
 * 交错动画 Hook
 * 用于列表项的序列化动画
 */
export const useStaggerAnimation = (
  frame: number,
  count: number,
  baseDelay: number,
  itemDelay: number,
  duration: number
) => {
  return useMemo(() => {
    const { interpolate } = require("remotion");

    return Array.from({ length: count }, (_, index) => {
      const startFrame = baseDelay + index * itemDelay;
      return {
        index,
        opacity: interpolate(
          frame,
          [startFrame, startFrame + duration * 0.5],
          [0, 1],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
        ),
        scale: interpolate(
          frame,
          [startFrame, startFrame + duration],
          [0, 1],
          { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
        ),
      };
    });
  }, [frame, count, baseDelay, itemDelay, duration]);
};

/**
 * 样式对象缓存 Hook
 * 避免每帧重新创建样式对象
 */
export const useStyleMemo = <T extends Record<string, any>>(styleFactory: () => T, deps: any[]) => {
  return useMemo(styleFactory, deps);
};

/**
 * 帧历史追踪 Hook（用于调试）
 */
export const useFrameHistory = (maxFrames: number = 100) => {
  const frame = useCurrentFrame();
  const historyRef = useRef<number[]>([]);

  if (historyRef.current.length > maxFrames) {
    historyRef.current.shift();
  }
  historyRef.current.push(frame);

  return {
    currentFrame: frame,
    history: historyRef.current,
    average: historyRef.current.reduce((a, b) => a + b, 0) / historyRef.current.length,
  };
};

/**
 * 性能监控 Hook
 */
export const usePerformanceMonitor = () => {
  const frame = useCurrentFrame();
  const startTime = useRef<number>(performance.now());
  const frameCount = useRef(0);

  const fps = useMemo(() => {
    frameCount.current++;
    const elapsed = performance.now() - startTimeRef.current;
    return (frameCount.current / elapsed) * 1000;
  }, [frame]);

  const startTimeRef = startTime;

  return {
    frame,
    fps,
    reset: () => {
      startTimeRef.current = performance.now();
      frameCount.current = 0;
    },
  };
};
