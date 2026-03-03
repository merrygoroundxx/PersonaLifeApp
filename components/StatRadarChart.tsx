import React, { useEffect } from "react";
import { View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import Svg, {
    Circle,
    Defs,
    G,
    Line,
    Polygon,
    RadialGradient,
    Stop,
    Text as SvgText,
} from "react-native-svg";
import { ThemeConfig } from "../types/theme";
import { PersonaStatsState, StatType } from "../utils/types";

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

interface RadarChartProps {
  stats: PersonaStatsState;
  themeConfig: ThemeConfig;
  size?: number;
}

const StatRadarChart: React.FC<RadarChartProps> = ({
  stats,
  themeConfig,
  size = 300,
}) => {
  const { stats: activeStats, colors, styles } = themeConfig;
  const numStats = activeStats.length;
  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const angleStep = (2 * Math.PI) / numStats;
  const maxValue = 50;

  const shared = {
    knowledge: useSharedValue(0),
    courage: useSharedValue(0),
    charm: useSharedValue(0),
    kindness: useSharedValue(0),
    dexterity: useSharedValue(0),
    expression: useSharedValue(0),
    diligence: useSharedValue(0),
  } as Record<StatType, SharedValue<number>>;

  const orderedShared = activeStats.map((stat) => shared[stat]);

  useEffect(() => {
    activeStats.forEach((stat, i) => {
      shared[stat].value = withSpring(stats[stat].value || 0, {
        damping: 10,
        stiffness: 80,
      });
    });
  }, [stats, activeStats]);

  const animatedProps = useAnimatedProps(() => {
    const pts: string[] = [];
    for (let i = 0; i < orderedShared.length; i++) {
      const value = orderedShared[i].value;
      const r = (Math.min(value, maxValue) / maxValue) * radius;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      pts.push(`${x},${y}`);
    }
    return { points: pts.join(" ") };
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
            strokeWidth={4}
            strokeDasharray="10,5"
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
            strokeWidth={10}
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
                strokeWidth={1}
              />
            );
          })}

          {/* Stat Polygon */}
          <AnimatedPolygon
            animatedProps={animatedProps}
            fill={colors.primary}
            fillOpacity={styles.containerType === "glass-cut" ? 0.4 : 0.8}
            stroke={colors.accent}
            strokeWidth={2}
          />

          {/* Labels */}
          {activeStats.map((stat, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 35;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);

            return (
              <SvgText
                key={i}
                x={x}
                y={y}
                fill={colors.text}
                fontSize={styles.containerType === "jagged" ? 14 : 12}
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
