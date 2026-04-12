import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SentenceTiming } from "../types";

interface TimedSubtitlesProps {
  /**
   * 句子时间数组，包含每句的开始和结束帧
   */
  sentences: SentenceTiming[];
  /**
   * 当前场景的开始的帧（用于计算相对时间）
   */
  sceneStartFrame?: number;
  /**
   * 样式类型
   */
  style?: "default" | "breaking" | "quote";
  /**
   * 高亮短语
   */
  highlightPhrase?: string;
  /**
   * 底部偏移（像素）
   */
  bottomOffset?: number;
}

/**
 * 基于 timing.json 精确同步的字幕组件
 * 根据音频时间轴精确显示每句字幕
 *
 * 注意：sentences 的 start_frame/end_frame 是场景内的相对帧数，
 * 而 Remotion 的 useCurrentFrame() 在每个 Sequence 中也是从 0 开始，
 * 所以直接用 frame 匹配即可，不需要加 sceneStartFrame 偏移。
 */
export const TimedSubtitles: React.FC<TimedSubtitlesProps> = ({
  sentences,
  sceneStartFrame = 0,
  style = "default",
  highlightPhrase,
  bottomOffset = 100,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 直接用当前帧匹配句子（sentences 的 start_frame 是场景内的相对帧）
  const currentSentenceData = sentences.find(
    (s) => frame >= s.start_frame && frame < s.end_frame
  );

  // 如果没有匹配的句子，不显示
  if (!currentSentenceData) {
    return null;
  }

  const currentSentence = currentSentenceData.text;

  // 计算在当前句子内的进度（用于入场动画）
  const sentenceProgress =
    (frame - currentSentenceData.start_frame) /
    (currentSentenceData.end_frame - currentSentenceData.start_frame);

  // 入场动画（前 15% 的时间淡入）
  const entryProgress = interpolate(
    sentenceProgress * 100,
    [0, 15],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  const slideY = interpolate(
    sentenceProgress * 100,
    [0, 15],
    [20, 0],
    { extrapolateRight: "clamp" }
  );

  // 样式配置
  const styles = {
    default: {
      fontSize: "56px",
      color: "#ffffff",
      background:
        "linear-gradient(90deg, rgba(233,69,96,0.9), rgba(233,69,96,0.5))",
      borderLeft: "6px solid #e94560",
      textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 30px rgba(233,69,96,0.3)",
      padding: "20px 40px",
    },
    breaking: {
      fontSize: "72px",
      color: "#ff3333",
      background: "rgba(255,255,255,0.95)",
      borderLeft: "8px solid #ff0000",
      textShadow:
        "0 0 40px rgba(255,51,51,0.8), 0 2px 4px rgba(0,0,0,0.3)",
      padding: "24px 48px",
    },
    quote: {
      fontSize: "48px",
      color: "#ffffff",
      background: "rgba(0,0,0,0.6)",
      borderLeft: "4px solid #00d9ff",
      textShadow: "0 2px 8px rgba(0,0,0,0.8)",
      padding: "20px 40px",
    },
  };

  const currentStyle = styles[style];
  const isHighlight =
    highlightPhrase && currentSentence?.includes(highlightPhrase);

  return (
    <div
      style={{
        position: "absolute",
        bottom: `${bottomOffset}px`,
        left: "40px",
        right: "40px",
        display: "flex",
        justifyContent: "center",
        opacity: entryProgress,
        transform: `translateY(${slideY}px)`,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "inline-block",
          borderRadius: "4px",
          maxWidth: "90%",
          ...currentStyle,
          fontSize: isHighlight
            ? "64px"
            : (currentStyle.fontSize as string),
          color: isHighlight ? "#ff3333" : currentStyle.color,
          boxShadow: isHighlight
            ? "0 0 60px rgba(255,51,51,0.5), 0 4px 20px rgba(0,0,0,0.5)"
            : "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            letterSpacing: "2px",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
          }}
        >
          {currentSentence}
        </span>
      </div>
    </div>
  );
};

export default TimedSubtitles;
