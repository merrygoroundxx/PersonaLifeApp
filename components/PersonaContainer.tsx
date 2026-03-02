import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { ThemeConfig } from "../types/theme";

interface PersonaContainerProps extends ViewProps {
  themeConfig: ThemeConfig;
  children: React.ReactNode;
}

const PersonaContainer: React.FC<PersonaContainerProps> = ({
  themeConfig,
  children,
  style,
  ...props
}) => {
  const { styles, colors } = themeConfig;

  const renderBackground = (width: number, height: number) => {
    switch (styles.containerType) {
      case "jagged": // P5
        return (
          <Svg
            width={width + 10}
            height={height + 10}
            style={StyleSheet.absoluteFill}
          >
            {/* Red Offset Shadow */}
            <Path
              d={`M8,8 L${width + 8},0 L${width},${height + 8} L0,${height} Z`}
              fill={colors.shadow}
            />
            {/* Main Jagged Shape */}
            <Path
              d={`M0,0 L${width},8 L${width - 8},${height} L8,${height - 8} Z`}
              fill={colors.secondary}
              stroke={colors.accent}
              strokeWidth={styles.borderWidth}
            />
          </Svg>
        );
      case "rounded-retro": // P4
        return (
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <Rect
              x={styles.borderWidth / 2}
              y={styles.borderWidth / 2}
              width={width - styles.borderWidth}
              height={height - styles.borderWidth}
              rx={styles.borderRadius}
              fill={colors.primary}
              stroke={colors.accent}
              strokeWidth={styles.borderWidth}
            />
          </Svg>
        );
      case "glass-cut": // P3
        return (
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.primary} stopOpacity="0.4" />
                <Stop
                  offset="1"
                  stopColor={colors.secondary}
                  stopOpacity="0.1"
                />
              </LinearGradient>
            </Defs>
            <Path
              d={`M0,15 L15,0 L${width},0 L${width},${height - 15} L${width - 15},${height} L0,${height} Z`}
              fill="url(#glassGrad)"
              stroke={colors.accent}
              strokeWidth={styles.borderWidth}
              strokeOpacity={0.5}
            />
          </Svg>
        );
      default:
        return null;
    }
  };

  const [layout, setLayout] = React.useState({ width: 0, height: 0 });

  return (
    <View
      style={StyleSheet.flatten([
        {
          padding: 20,
          transform: [
            { skewX: styles.skew },
            { rotate: `${styles.rotation}deg` },
          ],
        },
        style,
      ])}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayout({ width, height });
      }}
      {...props}
    >
      {layout.width > 0 && renderBackground(layout.width, layout.height)}
      <View
        style={{
          transform: [
            {
              skewX: styles.skew.startsWith("-")
                ? styles.skew.substring(1)
                : `-${styles.skew}`,
            },
          ],
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default PersonaContainer;
