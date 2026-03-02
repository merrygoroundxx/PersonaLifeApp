import React from "react";
import { View, Text } from "react-native";
import Svg, { G, Line, Polygon, Circle, Text as SvgText } from "react-native-svg";
import { PersonaStats, StatType } from "../utils/types";
import { ThemeConfig } from "../types/theme";

interface RadarChartProps {
  stats: PersonaStats;
  themeConfig: ThemeConfig;
  size?: number;
}

const StatRadarChart: React.FC<RadarChartProps> = ({
  stats,
  themeConfig,
  size = 300,
}) => {
  const { stats: activeStats, colors } = themeConfig;
  const numStats = activeStats.length;
  const center = size / 2;
  const radius = (size / 2) * 0.7; // Leave space for labels
  const angleStep = (2 * Math.PI) / numStats;

  // Max value for each stat (assumed to be 100 for percentage)
  const maxValue = 50; // Scaling: 50 points max for visualization

  // Calculate vertex points
  const points = activeStats.map((stat, i) => {
    const value = stats[stat] || 0;
    const r = (Math.min(value, maxValue) / maxValue) * radius;
    const angle = i * angleStep - Math.PI / 2; // Start from top
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Background lines and grid
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = gridLevels.map((level) => {
    return activeStats
      .map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + radius * level * Math.cos(angle);
        const y = center + radius * level * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
  });

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <G>
          {/* Grid lines */}
          {gridPolygons.map((points, i) => (
            <Polygon
              key={i}
              points={points}
              fill="none"
              stroke={colors.secondary}
              strokeOpacity={0.3}
              strokeWidth={1}
            />
          ))}

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
                stroke={colors.secondary}
                strokeOpacity={0.3}
                strokeWidth={1}
              />
            );
          })}

          {/* Stat Polygon */}
          <Polygon
            points={polygonPoints}
            fill={colors.primary}
            fillOpacity={0.6}
            stroke={colors.primary}
            strokeWidth={2}
          />

          {/* Vertices */}
          {points.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.accent} />
          ))}

          {/* Labels */}
          {activeStats.map((stat, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 25;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);

            return (
              <SvgText
                key={i}
                x={x}
                y={y}
                fill={colors.text}
                fontSize={12}
                fontWeight="bold"
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
