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
  };
  styles: {
    skew: string;
    borderRadius: number;
    fontFamily: string;
    borderWidth: number;
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
    },
    styles: {
      skew: "0deg",
      borderRadius: 20,
      fontFamily: "System", // Should be Serif in real use
      borderWidth: 1,
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
    },
    styles: {
      skew: "0deg",
      borderRadius: 0,
      fontFamily: "System",
      borderWidth: 2,
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
    },
    styles: {
      skew: "-12deg",
      borderRadius: 0,
      fontFamily: "System", // Should be "Ransom Note" style
      borderWidth: 3,
    },
  },
};
