export type StatType =
  | "knowledge"
  | "guts"
  | "proficiency"
  | "kindness"
  | "charm";

export interface PersonaStats {
  knowledge: number; // 学力 (Knowledge)
  guts: number; // 勇气 (Guts)
  proficiency: number; // 灵巧 (Proficiency)
  kindness: number; // 体贴 (Kindness)
  charm: number; // 魅力 (Charm)
}

export interface ActivityRecord {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  timestamp: number;
  activityName: string;
  feeling: string;
  gainedStats: PersonaStats;
}
