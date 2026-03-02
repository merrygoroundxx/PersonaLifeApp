import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Platform } from "react-native";

import en from "../locales/en.json";
import zh from "../locales/zh.json";

const LANGUAGE_KEY = "@persona_current_language";

const resources = {
  en: { translation: en },
  zh: { translation: zh },
};

// 1. 同步初始化 (适合 SSR/Node 环境)
i18n.use(initReactI18next).init({
  resources,
  lng: "zh",
  fallbackLng: "zh",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// 2. 异步加载持久化语言 (仅在客户端运行)
const loadSavedLanguage = async () => {
  // 避免在 Node 环境下执行 (Static Rendering)
  if (Platform.OS === "web" && typeof window === "undefined") return;

  try {
    const locales = Localization.getLocales();
    let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

    if (!savedLanguage) {
      const bestLocale = locales[0]?.languageCode || "zh";
      savedLanguage = bestLocale.startsWith("zh") ? "zh" : "en";
    }

    if (savedLanguage && savedLanguage !== i18n.language) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (e) {
    console.warn("Failed to load i18n language from storage", e);
  }
};

loadSavedLanguage();

export default i18n;
