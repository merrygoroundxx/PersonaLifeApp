import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Line, Pattern, Rect } from "react-native-svg";
import { ThemeConfig } from "../types/theme";

interface PersonaBackgroundProps {
  themeConfig: ThemeConfig;
  children: React.ReactNode;
}

const PersonaBackground: React.FC<PersonaBackgroundProps> = ({
  themeConfig,
  children,
}) => {
  const { colors, styles } = themeConfig;

  const renderTexture = () => {
    switch (styles.textureType) {
      case "noise":
        return (
          <Svg style={StyleSheet.absoluteFill} opacity={0.05}>
            <Defs>
              <Pattern
                id="noisePattern"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                {Array.from({ length: 50 }).map((_, i) => (
                  <Rect
                    key={i}
                    x={Math.random() * 100}
                    y={Math.random() * 100}
                    width="1"
                    height="1"
                    fill="white"
                  />
                ))}
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#noisePattern)" />
          </Svg>
        );
      case "rainbow":
        return (
          <View style={StyleSheet.absoluteFill}>
            <View
              style={{
                height: 8,
                width: "100%",
                flexDirection: "row",
              }}
            >
              {[
                "#FF0000",
                "#FF7F00",
                "#FFFF00",
                "#00FF00",
                "#0000FF",
                "#4B0082",
                "#8B00FF",
              ].map((c, i) => (
                <View key={i} style={{ flex: 1, backgroundColor: c }} />
              ))}
            </View>
            <Svg style={StyleSheet.absoluteFill} opacity={0.1}>
              {Array.from({ length: 20 }).map((_, i) => (
                <Line
                  key={i}
                  x1="0"
                  y1={i * 40}
                  x2="100%"
                  y2={i * 40}
                  stroke="white"
                  strokeWidth="1"
                />
              ))}
            </Svg>
          </View>
        );
      case "glass":
        return (
          <Svg style={StyleSheet.absoluteFill} opacity={0.2}>
            {Array.from({ length: 10 }).map((_, i) => (
              <Circle
                key={i}
                cx={`${Math.random() * 100}%`}
                cy={`${Math.random() * 100}%`}
                r={Math.random() * 50}
                fill="white"
                opacity={0.1}
              />
            ))}
          </Svg>
        );
      default:
        return null;
    }
  };

  if (colors.gradient) {
    return (
      <LinearGradient
        colors={[...colors.gradient]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {renderTexture()}
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {renderTexture()}
      {children}
    </View>
  );
};

export default PersonaBackground;
