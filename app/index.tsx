import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import { useFocusEffect, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AnimatedNumber from "../components/AnimatedNumber";
import StatRadarChart from "../components/StatRadarChart";
import { PersonaTheme, THEME_CONFIGS } from "../types/theme";
import { analyzeActivityWithAI } from "../utils/aiModel";
import { ActivityRecord, PersonaStats } from "../utils/types";

const STORAGE_KEY = "@persona_activities";
const THEME_STORAGE_KEY = "@persona_current_theme";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // 输入状态
  const [activityName, setActivityName] = useState("");
  const [feeling, setFeeling] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<PersonaTheme>("P5");

  // 数据状态
  const [totalStats, setTotalStats] = useState<PersonaStats>({
    knowledge: 0,
    courage: 0,
    charm: 0,
    kindness: 0,
    dexterity: 0,
    expression: 0,
    diligence: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadTheme();
    }, []),
  );

  const loadTheme = async () => {
    const theme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (theme) setCurrentTheme(theme as PersonaTheme);
  };

  const themeConfig = THEME_CONFIGS[currentTheme];

  // 加载本地数据并计算总分
  const loadData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const data: ActivityRecord[] =
        jsonValue != null ? JSON.parse(jsonValue) : [];
      recalculateStats(data);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  const recalculateStats = (data: ActivityRecord[]) => {
    const newStats: PersonaStats = {
      knowledge: 0,
      courage: 0,
      charm: 0,
      kindness: 0,
      dexterity: 0,
      expression: 0,
      diligence: 0,
    };
    data.forEach((record) => {
      newStats.knowledge += record.gainedStats.knowledge || 0;
      newStats.courage += record.gainedStats.courage || 0;
      newStats.charm += record.gainedStats.charm || 0;
      newStats.kindness += record.gainedStats.kindness || 0;
      newStats.dexterity += record.gainedStats.dexterity || 0;
      newStats.expression += record.gainedStats.expression || 0;
      newStats.diligence += record.gainedStats.diligence || 0;
    });
    setTotalStats(newStats);
  };

  // 提交处理
  const handleSubmit = async () => {
    if (!activityName.trim())
      return Alert.alert("Hold on!", "You need to do something first.");

    setLoading(true);
    try {
      // 1. AI 计算
      const gainedStats = await analyzeActivityWithAI(activityName, feeling);

      // 2. 构建新记录
      const newRecord: ActivityRecord = {
        id: Date.now().toString(), // 简单的ID生成
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        timestamp: Date.now(),
        activityName,
        feeling,
        gainedStats,
      };

      // 3. 保存到本地 (Append mode)
      const existingJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingData: ActivityRecord[] = existingJson
        ? JSON.parse(existingJson)
        : [];
      const newData = [...existingData, newRecord];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

      // 4. 更新 UI
      recalculateStats(newData);
      setActivityName("");
      setFeeling("");

      // 5. 简单的反馈动画/Alert
      let msg = t("home.stats_updated") + "\n";
      Object.entries(gainedStats).forEach(([k, v]) => {
        if (v > 0) msg += `${t(`stats.${k}`).toUpperCase()} +${v} ♪\n`;
      });
      Alert.alert(t("home.rank_up"), msg);
    } catch (error) {
      Alert.alert("Error", "The velvet room is closed currently.");
    } finally {
      setLoading(false);
    }
  };

  // 导出数据
  const handleExport = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Notice",
        "File export is only available on Android/iOS in this demo.",
      );
      return;
    }

    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    const file = new File(Paths.document, "persona_life_data.json");

    try {
      // 创建或覆盖导出文件
      file.create({ overwrite: true, intermediates: true });
      file.write(jsonValue || "[]");
    } catch (e) {
      console.error("Failed to export data file", e);
      Alert.alert("Error", "Failed to export data file.");
      return;
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri);
    }
  };

  return (
    <ScrollView
      className="flex-1 p-4"
      style={{ backgroundColor: themeConfig.colors.background }}
    >
      {/* 1. 五维展示区 (动态雷达图) */}
      <View
        className="mb-8 items-center"
        style={{ transform: [{ skewX: themeConfig.styles.skew }] }}
      >
        <View
          className="p-1 border-2 mb-4 w-full"
          style={{
            backgroundColor: themeConfig.colors.primary,
            borderColor: themeConfig.colors.accent,
            transform: [{ skewX: `-${themeConfig.styles.skew}` }],
          }}
        >
          <Text
            className="font-black text-center italic"
            numberOfLines={1}
            style={{
              color: themeConfig.colors.accent,
              fontFamily: themeConfig.styles.fontFamily,
              fontSize: 20, // Initial size, can be adjusted dynamically if needed
            }}
          >
            {t("stats.title").toUpperCase()}
          </Text>
        </View>

        <StatRadarChart
          stats={totalStats}
          themeConfig={themeConfig}
          size={300}
        />

        {/* 详细数值显示 */}
        <View className="flex-row flex-wrap justify-center mt-4 gap-4">
          {themeConfig.stats.map((stat) => (
            <View key={stat} className="items-center">
              <Text
                className="text-[10px] font-bold opacity-70"
                style={{ color: themeConfig.colors.text }}
              >
                {t(`stats.${stat}`).toUpperCase()}
              </Text>
              <AnimatedNumber
                value={totalStats[stat]}
                className="text-lg font-black"
                style={{ color: themeConfig.colors.primary }}
              />
            </View>
          ))}
        </View>
      </View>

      {/* 2. 输入区域 */}
      <View
        className="p-4 rounded-lg border-2 border-dashed"
        style={{
          backgroundColor: `${themeConfig.colors.accent}1A`, // 10% opacity
          borderColor: themeConfig.colors.primary,
        }}
      >
        <Text
          className="mb-1 font-bold"
          style={{ color: themeConfig.colors.text }}
        >
          {t("home.today_activity")}
        </Text>
        <TextInput
          className="bg-white p-3 mb-4 rounded text-black font-medium"
          placeholder={t("home.activity_placeholder")}
          value={activityName}
          onChangeText={setActivityName}
        />

        <Text
          className="mb-1 font-bold"
          style={{ color: themeConfig.colors.text }}
        >
          {t("home.feeling_label")}
        </Text>
        <TextInput
          className="bg-white p-3 mb-6 rounded text-black font-medium h-20"
          placeholder={t("home.feeling_placeholder")}
          multiline
          textAlignVertical="top"
          value={feeling}
          onChangeText={setFeeling}
        />

        <TouchableOpacity
          className="p-4 transform active:scale-95"
          style={{
            backgroundColor: loading ? "#666" : themeConfig.colors.primary,
            transform: [{ skewX: themeConfig.styles.skew }],
          }}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              className="text-white text-center font-black text-xl tracking-widest"
              style={{
                transform: [{ skewX: `-${themeConfig.styles.skew}` }],
                fontFamily: themeConfig.styles.fontFamily,
              }}
            >
              {t("home.submit_btn")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 3. 底部操作栏 */}
      <View className="flex-row justify-between mt-8 mb-10">
        <TouchableOpacity
          className="py-3 px-6 rounded"
          style={{ backgroundColor: "#333", transform: [{ skewY: "1deg" }] }}
          onPress={() => router.push("/history")}
        >
          <Text className="text-white font-bold">{t("home.calendar_btn")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 px-6 rounded"
          style={{
            backgroundColor: "#004B8D",
            transform: [{ skewY: "-1deg" }],
          }}
          onPress={() => router.push("/settings")}
        >
          <Text className="text-white font-bold">{t("home.settings_btn")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 px-6 rounded"
          style={{ backgroundColor: "#444" }}
          onPress={handleExport}
        >
          <Text className="text-white font-bold">{t("home.export_btn")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
