import { getStatsConfigByTheme } from "../constants/statsConfig";
import { PersonaTheme } from "../types/theme";
import {
  PersonaStatsPoints,
  PersonaStatsState,
  StatEntry,
  StatType,
} from "../utils/types";

export interface RankUpEvent {
  stat: StatType;
  oldRank: number;
  newRank: number;
  titleKey: string;
}

export const initializeEmptyStats = (): PersonaStatsState => {
  const base: StatEntry = {
    value: 0,
    rank: 1,
    isMaxed: false,
    overflowPoints: 0,
  };
  return {
    knowledge: { ...base },
    courage: { ...base },
    charm: { ...base },
    kindness: { ...base },
    dexterity: { ...base },
    expression: { ...base },
    diligence: { ...base },
  };
};

export const getDemoStats = (theme: PersonaTheme): PersonaStatsState => {
  const base = initializeEmptyStats();
  
  // Helper to set stat
  const set = (stat: StatType, value: number, rank: number, isMaxed = false) => {
    base[stat] = { value, rank, isMaxed, overflowPoints: 0 };
  };

  if (theme === "P5") {
    // knowledge, courage, dexterity, kindness, charm
    // Max: ~105, 64, 55, 82, 79
    set("knowledge", 80, 4); // Learned
    set("courage", 45, 4); // Daring
    set("dexterity", 55, 5, true); // Transcendent
    set("kindness", 60, 4); // Selfless
    set("charm", 70, 4); // Charismatic
  } else if (theme === "P4") {
    // knowledge, kindness, courage, expression, diligence
    // Max: ~240, 140, 140, 85, 130
    set("knowledge", 160, 4); // Professor
    set("kindness", 140, 5, true); // Saintly
    set("courage", 90, 4); // Brave
    set("expression", 60, 4); // Touching
    set("diligence", 100, 4); // Thorough
  } else if (theme === "P3") {
    // knowledge, courage, charm
    // Max: ~200, 60, 70
    set("knowledge", 150, 5); // Genius
    set("courage", 60, 6, true); // Badass (Rank 6 in P3 logic? No, types say 1-5, but P3 has 6 ranks. 
    // Wait, types/theme.ts says P3 stats are knowledge, courage, charm.
    // constants/statsConfig.ts says P3 thresholds have 5 levels (index 0..4).
    // So let's stick to rank 5 max.
    set("courage", 50, 4); // Tough
    set("charm", 65, 5); // Charismatic
  }

  return base;
};

export const calculateNewStats = (
  current: PersonaStatsState,
  gained: PersonaStatsPoints,
  theme: PersonaTheme,
): { next: PersonaStatsState; rankUps: RankUpEvent[] } => {
  const cfg = getStatsConfigByTheme(theme);
  const next: PersonaStatsState = { ...current };
  const rankUps: RankUpEvent[] = [];

  (Object.keys(next) as StatType[]).forEach((stat) => {
    const entry = next[stat];
    const add = gained[stat] || 0;
    if (add <= 0) return;

    const newValue = entry.value + add;
    const thresholds = cfg.thresholds[stat];
    let newRank = entry.rank;

    for (let r = 5; r >= 1; r--) {
      const req = thresholds[r - 1];
      if (newValue >= req) {
        newRank = r;
        break;
      }
    }

    const isMaxed = newRank === 5;
    const cap = thresholds[4];
    const overflow = isMaxed && newValue > cap ? newValue - cap : 0;

    const updated: StatEntry = {
      value: newValue,
      rank: newRank,
      isMaxed,
      overflowPoints: overflow,
    };
    next[stat] = updated;

    if (newRank > entry.rank) {
      rankUps.push({
        stat,
        oldRank: entry.rank,
        newRank,
        titleKey: cfg.titles[stat][newRank - 1],
      });
    }

    if (isMaxed && overflow > 0) {
      handleMaxRankOverflow(stat, overflow);
    }
  });

  return { next, rankUps };
};

export const handleMaxRankOverflow = (stat: StatType, overflow: number) => {
  // TODO: Future Rebirth/Exchange Logic
};

export const triggerNGPlusInheritance = (
  oldState: PersonaStatsState,
): PersonaStatsState => {
  // TODO: Future New Game+ Logic
  return oldState;
};
