import AsyncStorage from "@react-native-async-storage/async-storage";
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ActivityRecord } from "../utils/types";

const STORAGE_KEY = "@persona_activities";

export default function HistoryScreen() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

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
    <View className="flex-1 bg-persona-black">
      <ScrollView className="flex-1">
        {/* 日历网格 */}
        <View className="p-4">
          <Text className="text-white text-2xl font-black mb-4 text-center">
            {format(today, "MMMM yyyy")}
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {daysInMonth.map((day, index) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const hasActivity = activities.some((a) => a.date === dayStr);
              const isSelected = selectedDate === dayStr;

              return (
                <View
                  key={dayStr}
                  className="w-[13%] aspect-square mb-2 items-center justify-center"
                >
                  {/* 简单的日历单元格 */}
                  <Text
                    onPress={() => setSelectedDate(dayStr)}
                    className={`w-full h-full text-center py-2 rounded font-bold
                       ${isSelected ? "bg-white text-black" : "bg-gray-800 text-white"}
                       ${hasActivity && !isSelected ? "border-2 border-red-500" : ""}
                     `}
                  >
                    {format(day, "d")}
                  </Text>
                  {/* 活动指示点 */}
                  {hasActivity && (
                    <View className="absolute bottom-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* 详情列表 */}
        <View className="p-4 bg-gray-900 min-h-[300px] rounded-t-3xl border-t-4 border-red-600">
          <Text className="text-white text-xl font-bold mb-4 ml-2">
            {selectedDate ? `Records: ${selectedDate}` : "Select a date above"}
          </Text>

          {selectedRecords.length === 0 && selectedDate && (
            <Text className="text-gray-500 italic ml-2">
              No records found for this day.
            </Text>
          )}

          {selectedRecords.map((record) => (
            <View
              key={record.id}
              className="bg-black/50 p-4 mb-3 rounded border-l-4 border-blue-400"
            >
              <View className="flex-row justify-between mb-1">
                <Text className="text-white font-bold text-lg">
                  {record.activityName}
                </Text>
                <Text className="text-gray-400 text-xs">
                  {format(new Date(record.timestamp), "HH:mm")}
                </Text>
              </View>
              <Text className="text-gray-300 text-sm mb-2">
                "{record.feeling}"
              </Text>

              {/* 显示提升的数值 */}
              <View className="flex-row flex-wrap gap-2">
                {Object.entries(record.gainedStats).map(([key, val]) => {
                  if (val === 0) return null;
                  return (
                    <View key={key} className="bg-red-900 px-2 py-1 rounded">
                      <Text className="text-white text-xs font-bold capitalize">
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
