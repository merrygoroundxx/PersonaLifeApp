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
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import AnimatedNumber from "../components/AnimatedNumber";
import LevelUpModal from "../components/LevelUpModal";
import PersonaBackground from "../components/PersonaBackground";
import PersonaContainer from "../components/PersonaContainer";
import PersonaModal from "../components/PersonaModal";
import StatRadarChart from "../components/StatRadarChart";
import StickerText from "../components/StickerText";
import {
    calculateNewStats,
    initializeEmptyStats,
    RankUpEvent,
} from "../services/statsManager";
import { PersonaTheme, THEME_CONFIGS } from "../types/theme";
import { analyzeActivityWithAI } from "../utils/aiModel";
import {
    ActivityRecord,
    PersonaStatsPoints,
    PersonaStatsState,
} from "../utils/types";

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

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

  // 数据状态
  const [totalStats, setTotalStats] = useState<PersonaStatsState>(
    initializeEmptyStats(),
  );
  const [levelUpEvents, setLevelUpEvents] = useState<RankUpEvent[]>([]);

  const loadTheme = useCallback(async () => {
    const theme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (theme) setCurrentTheme(theme as PersonaTheme);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const data: ActivityRecord[] =
        jsonValue != null ? JSON.parse(jsonValue) : [];
      recalculateStats(data);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadInitial = async () => {
        await Promise.all([loadData(), loadTheme()]);
      };
      loadInitial();
    }, [loadData, loadTheme]),
  );

  const themeConfig = THEME_CONFIGS[currentTheme];

  const safeNavigate = (path: any) => {
    if (Platform.OS === "web") {
      (document.activeElement as HTMLElement)?.blur();
    }
    router.push(path);
  };

  const recalculateStats = (data: ActivityRecord[]) => {
    let state = initializeEmptyStats();
    data.forEach((record) => {
      const points =
        // 兼容旧数据字段 gainedStats
        (record as any).gainedPoints ??
        (record as any).gainedStats ??
        ({} as PersonaStatsPoints);
      const { next } = calculateNewStats(state, points, currentTheme);
      state = next;
    });
    setTotalStats(state);
  };

  // 提交处理
  const handleSubmit = async () => {
    if (!activityName.trim()) return; // 移除 Alert 改为静默

    setLoading(true);
    try {
      // 1. AI 计算
      const gainedPoints: PersonaStatsPoints = await analyzeActivityWithAI(
        activityName,
        feeling,
      );

      // 2. 构建新记录
      const newRecord: ActivityRecord = {
        id: Date.now().toString(), // 简单的ID生成
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        timestamp: Date.now(),
        activityName,
        feeling,
        gainedPoints,
      };

      // 3. 保存到本地 (Append mode)
      const existingJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingData: ActivityRecord[] = existingJson
        ? JSON.parse(existingJson)
        : [];
      const newData = [...existingData, newRecord];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

      // 4. 更新 UI
      const calc = calculateNewStats(totalStats, gainedPoints, currentTheme);
      setTotalStats(calc.next);
      setLevelUpEvents(calc.rankUps);
      setActivityName("");
      setFeeling("");

      // 5. 简单的反馈动画/Alert
      let msg = t("home.stats_updated") + "\n";
      Object.entries(gainedPoints).forEach(([k, v]) => {
        if (v > 0) msg += `${t(`stats.${k}`).toUpperCase()} +${v} ♪\n`;
      });
      setModalContent({ title: t("home.rank_up"), message: msg });
      setModalVisible(true);
    } catch {
      setModalContent({
        title: "Error",
        message: "The velvet room is closed currently.",
      });
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // 导出数据
  const handleExport = async () => {
    if (Platform.OS === "web") {
      setModalContent({
        title: "Notice",
        message: "File export is only available on Android/iOS in this demo.",
      });
      setModalVisible(true);
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
    <PersonaBackground themeConfig={themeConfig}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* 1. 五维展示区 (动态雷达图) */}
        <View style={{ marginBottom: 48, alignItems: "center" }}>
          <PersonaContainer
            themeConfig={themeConfig}
            style={{ width: "100%", marginBottom: 20 }}
          >
            <StickerText
              text={t("stats.title").toUpperCase()}
              themeConfig={themeConfig}
              fontSize={24}
            />
          </PersonaContainer>

          <StatRadarChart
            stats={totalStats}
            themeConfig={themeConfig}
            size={320}
          />

          {/* 详细数值显示 - 气泡/玻璃风格 */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: 32,
            }}
          >
            {themeConfig.stats.map((stat) => (
              <View key={stat} style={{ alignItems: "center", margin: 12 }}>
                <View
                  style={{
                    backgroundColor: themeConfig.colors.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: themeConfig.styles.borderRadius || 10,
                    transform: [
                      { skewX: themeConfig.styles.skew },
                      { rotate: `${(Math.random() - 0.5) * 10}deg` },
                    ],
                  }}
                >
                  <StickerText
                    text={t(`stats.${stat}`).toUpperCase()}
                    themeConfig={themeConfig}
                    fontSize={10}
                  />
                </View>
                <View style={{ alignItems: "center" }}>
                  <AnimatedNumber
                    value={totalStats[stat].value}
                    style={{
                      marginTop: 8,
                      fontSize: 24,
                      fontWeight: "900",
                      color: themeConfig.colors.primary,
                      textShadowColor: themeConfig.colors.shadow,
                      textShadowOffset: { width: 2, height: 2 },
                      textShadowRadius: 1,
                    }}
                  />
                  <View style={{ flexDirection: "row", marginTop: 4 }}>
                    <StickerText
                      text={`R${totalStats[stat].rank}`}
                      themeConfig={themeConfig}
                      fontSize={10}
                    />
                    {totalStats[stat].isMaxed && (
                      <StickerText
                        text={"MAX"}
                        themeConfig={themeConfig}
                        fontSize={10}
                        textColor={
                          currentTheme === "P5"
                            ? "#FF0000"
                            : currentTheme === "P3"
                            ? "#00AEEF"
                            : themeConfig.colors.accent
                        }
                        style={{ marginLeft: 6 }}
                      />
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 2. 输入区域 */}
        <PersonaContainer
          themeConfig={themeConfig}
          style={{ marginBottom: 40 }}
        >
          <StickerText
            text={t("home.today_activity")}
            themeConfig={themeConfig}
            fontSize={16}
            style={{ marginBottom: 10 }}
          />
          <TextInput
            placeholder={t("home.activity_placeholder")}
            value={activityName}
            onChangeText={setActivityName}
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: 16,
              marginBottom: 24,
              borderRadius: 8,
              color: "#000",
              fontWeight: "700",
              transform: [{ rotate: "-1deg" }],
              borderWidth: 2,
              borderColor: themeConfig.colors.secondary,
            }}
          />

          <StickerText
            text={t("home.feeling_label")}
            themeConfig={themeConfig}
            fontSize={16}
            style={{ marginBottom: 10 }}
          />
          <TextInput
            placeholder={t("home.feeling_placeholder")}
            multiline
            textAlignVertical="top"
            value={feeling}
            onChangeText={setFeeling}
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: 16,
              marginBottom: 32,
              borderRadius: 8,
              color: "#000",
              fontWeight: "700",
              height: 96,
              transform: [{ rotate: "1deg" }],
              borderWidth: 2,
              borderColor: themeConfig.colors.secondary,
            }}
          />

          <TouchableOpacity
            style={{
              padding: 20,
              backgroundColor: loading ? "#666" : themeConfig.colors.primary,
              transform: [{ skewX: themeConfig.styles.skew }, { scale: 1.05 }],
              borderWidth: 2,
              borderColor: themeConfig.colors.accent,
            }}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <StickerText
                text={t("home.submit_btn")}
                themeConfig={themeConfig}
                fontSize={20}
              />
            )}
          </TouchableOpacity>
        </PersonaContainer>

        {/* 3. 底部操作栏 - 打破网格 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-around",
            marginBottom: 80,
            height: 128,
          }}
        >
          <TouchableOpacity
            style={{
              padding: 16,
              borderRadius: 40,
              borderWidth: 2,
              backgroundColor: themeConfig.colors.secondary,
              borderColor: themeConfig.colors.primary,
              width: 80,
              height: 80,
              transform: [{ rotate: "-15deg" }, { translateY: 10 }],
            }}
            onPress={() => safeNavigate("/history")}
          >
            <StickerText text="CAL" themeConfig={themeConfig} fontSize={12} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 4,
              backgroundColor: themeConfig.colors.primary,
              borderColor: themeConfig.colors.accent,
              width: 120,
              height: 120,
              borderRadius: currentTheme === "P5" ? 0 : 60,
              transform: [
                { rotate: "5deg" },
                { skewX: themeConfig.styles.skew },
                { scale: 1.1 },
              ],
              shadowColor: themeConfig.colors.shadow,
              shadowOffset: { width: 10, height: 10 },
              shadowOpacity: 0.5,
              shadowRadius: 0,
            }}
            onPress={() => safeNavigate("/settings")}
          >
            <View
              style={{
                transform: [
                  { skewX: currentTheme === "P5" ? "12deg" : "0deg" },
                ],
              }}
            >
              <StickerText
                text="VELVET"
                themeConfig={themeConfig}
                fontSize={16}
              />
              <StickerText
                text="ROOM"
                themeConfig={themeConfig}
                fontSize={14}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              padding: 16,
              borderRadius: 8,
              borderWidth: 2,
              backgroundColor: "#444",
              borderColor: themeConfig.colors.text,
              width: 90,
              height: 60,
              transform: [{ rotate: "10deg" }, { translateY: -10 }],
            }}
            onPress={handleExport}
          >
            <StickerText
              text="EXPORT"
              themeConfig={themeConfig}
              fontSize={10}
            />
          </TouchableOpacity>
        </View>

        <PersonaModal
          visible={modalVisible}
          title={modalContent.title}
          message={modalContent.message}
          onClose={() => setModalVisible(false)}
          themeConfig={themeConfig}
        />
        <LevelUpModal
          visible={levelUpEvents.length > 0}
          events={levelUpEvents}
          onClose={() => setLevelUpEvents([])}
          themeConfig={themeConfig}
        />
      </ScrollView>
    </PersonaBackground>
  );
}
