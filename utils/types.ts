export type StatType =
  | "knowledge"
  | "courage"
  | "charm"
  | "kindness"
  | "dexterity"
  | "expression"
  | "diligence";

export interface PersonaStats {
  knowledge: number; // 知识
  courage: number; // 勇气
  charm: number; // 魅力
  kindness: number; // 宽容/体贴
  dexterity: number; // 灵巧
  expression: number; // 表达
  diligence: number; // 毅力
}

export interface ActivityRecord {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  timestamp: number;
  activityName: string;
  feeling: string;
  gainedStats: PersonaStats;
}
