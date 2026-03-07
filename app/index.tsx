import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
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
import { useTheme } from "../context/ThemeContext";
import {
  calculateNewStats,
  getDemoStats,
  initializeEmptyStats,
  RankUpEvent,
} from "../services/statsManager";
import {
  analyzeActivityWithAI,
  normalizePersonaStatsPoints,
} from "../utils/aiModel";
import { heightPercent, scaleFont, scaleSize } from "../utils/layout";
import {
  ActivityRecord,
  PersonaStatsPoints,
  PersonaStatsState,
} from "../utils/types";

const STORAGE_KEY = "@persona_activities";
const STAT_KEYS: (keyof PersonaStatsPoints)[] = [
  "knowledge",
  "courage",
  "charm",
  "kindness",
  "dexterity",
  "expression",
  "diligence",
];

const hasCanonicalPoints = (
  points: unknown,
  normalized: PersonaStatsPoints,
): boolean => {
  if (!points || typeof points !== "object") return false;
  const source = points as Record<string, unknown>;
  return STAT_KEYS.every((key) => source[key] === normalized[key]);
};

const normalizeStoredActivities = (
  records: ActivityRecord[],
): { normalizedData: ActivityRecord[]; hasChanges: boolean } => {
  let hasChanges = false;

  const normalizedData = records.map((record) => {
    const rawRecord = record as ActivityRecord & { gainedStats?: unknown };
    const rawPoints = rawRecord.gainedPoints ?? rawRecord.gainedStats ?? {};
    const normalizedPoints = normalizePersonaStatsPoints(rawPoints);
    const canonical = hasCanonicalPoints(rawRecord.gainedPoints, normalizedPoints);
    const hadLegacyField = rawRecord.gainedStats !== undefined;
    const parsedTimestamp = Number(rawRecord.timestamp);
    const normalizedTimestamp = Number.isFinite(parsedTimestamp)
      ? parsedTimestamp
      : Date.now();
    const normalizedDate = format(new Date(normalizedTimestamp), "yyyy-MM-dd");
    const hadWrongDate = rawRecord.date !== normalizedDate;
    const hadWrongTimestamp = rawRecord.timestamp !== normalizedTimestamp;

    if (!canonical || hadLegacyField || hadWrongDate || hadWrongTimestamp) {
      hasChanges = true;
    }

    const normalizedRecord = {
      ...(rawRecord as ActivityRecord & { gainedStats?: unknown }),
      timestamp: normalizedTimestamp,
      date: normalizedDate,
      gainedPoints: normalizedPoints,
    };
    delete (normalizedRecord as { gainedStats?: unknown }).gainedStats;
    return normalizedRecord;
  });

  return { normalizedData, hasChanges };
};

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentTheme, themeConfig, isDemoMode } = useTheme();

  // 输入状态
  const [activityName, setActivityName] = useState("");
  const [feeling, setFeeling] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });

  // 数据状态
  const [totalStats, setTotalStats] = useState<PersonaStatsState>(
    initializeEmptyStats(),
  );
  const [levelUpEvents, setLevelUpEvents] = useState<RankUpEvent[]>([]);
  const isP5Theme = currentTheme === "P5";
  const calButtonSize = isP5Theme ? scaleSize(70) : scaleSize(80);
  const mainButtonSize = isP5Theme ? scaleSize(100) : scaleSize(120);
  const sideButtonWidth = isP5Theme ? scaleSize(76) : scaleSize(90);
  const sideButtonHeight = isP5Theme ? scaleSize(52) : scaleSize(60);
  const sideButtonFontSize = scaleFont(isP5Theme ? 7 : 10);
  const calButtonFontSize = scaleFont(isP5Theme ? 9 : 12);

  const renderActionLabel = (label: string, fontSize: number) => {
    return (
      <StickerText
        text={label}
        themeConfig={themeConfig}
        fontSize={fontSize}
        style={isP5Theme ? ({ flexWrap: "nowrap", alignSelf: "center" } as any) : undefined}
      />
    );
  };

  const loadAndNormalizeActivitiesFromStorage = useCallback(async () => {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    const rawData: ActivityRecord[] = jsonValue ? JSON.parse(jsonValue) : [];
    const { normalizedData, hasChanges } = normalizeStoredActivities(rawData);

    if (hasChanges) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedData));
    }

    return normalizedData;
  }, []);

  const safeNavigate = (path: any) => {
    if (Platform.OS === "web") {
      (document.activeElement as HTMLElement)?.blur();
    }
    router.push(path);
  };

  const recalculateStats = useCallback(
    (data: ActivityRecord[]) => {
      let state = initializeEmptyStats();
      data.forEach((record) => {
        const points = record.gainedPoints;
        const { next } = calculateNewStats(state, points, currentTheme);
        state = next;
      });
      setTotalStats(state);
    },
    [currentTheme],
  );

  const loadData = useCallback(async () => {
    if (isDemoMode) {
      setTotalStats(getDemoStats(currentTheme));
      return;
    }
    try {
      const data = await loadAndNormalizeActivitiesFromStorage();
      recalculateStats(data);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  }, [
    currentTheme,
    isDemoMode,
    loadAndNormalizeActivitiesFromStorage,
    recalculateStats,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

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
        date: format(new Date(), "yyyy-MM-dd"),
        timestamp: Date.now(),
        activityName,
        feeling,
        gainedPoints: normalizePersonaStatsPoints(gainedPoints),
      };

      // 3. 保存到本地 (Append mode)
      const existingJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingData: ActivityRecord[] = existingJson
        ? JSON.parse(existingJson)
        : [];
      const { normalizedData: normalizedExistingData } =
        normalizeStoredActivities(existingData);
      const newData = [...normalizedExistingData, newRecord];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

      // 4. 更新 UI（以持久化数据为准）
      const latestData = await loadAndNormalizeActivitiesFromStorage();
      recalculateStats(latestData);
      const calc = calculateNewStats(totalStats, newRecord.gainedPoints, currentTheme);
      setLevelUpEvents(calc.rankUps);
      setActivityName("");
      setFeeling("");

      // 5. 简单的反馈动画/Alert
      let msg = t("home.stats_updated") + "\n";
      Object.entries(newRecord.gainedPoints).forEach(([k, v]) => {
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
      try {
        const jsonValue = (await AsyncStorage.getItem(STORAGE_KEY)) ?? "[]";
        const blob = new Blob([jsonValue], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `persona_life_data_${format(new Date(), "yyyy-MM-dd")}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setModalContent({
          title: "OK",
          message: "Download started.",
        });
        setModalVisible(true);
      } catch (e) {
        console.error("Web export failed", e);
        setModalContent({
          title: "Error",
          message: "Failed to export data on web.",
        });
        setModalVisible(true);
      }
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

  const handleImport = async () => {
    if (Platform.OS === "web") {
      try {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          const text = await file.text();
          const data = JSON.parse(text);
          if (!Array.isArray(data)) {
            throw new Error("Invalid data format");
          }
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          const normalizedData = await loadAndNormalizeActivitiesFromStorage();
          recalculateStats(normalizedData);
          setModalContent({
            title: "OK",
            message: "Data restored.",
          });
          setModalVisible(true);
        };
        input.click();
      } catch (e) {
        console.error("Web import failed", e);
        setModalContent({
          title: "Error",
          message: "Failed to import data on web.",
        });
        setModalVisible(true);
      }
      return;
    }

    try {
      let text: string | null = null;
      const metroRequire = (global as any)?.require?.bind(global);
      if (metroRequire) {
        try {
          const DocumentPicker = metroRequire("expo-document-picker");
          if (DocumentPicker?.getDocumentAsync) {
            const result = await DocumentPicker.getDocumentAsync({
              type: "application/json",
              copyToCacheDirectory: true,
            });
            let uri: string | undefined;
            if (result?.assets && result.assets[0]?.uri) {
              uri = result.assets[0].uri;
            } else if (result?.type === "success" && result?.file?.uri) {
              uri = result.file.uri;
            } else if (result?.type === "success" && result?.uri) {
              uri = result.uri;
            }
            if (!uri) {
              throw new Error("No file selected");
            }
            let srcFile: any;
            if ((File as any)?.fromUri) {
              srcFile = (File as any).fromUri(uri);
            } else {
              srcFile = new (File as any)(uri);
            }
            text = await srcFile.text();
          } else {
            const file = new File(Paths.document, "persona_life_data.json");
            text = await file.text();
          }
        } catch {
          const file = new File(Paths.document, "persona_life_data.json");
          text = await file.text();
        }
      } else {
        const file = new File(Paths.document, "persona_life_data.json");
        text = await file.text();
      }
      const data = JSON.parse(text || "[]");
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format");
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      const normalizedData = await loadAndNormalizeActivitiesFromStorage();
      recalculateStats(normalizedData);
      setModalContent({
        title: "OK",
        message: "Data restored from Documents.",
      });
      setModalVisible(true);
    } catch (e) {
      console.error("Native import failed", e);
      setModalContent({
        title: "Error",
        message:
          "Failed to import. Place JSON at Documents/persona_life_data.json and retry.",
      });
      setModalVisible(true);
    }
  };

  return (
    <PersonaBackground themeConfig={themeConfig}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* 1. 五维展示区 (动态雷达图) */}
        <View style={{ marginBottom: scaleSize(48), alignItems: "center" }}>
          <PersonaContainer
            themeConfig={themeConfig}
            style={{ width: "100%", marginBottom: scaleSize(20) }}
          >
            <StickerText
              text={t("stats.title").toUpperCase()}
              themeConfig={themeConfig}
              fontSize={scaleFont(24)}
            />
          </PersonaContainer>

          <StatRadarChart
            key={currentTheme}
            stats={totalStats}
            themeConfig={themeConfig}
            currentTheme={currentTheme}
            size={scaleSize(320)}
          />

          {/* 详细数值显示 - 气泡/玻璃风格 */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: scaleSize(32),
            }}
          >
            {themeConfig.stats.map((stat) => (
              <View
                key={stat}
                style={{ alignItems: "center", margin: scaleSize(12) }}
              >
                <View
                  style={{
                    backgroundColor: themeConfig.colors.primary,
                    paddingHorizontal: scaleSize(12),
                    paddingVertical: scaleSize(4),
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
                    fontSize={scaleFont(10)}
                  />
                </View>
                <View style={{ alignItems: "center" }}>
                  <AnimatedNumber
                    value={totalStats[stat].value}
                    style={{
                      marginTop: scaleSize(8),
                      fontSize: scaleFont(24),
                      fontWeight: "900",
                      color: themeConfig.colors.primary,
                      textShadowColor: themeConfig.colors.shadow,
                      textShadowOffset: { width: 2, height: 2 },
                      textShadowRadius: 1,
                    }}
                  />
                  <View
                    style={{ flexDirection: "row", marginTop: scaleSize(4) }}
                  >
                    <StickerText
                      text={`R${totalStats[stat].rank}`}
                      themeConfig={themeConfig}
                      fontSize={scaleFont(10)}
                      textColor={
                        themeConfig.styles.containerType === "jagged"
                          ? undefined
                          : themeConfig.colors.text
                      }
                    />
                    {totalStats[stat].isMaxed && (
                      <StickerText
                        text={"MAX"}
                        themeConfig={themeConfig}
                        fontSize={scaleFont(10)}
                        textColor={
                          currentTheme === "P5"
                            ? "#FF0000"
                            : currentTheme === "P3"
                              ? "#00AEEF"
                              : themeConfig.colors.primary
                        }
                        style={{ marginLeft: scaleSize(6) }}
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
          style={{ marginBottom: scaleSize(40) }}
        >
          <StickerText
            text={t("home.today_activity")}
            themeConfig={themeConfig}
            fontSize={scaleFont(16)}
            style={{ marginBottom: scaleSize(10) }}
          />
          <TextInput
            placeholder={t("home.activity_placeholder")}
            placeholderTextColor={currentTheme === "P3" ? "#aaa" : "#666"}
            value={activityName}
            onChangeText={setActivityName}
            style={{
              backgroundColor:
                currentTheme === "P5"
                  ? "#fff"
                  : currentTheme === "P4"
                    ? "#FFE599"
                    : "rgba(0, 20, 40, 0.6)",
              padding: scaleSize(16),
              marginBottom: scaleSize(24),
              borderRadius: themeConfig.styles.borderRadius || 8,
              color: currentTheme === "P3" ? "#fff" : "#000",
              fontWeight: "700",
              fontSize: scaleFont(16),
              transform: [{ rotate: currentTheme === "P5" ? "-1deg" : "0deg" }],
              borderWidth: scaleSize(2),
              borderColor: themeConfig.colors.secondary,
            }}
          />

          <StickerText
            text={t("home.feeling_label")}
            themeConfig={themeConfig}
            fontSize={scaleFont(16)}
            style={{ marginBottom: scaleSize(10) }}
          />
          <TextInput
            placeholder={t("home.feeling_placeholder")}
            placeholderTextColor={currentTheme === "P3" ? "#aaa" : "#666"}
            multiline
            textAlignVertical="top"
            value={feeling}
            onChangeText={setFeeling}
            style={{
              backgroundColor:
                currentTheme === "P5"
                  ? "#fff"
                  : currentTheme === "P4"
                    ? "#FFE599"
                    : "rgba(0, 20, 40, 0.6)",
              padding: scaleSize(16),
              marginBottom: scaleSize(32),
              borderRadius: themeConfig.styles.borderRadius || 8,
              color: currentTheme === "P3" ? "#fff" : "#000",
              fontWeight: "700",
              fontSize: scaleFont(16),
              height: heightPercent(12),
              transform: [{ rotate: currentTheme === "P5" ? "1deg" : "0deg" }],
              borderWidth: scaleSize(2),
              borderColor: themeConfig.colors.secondary,
            }}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              padding: scaleSize(20),
              backgroundColor: loading ? "#666" : themeConfig.colors.primary,
              transform: [{ skewX: themeConfig.styles.skew }, { scale: 1.05 }],
              borderWidth: scaleSize(2),
              borderColor: themeConfig.colors.accent,
              shadowColor: themeConfig.colors.shadow,
              shadowOffset: themeConfig.styles.shadowOffset,
              shadowOpacity: 0.8,
              shadowRadius: 0,
              elevation: 5,
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
                fontSize={scaleFont(20)}
              />
            )}
          </TouchableOpacity>
        </PersonaContainer>

        {/* 3. 底部操作栏 - 打破网格 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: scaleSize(80),
            height: scaleSize(128),
            gap: scaleSize(8),
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              padding: scaleSize(16),
              borderRadius: scaleSize(40),
              borderWidth: scaleSize(2),
              backgroundColor: themeConfig.colors.secondary,
              borderColor: themeConfig.colors.primary,
              width: calButtonSize,
              height: calButtonSize,
              transform: [{ rotate: "-15deg" }, { translateY: 10 }],
            }}
            onPress={() => safeNavigate("/history")}
          >
            {renderActionLabel("CAL", calButtonFontSize)}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              alignItems: "center",
              justifyContent: "center",
              borderWidth: scaleSize(4),
              backgroundColor: themeConfig.colors.primary,
              borderColor: themeConfig.colors.accent,
              width: mainButtonSize,
              height: mainButtonSize,
              borderRadius: currentTheme === "P5" ? 0 : scaleSize(60),
              transform: [
                { rotate: "5deg" },
                { skewX: themeConfig.styles.skew },
                { scale: 1.1 },
              ],
              shadowColor: themeConfig.colors.shadow,
              shadowOffset: { width: scaleSize(10), height: scaleSize(10) },
              shadowOpacity: 0.5,
              shadowRadius: 0,
              elevation: 10,
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
                fontSize={scaleFont(16)}
              />
              <StickerText
                text="ROOM"
                themeConfig={themeConfig}
                fontSize={scaleFont(14)}
              />
            </View>
          </TouchableOpacity>

          <View style={{ width: sideButtonWidth }}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderRadius: scaleSize(8),
                borderWidth: scaleSize(2),
                backgroundColor: "#444",
                borderColor: themeConfig.colors.text,
                width: sideButtonWidth,
                height: sideButtonHeight,
                marginBottom: scaleSize(10),
                transform: [{ rotate: "10deg" }, { translateY: -10 }],
              }}
              onPress={handleExport}
            >
              {renderActionLabel(isP5Theme ? "EXP" : "EXPORT", sideButtonFontSize)}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderRadius: scaleSize(8),
                borderWidth: scaleSize(2),
                backgroundColor: "#333",
                borderColor: themeConfig.colors.text,
                width: sideButtonWidth,
                height: sideButtonHeight,
                transform: [{ rotate: "-8deg" }, { translateY: -6 }],
              }}
              onPress={handleImport}
            >
              {renderActionLabel(isP5Theme ? "IMP" : "IMPORT", sideButtonFontSize)}
            </TouchableOpacity>
          </View>
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
