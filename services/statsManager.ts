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
  const base: StatEntry = { value: 0, rank: 1, isMaxed: false, overflowPoints: 0 };
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

