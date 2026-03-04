import { Stack } from "expo-router";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import "../src/i18n";
import "./global.css";

function RootLayoutNav() {
  const { themeConfig } = useTheme();

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: themeConfig.colors.primary },
          headerTintColor: themeConfig.colors.accent,
          headerTitleStyle: {
            fontWeight: "bold",
            fontFamily: themeConfig.styles.fontFamily,
          },
          contentStyle: { backgroundColor: themeConfig.colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Daily Life (日常)" }} />
        <Stack.Screen
          name="history"
          options={{ title: "Memories (记忆)", presentation: "modal" }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: "Velvet Room (设置)", presentation: "modal" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
