import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import i18n from "i18next";
import { Platform } from "react-native";
import { PersonaStatsPoints } from "../utils/types";

const API_KEY_STORAGE = "persona_ai_api_key";
const BASE_URL_STORAGE = "persona_ai_base_url";

export interface AIConfig {
  apiKey: string;
  baseURL: string;
}

// 辅助函数：跨平台安全存储
const isWeb = Platform.OS === "web";

const setItem = async (key: string, value: string) => {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getItem = async (key: string): Promise<string | null> => {
  if (isWeb) {
    return await AsyncStorage.getItem(key);
  } else {
    // 某些 Web 环境下 SecureStore 即使加载了也会报错，所以加一层 try-catch
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return await AsyncStorage.getItem(key);
    }
  }
};

export const saveAIConfig = async (config: AIConfig) => {
  await setItem(API_KEY_STORAGE, config.apiKey);
  await setItem(BASE_URL_STORAGE, config.baseURL);
};

export const getAIConfig = async (): Promise<AIConfig | null> => {
  const apiKey = await getItem(API_KEY_STORAGE);
  const baseURL = await getItem(BASE_URL_STORAGE);
  if (!apiKey) return null;
  return { apiKey, baseURL: baseURL || "https://api.openai.com/v1" };
};

export const analyzeActivityWithAI = async (
  activity: string,
  feeling: string,
): Promise<PersonaStatsPoints> => {
  const config = await getAIConfig();
  const currentLanguage = i18n.language || "zh";

  if (!config || !config.apiKey) {
    return fallbackHeuristic(activity, feeling);
  }

  const systemPrompt = i18n.t("ai.system_prompt");

  // Clean up base URL (remove trailing slash if present)
  const baseURL = config.baseURL.replace(/\/+$/, "");

  try {
    let response;
    let data;
    let content;

    // Detect Gemini (Google AI)
    if (baseURL.includes("googleapis.com")) {
      // Fallback to gemini-pro if flash is not available for the key
      const model = "gemini-2.5-flash";
      const url = `${baseURL}/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nActivity: ${activity}\nFeeling: ${feeling}`,
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
          },
        }),
      });

      data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "Gemini API Error");
      }

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid Gemini response structure");
      }

      content = data.candidates[0].content.parts[0].text;
    } else {
      // Default to OpenAI/DeepSeek format
      let model = "gpt-3.5-turbo";

      // Auto-detect DeepSeek
      if (baseURL.includes("deepseek")) {
        model = "deepseek-chat";
      }

      response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: model, // Use auto-detected model
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `Activity: ${activity}\nFeeling: ${feeling}`,
            },
          ],
          temperature: 0.7,
        }),
      });

      data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "OpenAI API Error");
      }

      content = data.choices[0].message.content;
    }

    // Clean up content (sometimes markdown code blocks are included)
    const jsonStr = content.replace(/```json\n?|\n?```/g, "").trim();
    const stats: PersonaStatsPoints = JSON.parse(jsonStr);

    console.log(
      `AI Analysis Successful via ${baseURL.includes("googleapis.com") ? "Gemini" : "OpenAI/DeepSeek"}`,
    );
    return stats;
  } catch (error) {
    console.error("AI Analysis failed, falling back to heuristics", error);
    return fallbackHeuristic(activity, feeling);
  }
};

const fallbackHeuristic = (
  activity: string,
  feeling: string,
): PersonaStatsPoints => {
  const text = (activity + feeling).toLowerCase();
  const stats: PersonaStatsPoints = {
    knowledge: 0,
    courage: 0,
    charm: 0,
    kindness: 0,
    dexterity: 0,
    expression: 0,
    diligence: 0,
  };

  if (text.match(/book|study|read|class|learn|学习|看书|上课/))
    stats.knowledge += 2;
  if (text.match(/scary|horror|challenge|speech|勇气|恐怖|演讲|挑战/))
    stats.courage += 2;
  if (text.match(/bath|coffee|date|talk|party|魅力|澡|咖啡|约会/))
    stats.charm += 2;
  if (text.match(/plant|help|listen|cat|flower|体贴|帮|听|花|猫/))
    stats.kindness += 2;
  if (text.match(/craft|fix|code|build|draw|灵巧|制作|修|代码|画/))
    stats.dexterity += 2;
  if (text.match(/speak|write|poem|essay|表达|说|写|诗/)) stats.expression += 2;
  if (text.match(/work|train|gym|repeat|毅力|工作|训练|健身|重复/))
    stats.diligence += 2;

  // Fallback if no match
  if (Object.values(stats).every((v) => v === 0)) {
    const keys = Object.keys(stats) as (keyof PersonaStatsPoints)[];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    stats[randomKey] += 1;
  }

  return stats;
};
