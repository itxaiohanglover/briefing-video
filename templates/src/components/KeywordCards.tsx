import { useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../colors";
import { KeywordCard } from "../types";

interface KeywordCardsProps {
  keywords: KeywordCard[];
  delay?: number;
}

export const KeywordCards: React.FC<KeywordCardsProps> = ({
  keywords,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        justifyContent: "center",
        marginBottom: "24px",
      }}
    >
      {keywords.map((keyword, index) => {
        const itemDelay = delay + index * 10;
        const opacity = interpolate(
          frame,
          [itemDelay, itemDelay + 20],
          [0, 1],
          { extrapolateRight: "clamp" }
        );
        const translateY = interpolate(
          frame,
          [itemDelay, itemDelay + 20],
          [20, 0],
          { extrapolateRight: "clamp" }
        );

        return (
          <div
            key={index}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: keyword.color || COLORS.accent,
              color: "white",
              padding: "10px 20px",
              borderRadius: "24px",
              fontSize: "24px",
              fontWeight: "bold",
              opacity,
              transform: `translateY(${translateY}px)`,
              boxShadow: `0 4px 15px ${(keyword.color || COLORS.accent)}40`,
            }}
          >
            <span>{keyword.text}</span>
          </div>
        );
      })}
    </div>
  );
};
