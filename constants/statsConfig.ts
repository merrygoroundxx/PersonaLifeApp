import { PersonaTheme } from "../types/theme";
import { StatType } from "../utils/types";

export type RankThresholds = { [K in StatType]: number[] }; // index: 0..4 for ranks 1..5 cumulative
export type RankTitleKeys = { [K in StatType]: string[] }; // i18n keys per rank

export interface ThemeStatsConfig {
  thresholds: RankThresholds;
  titles: RankTitleKeys;
}

const BASE_ZERO = [0, 10, 30, 60, 100]; // fallback cumulative thresholds

const P5_THRESHOLDS: RankThresholds = {
  knowledge: [0, 20, 47, 72, 105],
  courage: [0, 6, 16, 31, 64], // Guts
  charm: [0, 4, 32, 56, 79],
  dexterity: [0, 8, 21, 38, 55], // Proficiency
  kindness: [0, 9, 28, 56, 82],
  expression: BASE_ZERO, // not in P5, use fallback
  diligence: BASE_ZERO, // not in P5, use fallback
};

const P4_THRESHOLDS: RankThresholds = {
  knowledge: [0, 30, 80, 150, 240],
  courage: [0, 16, 40, 80, 140],
  expression: [0, 13, 33, 53, 85],
  diligence: [0, 16, 40, 80, 130],
  kindness: [0, 16, 40, 80, 140], // Understanding -> kindness
  dexterity: BASE_ZERO,
  charm: BASE_ZERO,
};

const P3_THRESHOLDS: RankThresholds = {
  knowledge: [0, 20, 80, 140, 200], // Academics (mapped to knowledge)
  courage: [0, 15, 30, 45, 60],
  charm: [0, 15, 30, 45, 70],
  dexterity: BASE_ZERO,
  kindness: BASE_ZERO,
  expression: BASE_ZERO,
  diligence: BASE_ZERO,
};

const P5_TITLES: RankTitleKeys = {
  knowledge: [
    "titles.p5.knowledge.1",
    "titles.p5.knowledge.2",
    "titles.p5.knowledge.3",
    "titles.p5.knowledge.4",
    "titles.p5.knowledge.5",
  ],
  courage: [
    "titles.p5.guts.1",
    "titles.p5.guts.2",
    "titles.p5.guts.3",
    "titles.p5.guts.4",
    "titles.p5.guts.5",
  ],
  charm: [
    "titles.p5.charm.1",
    "titles.p5.charm.2",
    "titles.p5.charm.3",
    "titles.p5.charm.4",
    "titles.p5.charm.5",
  ],
  dexterity: [
    "titles.p5.proficiency.1",
    "titles.p5.proficiency.2",
    "titles.p5.proficiency.3",
    "titles.p5.proficiency.4",
    "titles.p5.proficiency.5",
  ],
  kindness: [
    "titles.p5.kindness.1",
    "titles.p5.kindness.2",
    "titles.p5.kindness.3",
    "titles.p5.kindness.4",
    "titles.p5.kindness.5",
  ],
  expression: [
    "titles.generic.expression.1",
    "titles.generic.expression.2",
    "titles.generic.expression.3",
    "titles.generic.expression.4",
    "titles.generic.expression.5",
  ],
  diligence: [
    "titles.generic.diligence.1",
    "titles.generic.diligence.2",
    "titles.generic.diligence.3",
    "titles.generic.diligence.4",
    "titles.generic.diligence.5",
  ],
};

const P4_TITLES: RankTitleKeys = {
  knowledge: [
    "titles.p4.knowledge.1",
    "titles.p4.knowledge.2",
    "titles.p4.knowledge.3",
    "titles.p4.knowledge.4",
    "titles.p4.knowledge.5",
  ],
  courage: [
    "titles.p4.courage.1",
    "titles.p4.courage.2",
    "titles.p4.courage.3",
    "titles.p4.courage.4",
    "titles.p4.courage.5",
  ],
  expression: [
    "titles.p4.expression.1",
    "titles.p4.expression.2",
    "titles.p4.expression.3",
    "titles.p4.expression.4",
    "titles.p4.expression.5",
  ],
  diligence: [
    "titles.p4.diligence.1",
    "titles.p4.diligence.2",
    "titles.p4.diligence.3",
    "titles.p4.diligence.4",
    "titles.p4.diligence.5",
  ],
  kindness: [
    "titles.p4.kindness.1",
    "titles.p4.kindness.2",
    "titles.p4.kindness.3",
    "titles.p4.kindness.4",
    "titles.p4.kindness.5",
  ],
  dexterity: P5_TITLES.dexterity,
  charm: P5_TITLES.charm,
};

const P3_TITLES: RankTitleKeys = {
  knowledge: [
    "titles.p3.knowledge.1",
    "titles.p3.knowledge.2",
    "titles.p3.knowledge.3",
    "titles.p3.knowledge.4",
    "titles.p3.knowledge.5",
  ],
  courage: [
    "titles.p3.courage.1",
    "titles.p3.courage.2",
    "titles.p3.courage.3",
    "titles.p3.courage.4",
    "titles.p3.courage.5",
  ],
  charm: [
    "titles.p3.charm.1",
    "titles.p3.charm.2",
    "titles.p3.charm.3",
    "titles.p3.charm.4",
    "titles.p3.charm.5",
  ],
  dexterity: P5_TITLES.dexterity,
  kindness: P5_TITLES.kindness,
  expression: P5_TITLES.expression,
  diligence: P5_TITLES.diligence,
};

export const getStatsConfigByTheme = (
  theme: PersonaTheme,
): ThemeStatsConfig => {
  switch (theme) {
    case "P5":
      return { thresholds: P5_THRESHOLDS, titles: P5_TITLES };
    case "P4":
      return { thresholds: P4_THRESHOLDS, titles: P4_TITLES };
    case "P3":
      return { thresholds: P3_THRESHOLDS, titles: P3_TITLES };
    default:
      // For now, reuse P5 thresholds and generic titles as fallback
      return { thresholds: P5_THRESHOLDS, titles: P5_TITLES };
  }
};
