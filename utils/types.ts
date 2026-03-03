export type StatType =
  | "knowledge"
  | "courage"
  | "charm"
  | "kindness"
  | "dexterity"
  | "expression"
  | "diligence";

export interface StatEntry {
  value: number;
  rank: number; // 1-5
  isMaxed: boolean;
  overflowPoints: number;
}

export type PersonaStatsState = {
  [K in StatType]: StatEntry;
};

export type PersonaStatsPoints = {
  [K in StatType]: number;
};

export interface ActivityRecord {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  timestamp: number;
  activityName: string;
  feeling: string;
  gainedPoints: PersonaStatsPoints;
}
