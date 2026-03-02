import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
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

import { analyzeActivityWithAI } from "../utils/aiModel";
import { ActivityRecord, PersonaStats } from "../utils/types";

const STORAGE_KEY = "@persona_activities";

export default function HomeScreen() {
  const router = useRouter();

  // 输入状态
  const [activityName, setActivityName] = useState("");
  const [feeling, setFeeling] = useState("");
  const [loading, setLoading] = useState(false);

  // 数据状态
  const [totalStats, setTotalStats] = useState<PersonaStats>({
    knowledge: 0,
    guts: 0,
    proficiency: 0,
    kindness: 0,
    charm: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

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
      guts: 0,
      proficiency: 0,
      kindness: 0,
      charm: 0,
    };
    data.forEach((record) => {
      newStats.knowledge += record.gainedStats.knowledge;
      newStats.guts += record.gainedStats.guts;
      newStats.proficiency += record.gainedStats.proficiency;
      newStats.kindness += record.gainedStats.kindness;
      newStats.charm += record.gainedStats.charm;
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
      let msg = "Stats Updated!\n";
      Object.entries(gainedStats).forEach(([k, v]) => {
        if (v > 0) msg += `${k.toUpperCase()} +${v} ♪\n`;
      });
      Alert.alert("Rank Up!", msg);
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

  // 导入数据 (简单的覆盖逻辑，实际需更严谨)
  const handleImport = async () => {
    Alert.alert(
      "Import",
      "Feature to import JSON implementation required based on specific file picker library.",
    );
    // 这里通常需要 expo-document-picker 来选择文件
  };

  return (
    <ScrollView className="flex-1 bg-neutral-900 p-4">
      {/* 1. 五维展示区 (模拟 Persona 菜单) */}
      <View className="mb-8 rotate-1 transform">
        <View className="bg-red-700 p-1 -skew-x-12 border-2 border-white mb-4">
          <Text className="text-white font-black text-center text-xl skew-x-12 italic">
            YOUR STATS
          </Text>
        </View>

        {Object.entries(totalStats).map(([key, value]) => (
          <View key={key} className="flex-row items-center mb-2">
            <Text className="text-white w-24 font-bold capitalize text-lg tracking-widest">
              {key}
            </Text>
            <View className="flex-1 h-4 bg-gray-800 border border-gray-600 skew-x-[-15deg] overflow-hidden">
              {/* 进度条动画效果 */}
              <View
                className="h-full bg-yellow-400"
                style={{ width: `${Math.min(value * 2, 100)}%` }}
              />
            </View>
            <Text className="text-yellow-400 ml-2 font-bold w-8 text-right">
              {value}
            </Text>
          </View>
        ))}
      </View>

      {/* 2. 输入区域 */}
      <View className="bg-white/10 p-4 rounded-lg border-2 border-red-600 border-dashed">
        <Text className="text-gray-300 mb-1 font-bold">Today's Activity</Text>
        <TextInput
          className="bg-white p-3 mb-4 rounded text-black font-medium"
          placeholder="e.g. Worked at the convenience store..."
          value={activityName}
          onChangeText={setActivityName}
        />

        <Text className="text-gray-300 mb-1 font-bold">Feeling / Thoughts</Text>
        <TextInput
          className="bg-white p-3 mb-6 rounded text-black font-medium h-20"
          placeholder="How did it go?"
          multiline
          textAlignVertical="top"
          value={feeling}
          onChangeText={setFeeling}
        />

        <TouchableOpacity
          className={`p-4 transform -skew-x-6 active:scale-95 ${loading ? "bg-gray-600" : "bg-red-600"}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-black text-xl tracking-widest skew-x-6">
              TAKE YOUR TIME
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 3. 底部操作栏 */}
      <View className="flex-row justify-between mt-8 mb-10">
        <TouchableOpacity
          className="bg-blue-600 py-3 px-6 rounded skew-y-1"
          onPress={() => router.push("/history")}
        >
          <Text className="text-white font-bold">CALENDAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-700 py-3 px-6 rounded -skew-y-1"
          onPress={handleExport}
        >
          <Text className="text-white font-bold">EXPORT DATA</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
