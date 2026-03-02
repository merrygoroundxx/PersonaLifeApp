import AsyncStorage from "@react-native-async-storage/async-storage";
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { PersonaTheme, THEME_CONFIGS } from "../types/theme";
import { ActivityRecord } from "../utils/types";

const STORAGE_KEY = "@persona_activities";
const THEME_STORAGE_KEY = "@persona_current_theme";

export default function HistoryScreen() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<PersonaTheme>("P5");

  useEffect(() => {
    loadData();
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const theme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (theme) setCurrentTheme(theme as PersonaTheme);
  };

  const themeConfig = THEME_CONFIGS[currentTheme];

  const loadData = async () => {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue) {
      // 按时间倒序
      const data: ActivityRecord[] = JSON.parse(jsonValue);
      setActivities(data.sort((a, b) => b.timestamp - a.timestamp));
    }
  };

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
    <View
      className="flex-1"
      style={{ backgroundColor: themeConfig.colors.background }}
    >
      <ScrollView className="flex-1">
        {/* 日历网格 */}
        <View className="p-4">
          <Text
            className="text-2xl font-black mb-4 text-center"
            style={{
              color: themeConfig.colors.primary,
              fontFamily: themeConfig.styles.fontFamily,
            }}
          >
            {format(today, "MMMM yyyy").toUpperCase()}
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {daysInMonth.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const hasActivity = activities.some((a) => a.date === dayStr);
              const isSelected = selectedDate === dayStr;

              return (
                <TouchableOpacity
                  key={dayStr}
                  onPress={() => setSelectedDate(dayStr)}
                  className="w-[13%] aspect-square mb-2 items-center justify-center"
                  style={{
                    backgroundColor: isSelected
                      ? themeConfig.colors.primary
                      : `${themeConfig.colors.accent}1A`,
                    borderRadius: themeConfig.styles.borderRadius,
                    borderWidth: hasActivity
                      ? themeConfig.styles.borderWidth
                      : 0,
                    borderColor: themeConfig.colors.primary,
                  }}
                >
                  <Text
                    className="font-bold"
                    style={{
                      color: isSelected
                        ? themeConfig.colors.accent
                        : themeConfig.colors.text,
                    }}
                  >
                    {format(day, "d")}
                  </Text>
                  {/* 活动指示点 */}
                  {hasActivity && !isSelected && (
                    <View
                      className="absolute bottom-1 w-1 h-1 rounded-full"
                      style={{ backgroundColor: themeConfig.colors.primary }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 详情列表 */}
        <View
          className="p-4 min-h-[300px] rounded-t-3xl border-t-4"
          style={{
            backgroundColor: `${themeConfig.colors.secondary}EE`,
            borderColor: themeConfig.colors.primary,
          }}
        >
          <Text
            className="text-xl font-bold mb-4 ml-2 italic"
            style={{
              color: themeConfig.colors.accent,
              fontFamily: themeConfig.styles.fontFamily,
            }}
          >
            {selectedDate ? `RECORDS: ${selectedDate}` : "SELECT A DAY"}
          </Text>

          {selectedRecords.length === 0 && selectedDate && (
            <Text className="text-gray-500 italic ml-2">
              No memories found for this day.
            </Text>
          )}

          {selectedRecords.map((record) => (
            <View
              key={record.id}
              className="p-4 mb-3 rounded border-l-4"
              style={{
                backgroundColor: `${themeConfig.colors.background}AA`,
                borderColor: themeConfig.colors.primary,
                transform: [{ skewX: themeConfig.styles.skew }],
              }}
            >
              <View
                className="flex-row justify-between mb-1"
                style={{
                  transform: [{ skewX: `-${themeConfig.styles.skew}` }],
                }}
              >
                <Text className="text-white font-bold text-lg">
                  {record.activityName}
                </Text>
                <Text className="text-gray-400 text-xs">
                  {format(new Date(record.timestamp), "HH:mm")}
                </Text>
              </View>
              <Text
                className="text-gray-300 text-sm mb-2"
                style={{
                  transform: [{ skewX: `-${themeConfig.styles.skew}` }],
                }}
              >
                "{record.feeling}"
              </Text>

              {/* 显示提升的数值 (仅显示当前主题相关的) */}
              <View
                className="flex-row flex-wrap gap-2"
                style={{
                  transform: [{ skewX: `-${themeConfig.styles.skew}` }],
                }}
              >
                {themeConfig.stats.map((key) => {
                  const val = record.gainedStats[key];
                  if (!val || val === 0) return null;
                  return (
                    <View
                      key={key}
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: themeConfig.colors.primary }}
                    >
                      <Text className="text-white text-[10px] font-black uppercase">
                        {key} +{val}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
