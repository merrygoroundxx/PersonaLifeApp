import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";

import PersonaBackground from "../components/PersonaBackground";
import PersonaContainer from "../components/PersonaContainer";
import PersonaModal from "../components/PersonaModal";
import StickerText from "../components/StickerText";
import { useTheme } from "../context/ThemeContext";
import { getAIConfig, saveAIConfig } from "../services/aiService";
import { PersonaTheme, THEME_CONFIGS } from "../types/theme";

const THEME_STORAGE_KEY = "@persona_current_theme";
const LANGUAGE_KEY = "@persona_current_language";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { currentTheme, themeConfig, setTheme } = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [baseURL, setBaseURL] = useState("");

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
  };

  const handleSave = async () => {
    try {
      await saveAIConfig({ apiKey, baseURL });
      setModalContent({
        title: t("settings.title"),
        message: t("settings.save_success"),
      });
      setModalVisible(true);
    } catch {
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

  return (
    <PersonaBackground themeConfig={themeConfig}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Velvet Room Style Header */}
        <PersonaContainer
          themeConfig={themeConfig}
          style={{ marginBottom: 30, marginTop: 20 }}
        >
          <StickerText
            text={t("settings.title").toUpperCase()}
            themeConfig={themeConfig}
            fontSize={24}
          />
          <StickerText
            text={t("settings.contract_signed")}
            themeConfig={themeConfig}
            fontSize={10}
            style={{ marginTop: 5, opacity: 0.7 }}
          />
        </PersonaContainer>

        {/* Language Selector */}
        <View style={{ marginBottom: 40 }}>
          <StickerText
            text={t("settings.language_label")}
            themeConfig={themeConfig}
            fontSize={18}
            style={{ marginBottom: 15, marginLeft: 10 }}
          />
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            {[
              { code: "zh", label: "中文" },
              { code: "en", label: "EN" },
            ].map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => changeLanguage(lang.code)}
                style={{
                  paddingHorizontal: 32,
                  paddingVertical: 16,
                  borderWidth: 2,
                  backgroundColor:
                    i18n.language === lang.code
                      ? themeConfig.colors.primary
                      : themeConfig.colors.secondary,
                  borderColor: themeConfig.colors.accent,
                  transform: [
                    { rotate: `${(Math.random() - 0.5) * 10}deg` },
                    { skewX: themeConfig.styles.skew },
                  ],
                }}
              >
                <StickerText
                  text={lang.label}
                  themeConfig={themeConfig}
                  fontSize={16}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theme Selector */}
        <View style={{ marginBottom: 40 }}>
          <StickerText
            text={t("settings.theme_label")}
            themeConfig={themeConfig}
            fontSize={18}
            style={{ marginBottom: 15, marginLeft: 10 }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              flexWrap: "wrap",
            }}
          >
            {(Object.keys(THEME_CONFIGS) as PersonaTheme[]).map((theme) => (
              <TouchableOpacity
                key={theme}
                onPress={() => setTheme(theme)}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  borderWidth: 2,
                  backgroundColor:
                    currentTheme === theme
                      ? themeConfig.colors.primary
                      : themeConfig.colors.secondary,
                  borderColor: themeConfig.colors.accent,
                  borderRadius: themeConfig.styles.borderRadius,
                  transform: [
                    { skewX: themeConfig.styles.skew },
                    { rotate: `${(Math.random() - 0.5) * 8}deg` },
                  ],
                }}
              >
                <StickerText
                  text={theme}
                  themeConfig={themeConfig}
                  fontSize={16}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* API Config */}
        <PersonaContainer
          themeConfig={themeConfig}
          style={{ marginBottom: 40 }}
        >
          <StickerText
            text={t("settings.api_key_label")}
            themeConfig={themeConfig}
            fontSize={14}
            style={{ marginBottom: 10 }}
          />
          <TextInput
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: 16,
              borderRadius: 8,
              color: "#000",
              fontWeight: "700",
              marginBottom: 24,
              transform: [{ rotate: "1deg" }],
            }}
            placeholder="sk-..."
            placeholderTextColor="#999"
            secureTextEntry
            value={apiKey}
            onChangeText={setApiKey}
          />

          <StickerText
            text={t("settings.api_url_label")}
            themeConfig={themeConfig}
            fontSize={14}
            style={{ marginBottom: 10 }}
          />
          <TextInput
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: 16,
              borderRadius: 8,
              color: "#000",
              fontWeight: "700",
              marginBottom: 32,
              transform: [{ rotate: "-1deg" }],
            }}
            placeholder="https://api.openai.com/v1"
            placeholderTextColor="#999"
            value={baseURL}
            onChangeText={setBaseURL}
          />

          <TouchableOpacity
            onPress={handleSave}
            style={{
              padding: 20,
              borderWidth: 2,
              backgroundColor: themeConfig.colors.primary,
              borderColor: themeConfig.colors.accent,
              transform: [{ skewX: themeConfig.styles.skew }, { scale: 1.1 }],
            }}
          >
            <StickerText
              text={t("settings.save_btn")}
              themeConfig={themeConfig}
              fontSize={20}
            />
          </TouchableOpacity>
        </PersonaContainer>

        <StickerText
          text={t("settings.iamthou")}
          themeConfig={themeConfig}
          fontSize={12}
          style={{ marginBottom: 40, opacity: 0.5 }}
        />

        <PersonaModal
          visible={modalVisible}
          title={modalContent.title}
          message={modalContent.message}
          onClose={() => setModalVisible(false)}
          themeConfig={themeConfig}
        />
      </ScrollView>
    </PersonaBackground>
  );
}
