import * as SecureStore from "expo-secure-store";
import { PersonaStats } from "../utils/types";

const API_KEY_STORAGE = "persona_ai_api_key";
const BASE_URL_STORAGE = "persona_ai_base_url";

export interface AIConfig {
  apiKey: string;
  baseURL: string;
}

export const saveAIConfig = async (config: AIConfig) => {
  await SecureStore.setItemAsync(API_KEY_STORAGE, config.apiKey);
  await SecureStore.setItemAsync(BASE_URL_STORAGE, config.baseURL);
};

export const getAIConfig = async (): Promise<AIConfig | null> => {
  const apiKey = await SecureStore.getItemAsync(API_KEY_STORAGE);
  const baseURL = await SecureStore.getItemAsync(BASE_URL_STORAGE);
  if (!apiKey) return null;
  return { apiKey, baseURL: baseURL || "https://api.openai.com/v1" };
};

export const analyzeActivityWithAI = async (
  activity: string,
  feeling: string
): Promise<PersonaStats> => {
  const config = await getAIConfig();

  if (!config || !config.apiKey) {
    return fallbackHeuristic(activity, feeling);
  }

  try {
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Or user configured model
        messages: [
          {
            role: "system",
            content: `You are a Persona game stat analyzer. Analyze the user's activity and feeling, then assign points (0-3) to each of the 7 core dimensions.
            Dimensions: [knowledge, courage, charm, kindness, dexterity, expression, diligence].
            Return ONLY a JSON object with these keys and their integer values.
            Example: {"knowledge": 2, "courage": 0, "charm": 0, "kindness": 1, "dexterity": 0, "expression": 0, "diligence": 0}`,
          },
          {
            role: "user",
            content: `Activity: ${activity}\nFeeling: ${feeling}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const stats: PersonaStats = JSON.parse(content);
    return stats;
  } catch (error) {
    console.error("AI Analysis failed, falling back to heuristics", error);
    return fallbackHeuristic(activity, feeling);
  }
};

const fallbackHeuristic = (activity: string, feeling: string): PersonaStats => {
  const text = (activity + feeling).toLowerCase();
  const stats: PersonaStats = {
    knowledge: 0,
    courage: 0,
    charm: 0,
    kindness: 0,
    dexterity: 0,
    expression: 0,
    diligence: 0,
  };

  if (text.match(/book|study|read|class|learn|学习|看书|上课/)) stats.knowledge += 2;
  if (text.match(/scary|horror|challenge|speech|勇气|恐怖|演讲|挑战/)) stats.courage += 2;
  if (text.match(/bath|coffee|date|talk|party|魅力|澡|咖啡|约会/)) stats.charm += 2;
  if (text.match(/plant|help|listen|cat|flower|体贴|帮|听|花|猫/)) stats.kindness += 2;
  if (text.match(/craft|fix|code|build|draw|灵巧|制作|修|代码|画/)) stats.dexterity += 2;
  if (text.match(/speak|write|poem|essay|表达|说|写|诗/)) stats.expression += 2;
  if (text.match(/work|train|gym|repeat|毅力|工作|训练|健身|重复/)) stats.diligence += 2;

  // Fallback if no match
  if (Object.values(stats).every((v) => v === 0)) {
    const keys = Object.keys(stats) as (keyof PersonaStats)[];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    stats[randomKey] += 1;
  }

  return stats;
};
