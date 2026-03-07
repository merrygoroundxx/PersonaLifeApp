import AsyncStorage from "@react-native-async-storage/async-storage";
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity, View } from "react-native";
import PersonaBackground from "../components/PersonaBackground";
import PersonaContainer from "../components/PersonaContainer";
import StickerText from "../components/StickerText";

import { useTheme } from "../context/ThemeContext";
import { normalizePersonaStatsPoints } from "../utils/aiModel";
import { ActivityRecord, PersonaStatsPoints } from "../utils/types";

const STORAGE_KEY = "@persona_activities";

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { themeConfig } = useTheme();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!jsonValue) {
      setActivities([]);
      return;
    }
    const data: ActivityRecord[] = JSON.parse(jsonValue);
    setActivities([...data].sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // 生成当前月份的日历天数
  const today = new Date();
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today),
  });

  // 筛选选中日期的记录
  const selectedRecords = selectedDate
    ? activities.filter((a) => a.date === selectedDate)
    : [];

  return (
    <PersonaBackground themeConfig={themeConfig}>
      <ScrollView style={{ flex: 1 }}>
        {/* 日历网格 */}
        <View style={{ padding: 16 }}>
          <PersonaContainer
            themeConfig={themeConfig}
            style={{ marginBottom: 20, marginTop: 10 }}
          >
            <StickerText
              text={format(today, "MMMM yyyy").toUpperCase()}
              themeConfig={themeConfig}
              fontSize={20}
            />
          </PersonaContainer>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {daysInMonth.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const hasActivity = activities.some((a) => a.date === dayStr);
              const isSelected = selectedDate === dayStr;

              return (
                <TouchableOpacity
                  key={dayStr}
                  onPress={() => setSelectedDate(dayStr)}
                  style={{
                    width: "13%",
                    aspectRatio: 1,
                    marginBottom: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    backgroundColor: isSelected
                      ? themeConfig.colors.primary
                      : themeConfig.colors.secondary,
                    borderColor: hasActivity
                      ? themeConfig.colors.accent
                      : "transparent",
                    borderRadius: themeConfig.styles.borderRadius,
                    transform: [
                      { rotate: `${(Math.random() - 0.5) * 15}deg` },
                      { scale: isSelected ? 1.1 : 1 },
                    ],
                  }}
                >
                  <StickerText
                    text={format(day, "d")}
                    themeConfig={themeConfig}
                    fontSize={14}
                  />
                  {/* 活动指示点 */}
                  {hasActivity && !isSelected && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 4,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: themeConfig.colors.accent,
                      }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 详情列表 */}
        <View style={{ padding: 16, minHeight: 400 }}>
          <PersonaContainer
            themeConfig={themeConfig}
            style={{ marginBottom: 20 }}
          >
            <StickerText
              text={
                selectedDate
                  ? `${t("history.records_title")} ${selectedDate}`
                  : t("history.select_day").toUpperCase()
              }
              themeConfig={themeConfig}
              fontSize={16}
            />
          </PersonaContainer>

          {selectedRecords.length === 0 && selectedDate && (
            <StickerText
              text={t("history.no_records")}
              themeConfig={themeConfig}
              fontSize={14}
              style={{ opacity: 0.6, marginLeft: 10 }}
            />
          )}

          {selectedRecords.map((record) => (
            <PersonaContainer
              key={record.id}
              themeConfig={themeConfig}
              style={{ marginBottom: 15 }}
            >
              <View
                style={{
                  position: "relative",
                  paddingBottom: 26,
                }}
              >
                <View style={{ marginBottom: 8, paddingRight: 64 }}>
                  <StickerText
                    text={record.activityName}
                    themeConfig={themeConfig}
                    fontSize={18}
                  />
                </View>
                <StickerText
                  text={format(new Date(record.timestamp), "HH:mm")}
                  themeConfig={themeConfig}
                  fontSize={12}
                  style={{ opacity: 0.7, position: "absolute", right: 0, bottom: 0 }}
                />
              </View>
              <StickerText
                text={`"${record.feeling}"`}
                themeConfig={themeConfig}
                fontSize={14}
                style={{ marginBottom: 10 }}
              />

              {/* 显示提升的数值 */}
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {themeConfig.stats.map((key) => {
                  const points = normalizePersonaStatsPoints(
                    (record as any).gainedPoints ??
                      (record as any).gainedStats ??
                      ({} as PersonaStatsPoints),
                  );
                  const val = points[key];
                  if (!val || val === 0) return null;
                  return (
                    <View
                      key={key}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderWidth: 1,
                        marginRight: 8,
                        marginBottom: 8,
                        backgroundColor: themeConfig.colors.primary,
                        borderColor: themeConfig.colors.accent,
                        transform: [
                          { rotate: `${(Math.random() - 0.5) * 10}deg` },
                        ],
                      }}
                    >
                      <StickerText
                        text={`${t(`stats.${key}`)} +${val}`}
                        themeConfig={themeConfig}
                        fontSize={10}
                      />
                    </View>
                  );
                })}
              </View>
            </PersonaContainer>
          ))}
        </View>
      </ScrollView>
    </PersonaBackground>
  );
}
