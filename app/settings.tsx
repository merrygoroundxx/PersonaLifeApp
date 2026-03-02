import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAIConfig, saveAIConfig } from "../services/aiService";
import { PersonaTheme, THEME_CONFIGS } from "../types/theme";

const THEME_STORAGE_KEY = "@persona_current_theme";

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [currentTheme, setCurrentTheme] = useState<PersonaTheme>("P5");

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
      Alert.alert("Welcome to the Velvet Room", "Your configuration has been saved.");
    } catch (e) {
      Alert.alert("Error", "Failed to save configuration.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#000033] p-4">
      {/* Velvet Room Style Header */}
      <View className="mb-8 mt-4 border-b-2 border-blue-400 pb-4">
        <Text className="text-blue-400 text-3xl font-serif italic text-center">
          VELVET ROOM SETTINGS
        </Text>
        <Text className="text-blue-200 text-xs text-center mt-2 tracking-widest">
          A contract has been signed...
        </Text>
      </View>

      {/* Theme Selector */}
      <View className="mb-8">
        <Text className="text-white text-lg font-bold mb-4">Choose Your Destiny (Theme)</Text>
        <View className="flex-row justify-around">
          {(Object.keys(THEME_CONFIGS) as PersonaTheme[]).map((theme) => (
            <TouchableOpacity
              key={theme}
              onPress={() => setCurrentTheme(theme)}
              className={`px-6 py-3 rounded-full border-2 ${
                currentTheme === theme ? "bg-blue-600 border-white" : "bg-gray-800 border-transparent"
              }`}
            >
              <Text className="text-white font-black">{theme}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* API Config */}
      <View className="bg-blue-900/30 p-6 rounded-3xl border-2 border-blue-500/50">
        <Text className="text-blue-300 font-bold mb-2">Cognitive API Key</Text>
        <TextInput
          className="bg-white/10 p-4 rounded-xl text-white mb-6 border border-blue-400/30"
          placeholder="sk-..."
          placeholderTextColor="#666"
          secureTextEntry
          value={apiKey}
          onChangeText={setApiKey}
        />

        <Text className="text-blue-300 font-bold mb-2">Cognitive Base URL</Text>
        <TextInput
          className="bg-white/10 p-4 rounded-xl text-white mb-8 border border-blue-400/30"
          placeholder="https://api.openai.com/v1"
          placeholderTextColor="#666"
          value={baseURL}
          onChangeText={setBaseURL}
        />

        <TouchableOpacity
          onPress={handleSave}
          className="bg-blue-600 p-5 rounded-2xl transform skew-x-[-10deg] active:bg-blue-700"
        >
          <Text className="text-white text-center font-black text-xl tracking-tighter skew-x-[10deg]">
            SIGN THE CONTRACT
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-gray-500 text-center mt-10 text-[10px]">
        "I am thou, thou art I..."
      </Text>
    </ScrollView>
  );
}
