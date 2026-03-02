import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import PersonaModal from "../components/PersonaModal";
import { getAIConfig, saveAIConfig } from "../services/aiService";
import { PersonaTheme, THEME_CONFIGS } from "../types/theme";

const THEME_STORAGE_KEY = "@persona_current_theme";
const LANGUAGE_KEY = "@persona_current_language";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const [apiKey, setApiKey] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [currentTheme, setCurrentTheme] = useState<PersonaTheme>("P5");

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const config = await getAIConfig();
    if (config) {
      setApiKey(config.apiKey);
      setBaseURL(config.baseURL);
    }
    const theme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (theme) {
      setCurrentTheme(theme as PersonaTheme);
    }
  };

  const handleSave = async () => {
    try {
      await saveAIConfig({ apiKey, baseURL });
      await AsyncStorage.setItem(THEME_STORAGE_KEY, currentTheme);
      setModalContent({
        title: t("settings.title"),
        message: t("settings.save_success"),
      });
      setModalVisible(true);
    } catch (e) {
      setModalContent({
        title: "Error",
        message: t("settings.save_error"),
      });
      setModalVisible(true);
    }
  };

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  };

  const themeConfig = THEME_CONFIGS[currentTheme];

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 p-4"
        style={{ backgroundColor: themeConfig.colors.background }}
      >
        {/* Velvet Room Style Header */}
        <View
          className="mb-8 mt-4 border-b-2 pb-4"
          style={{ borderColor: themeConfig.colors.primary }}
        >
          <Text
            className="text-3xl italic text-center"
            style={{
              color: themeConfig.colors.primary,
              fontFamily: themeConfig.styles.fontFamily,
            }}
          >
            {t("settings.title")}
          </Text>
          <Text
            className="text-xs text-center mt-2 tracking-widest"
            style={{ color: themeConfig.colors.text, opacity: 0.6 }}
          >
            {t("settings.contract_signed")}
          </Text>
        </View>

        {/* Language Selector */}
        <View className="mb-8">
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: themeConfig.colors.text }}
          >
            {t("settings.language_label")}
          </Text>
          <View
            className="flex-row justify-around"
            style={{ transform: [{ skewX: themeConfig.styles.skew }] }}
          >
            {[
              { code: "zh", label: "中文" },
              { code: "en", label: "EN" },
            ].map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => changeLanguage(lang.code)}
                className="px-6 py-3 border-2"
                style={{
                  backgroundColor:
                    i18n.language === lang.code
                      ? themeConfig.colors.primary
                      : "transparent",
                  borderColor: themeConfig.colors.primary,
                }}
              >
                <Text
                  className="font-black"
                  style={{
                    color:
                      i18n.language === lang.code
                        ? themeConfig.colors.accent
                        : themeConfig.colors.text,
                    transform: [{ skewX: `-${themeConfig.styles.skew}` }],
                  }}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theme Selector */}
        <View className="mb-8">
          <Text
            className="text-lg font-bold mb-4"
            style={{ color: themeConfig.colors.text }}
          >
            {t("settings.theme_label")}
          </Text>
          <View className="flex-row justify-around">
            {(Object.keys(THEME_CONFIGS) as PersonaTheme[]).map((theme) => (
              <TouchableOpacity
                key={theme}
                onPress={() => setCurrentTheme(theme)}
                className="px-6 py-3 border-2"
                style={{
                  backgroundColor:
                    currentTheme === theme
                      ? themeConfig.colors.primary
                      : "transparent",
                  borderColor: themeConfig.colors.primary,
                  borderRadius: themeConfig.styles.borderRadius,
                  transform: [{ skewX: themeConfig.styles.skew }],
                }}
              >
                <Text
                  className="font-black"
                  style={{
                    color:
                      currentTheme === theme
                        ? themeConfig.colors.accent
                        : themeConfig.colors.text,
                    transform: [{ skewX: `-${themeConfig.styles.skew}` }],
                  }}
                >
                  {theme}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* API Config */}
        <View
          className="p-6 border-2"
          style={{
            backgroundColor: `${themeConfig.colors.accent}1A`,
            borderColor: themeConfig.colors.primary,
            borderRadius: themeConfig.styles.borderRadius,
          }}
        >
          <Text
            className="font-bold mb-2"
            style={{ color: themeConfig.colors.text }}
          >
            {t("settings.api_key_label")}
          </Text>
          <TextInput
            className="bg-white p-4 rounded-xl text-black mb-6 border border-gray-300"
            placeholder="sk-..."
            placeholderTextColor="#999"
            secureTextEntry
            value={apiKey}
            onChangeText={setApiKey}
          />

          <Text
            className="font-bold mb-2"
            style={{ color: themeConfig.colors.text }}
          >
            {t("settings.api_url_label")}
          </Text>
          <TextInput
            className="bg-white p-4 rounded-xl text-black mb-8 border border-gray-300"
            placeholder="https://api.openai.com/v1"
            placeholderTextColor="#999"
            value={baseURL}
            onChangeText={setBaseURL}
          />

          <TouchableOpacity
            onPress={handleSave}
            className="p-5 active:opacity-80"
            style={{
              backgroundColor: themeConfig.colors.primary,
              transform: [{ skewX: themeConfig.styles.skew }],
            }}
          >
            <Text
              className="text-white text-center font-black text-xl tracking-tighter"
              style={{
                transform: [{ skewX: `-${themeConfig.styles.skew}` }],
                color: themeConfig.colors.accent,
              }}
            >
              {t("settings.save_btn")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-500 text-center mt-10 text-[10px]">
          {t("settings.iamthou")}
        </Text>

        <PersonaModal
          visible={modalVisible}
          title={modalContent.title}
          message={modalContent.message}
          onClose={() => setModalVisible(false)}
          themeConfig={themeConfig}
        />
      </ScrollView>
    </View>
  );
}
