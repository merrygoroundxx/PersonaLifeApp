import React from "react";
import { View, Text, ViewProps } from "react-native";
import { ThemeConfig } from "../types/theme";
import { scaleSize } from "../utils/layout";

interface StickerTextProps extends ViewProps {
  text: string;
  themeConfig: ThemeConfig;
  fontSize?: number;
  textColor?: string;
}

const StickerText: React.FC<StickerTextProps> = ({
  text,
  themeConfig,
  fontSize = 24,
  style,
  textColor,
}) => {
  const { styles, colors } = themeConfig;

  if (styles.containerType !== "jagged") {
    return (
      <Text
        style={[
          {
            color: textColor ?? colors.accent,
            fontFamily: styles.fontFamily,
            fontSize,
            fontWeight: "900",
          },
          style as any,
        ]}
      >
        {text}
      </Text>
    );
  }

  // P5 Sticker style
  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap" }, style]}>
      {text.split("").map((char, i) => {
        const rotation = (Math.random() - 0.5) * 15;
        const scale = 0.9 + Math.random() * 0.2;
        const translateY = (Math.random() - 0.5) * scaleSize(5);

        return (
          <View
            key={i}
            style={{
              backgroundColor: i % 2 === 0 ? colors.accent : colors.primary,
              paddingHorizontal: scaleSize(4),
              marginHorizontal: Math.max(1, scaleSize(1)),
              marginBottom: scaleSize(4),
              transform: [
                { rotate: `${rotation}deg` },
                { scale },
                { translateY },
              ],
              borderWidth: Math.max(1, scaleSize(1)),
              borderColor: colors.secondary,
            }}
          >
            <Text
              style={{
                color: textColor ?? (i % 2 === 0 ? colors.secondary : colors.accent),
                fontFamily: styles.fontFamily,
                fontSize,
                fontWeight: "900",
              }}
            >
              {char}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default StickerText;
