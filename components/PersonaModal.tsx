import React from "react";
import { Modal, View, Text, TouchableOpacity, Platform } from "react-native";
import { ThemeConfig } from "../types/theme";

interface PersonaModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  themeConfig: ThemeConfig;
}

const PersonaModal: React.FC<PersonaModalProps> = ({
  visible,
  title,
  message,
  onClose,
  themeConfig,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/80 p-6">
        <View
          className="w-full max-w-sm border-2 overflow-hidden"
          style={{
            backgroundColor: themeConfig.colors.background,
            borderColor: themeConfig.colors.primary,
            transform: [{ skewX: themeConfig.styles.skew }],
          }}
        >
          {/* Header */}
          <View
            className="p-3 border-b-2"
            style={{
              backgroundColor: themeConfig.colors.primary,
              borderColor: themeConfig.colors.accent,
            }}
          >
            <Text
              className="font-black text-center text-lg italic"
              style={{
                color: themeConfig.colors.accent,
                fontFamily: themeConfig.styles.fontFamily,
                transform: [{ skewX: `-${themeConfig.styles.skew}` }],
              }}
            >
              {title.toUpperCase()}
            </Text>
          </View>

          {/* Body */}
          <View className="p-6">
            <Text
              className="text-center font-bold text-base leading-6"
              style={{
                color: themeConfig.colors.text,
                transform: [{ skewX: `-${themeConfig.styles.skew}` }],
              }}
            >
              {message}
            </Text>
          </View>

          {/* Footer */}
          <TouchableOpacity
            onPress={onClose}
            className="p-4 active:opacity-80 border-t-2"
            style={{
              backgroundColor: themeConfig.colors.secondary,
              borderColor: themeConfig.colors.primary,
            }}
          >
            <Text
              className="text-center font-black text-lg italic tracking-widest"
              style={{
                color: themeConfig.colors.primary,
                transform: [{ skewX: `-${themeConfig.styles.skew}` }],
              }}
            >
              {Platform.OS === "web" ? "OK" : "I UNDERSTAND"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PersonaModal;
