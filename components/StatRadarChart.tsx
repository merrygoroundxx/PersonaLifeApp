import React, { useEffect } from "react";
import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Path,
  Polygon,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { getStatsConfigByTheme } from "../constants/statsConfig";
import { PersonaTheme, ThemeConfig } from "../types/theme";
import { scaleFont, scaleSize } from "../utils/layout";
import { PersonaStatsState, StatType } from "../utils/types";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface RadarChartProps {
  stats: PersonaStatsState;
  themeConfig: ThemeConfig;
  currentTheme: PersonaTheme;
  size?: number;
}

const StatRadarChart: React.FC<RadarChartProps> = ({
  stats,
  themeConfig,
  currentTheme,
  size = 300,
}) => {
  // Debug log
  useEffect(() => {
    console.log("StatRadarChart Stats Update:", {
      theme: currentTheme,
      knowledge: stats.knowledge.value,
      courage: stats.courage.value,
    });
  }, [stats, currentTheme]);

  const { stats: activeStats, colors, styles } = themeConfig;
  const numStats = activeStats.length;
  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const angleStep = (2 * Math.PI) / numStats;

  // Stable shared values
  const knowledge = useSharedValue(0);
  const courage = useSharedValue(0);
  const charm = useSharedValue(0);
  const kindness = useSharedValue(0);
  const dexterity = useSharedValue(0);
  const expression = useSharedValue(0);
  const diligence = useSharedValue(0);

  const shared = React.useMemo(
    () =>
      ({
        knowledge,
        courage,
        charm,
        kindness,
        dexterity,
        expression,
        diligence,
      }) as Record<StatType, SharedValue<number>>,
    [knowledge, courage, charm, kindness, dexterity, expression, diligence],
  );

  const orderedShared = React.useMemo(
    () => activeStats.map((stat) => shared[stat]),
    [activeStats, shared],
  );

  useEffect(() => {
    const config = getStatsConfigByTheme(currentTheme);
    activeStats.forEach((stat) => {
      const max = config.thresholds[stat][4];
      const rawValue = stats[stat].value || 0;
      // Calculate normalized value (0 to 1)
      const normalized = max > 0 ? Math.min(rawValue, max) / max : 0;

      shared[stat].value = withSpring(normalized, {
        damping: 10,
        stiffness: 80,
      });
    });
  }, [stats, activeStats, currentTheme, shared]);

  const pathD = useDerivedValue(() => {
    if (orderedShared.length === 0) return "";
    let d = "";
    for (let i = 0; i < orderedShared.length; i++) {
      const normalizedValue = orderedShared[i].value;
      const r = normalizedValue * radius;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      if (i === 0) {
        d += `M ${x} ${y}`;
      } else {
        d += ` L ${x} ${y}`;
      }
    }
    d += " Z";
    return d;
  }, [orderedShared, radius, center, angleStep]);

  const animatedProps = useAnimatedProps(() => {
    return { d: pathD.value };
  });

  const renderBackground = () => {
    switch (styles.containerType) {
      case "jagged": // P5
        const jaggedPoints = activeStats
          .map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = radius * (1 + (i % 2 === 0 ? 0.1 : -0.1));
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          })
          .join(" ");
        return (
          <Polygon
            points={jaggedPoints}
            fill={colors.secondary}
            stroke={colors.primary}
            strokeWidth={scaleSize(4)}
            strokeDasharray={`${scaleSize(10)},${scaleSize(5)}`}
          />
        );
      case "rounded-retro": // P4
        return (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill={colors.secondary}
            stroke={colors.accent}
            strokeWidth={scaleSize(10)}
            strokeOpacity={0.2}
          />
        );
      case "glass-cut": // P3
        return (
          <G>
            <Defs>
              <RadialGradient id="p3Grad" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0" stopColor={colors.primary} stopOpacity="0.2" />
                <Stop
                  offset="1"
                  stopColor={colors.background}
                  stopOpacity="0.6"
                />
              </RadialGradient>
            </Defs>
            <Circle cx={center} cy={center} r={radius} fill="url(#p3Grad)" />
          </G>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {renderBackground()}
        <G>
          {/* Axes */}
          {activeStats.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <Line
                key={i}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke={colors.accent}
                strokeOpacity={0.2}
                strokeWidth={scaleSize(1)}
              />
            );
          })}

          {/* Stat Polygon */}
          <AnimatedPath
            animatedProps={animatedProps}
            fill={colors.primary}
            fillOpacity={styles.containerType === "glass-cut" ? 0.4 : 0.8}
            stroke={colors.accent}
            strokeWidth={scaleSize(2)}
          />

          {/* Labels */}
          {activeStats.map((stat, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + scaleSize(35);
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);

            return (
              <SvgText
                key={i}
                x={x}
                y={y}
                fill={colors.text}
                fontSize={
                  styles.containerType === "jagged"
                    ? scaleFont(14)
                    : scaleFont(12)
                }
                fontWeight="900"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {stat.toUpperCase()}
              </SvgText>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

export default StatRadarChart;
