import { StatType } from "../utils/types";

export type PersonaTheme = "P3" | "P4" | "P5";

export interface ThemeConfig {
  name: string;
  stats: StatType[];
  colors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
    text: string;
    shadow: string;
    gradient?: string[];
  };
  styles: {
    skew: string;
    rotation: number;
    borderRadius: number;
    fontFamily: string;
    borderWidth: number;
    textureType: "noise" | "rainbow" | "glass";
    containerType: "jagged" | "rounded-retro" | "glass-cut";
    shadowOffset: { width: number; height: number };
  };
}

export const THEME_CONFIGS: Record<PersonaTheme, ThemeConfig> = {
  P3: {
    name: "Persona 3",
    stats: ["knowledge", "courage", "charm"],
    colors: {
      primary: "#00AEEF", // Sea Blue
      secondary: "#004B8D",
      background: "#001A33",
      accent: "#FFFFFF",
      text: "#FFFFFF",
      shadow: "rgba(0, 174, 239, 0.3)",
      gradient: ["#001A33", "#004B8D", "#001A33"],
    },
    styles: {
      skew: "0deg",
      rotation: 0,
      borderRadius: 0,
      fontFamily: "System",
      borderWidth: 1,
      textureType: "glass",
      containerType: "glass-cut",
      shadowOffset: { width: 0, height: 0 },
    },
  },
  P4: {
    name: "Persona 4",
    stats: ["knowledge", "kindness", "courage", "expression", "diligence"],
    colors: {
      primary: "#FFD700", // Yellow
      secondary: "#FFA500",
      background: "#332200",
      accent: "#000000",
      text: "#000000",
      shadow: "rgba(0, 0, 0, 0.5)",
    },
    styles: {
      skew: "0deg",
      rotation: -3,
      borderRadius: 30,
      fontFamily: "System",
      borderWidth: 4,
      textureType: "rainbow",
      containerType: "rounded-retro",
      shadowOffset: { width: 5, height: 5 },
    },
  },
  P5: {
    name: "Persona 5",
    stats: ["knowledge", "courage", "dexterity", "kindness", "charm"],
    colors: {
      primary: "#D32F2F", // Red
      secondary: "#000000",
      background: "#121212",
      accent: "#FFFFFF",
      text: "#FFFFFF",
      shadow: "#D32F2F",
    },
    styles: {
      skew: "-12deg",
      rotation: 0,
      borderRadius: 0,
      fontFamily: "System",
      borderWidth: 3,
      textureType: "noise",
      containerType: "jagged",
      shadowOffset: { width: 8, height: 8 },
    },
  },
};
