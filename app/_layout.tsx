import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#D32F2F" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold", fontFamily: "System" },
          contentStyle: { backgroundColor: "#555555" }, // 默认背景
        }}
      >
        <Stack.Screen name="index" options={{ title: "Daily Life (日常)" }} />
        <Stack.Screen
          name="history"
          options={{ title: "Memories (记忆)", presentation: "modal" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
