import React from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
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
  const invertSkew = (skew: string) => {
    const m = skew.match(/^(-?\d+(?:\.\d+)?)deg$/);
    if (m) {
      const v = parseFloat(m[1]);
      return `${-v}deg`;
    }
    if (skew.startsWith("-")) {
      return skew.substring(1);
    }
    return `-${skew}`;
  };
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 400,
            borderWidth: 2,
            overflow: "hidden",
            backgroundColor: themeConfig.colors.background,
            borderColor: themeConfig.colors.primary,
            transform: [{ skewX: themeConfig.styles.skew }],
          }}
        >
          {/* Header */}
          <View
            style={{
              padding: 12,
              borderBottomWidth: 2,
              backgroundColor: themeConfig.colors.primary,
              borderColor: themeConfig.colors.accent,
            }}
          >
            <Text
              style={{
                fontWeight: "900",
                textAlign: "center",
                fontSize: 18,
                fontStyle: "italic",
                color: themeConfig.colors.accent,
                fontFamily: themeConfig.styles.fontFamily,
                transform: [{ skewX: invertSkew(themeConfig.styles.skew) }],
              }}
            >
              {title.toUpperCase()}
            </Text>
          </View>

          {/* Body */}
          <View style={{ padding: 24 }}>
            <Text
              style={{
                textAlign: "center",
                fontWeight: "700",
                fontSize: 16,
                lineHeight: 24,
                color: themeConfig.colors.text,
                transform: [{ skewX: invertSkew(themeConfig.styles.skew) }],
              }}
            >
              {message}
            </Text>
          </View>

          {/* Footer */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              padding: 16,
              borderTopWidth: 2,
              backgroundColor: themeConfig.colors.secondary,
              borderColor: themeConfig.colors.primary,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "900",
                fontSize: 18,
                fontStyle: "italic",
                letterSpacing: 2,
                color: themeConfig.colors.primary,
                transform: [{ skewX: invertSkew(themeConfig.styles.skew) }],
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
