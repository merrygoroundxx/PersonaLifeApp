import React from "react";
import { Modal, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import StickerText from "./StickerText";
import { ThemeConfig } from "../types/theme";
import { RankUpEvent } from "../services/statsManager";

interface LevelUpModalProps {
  visible: boolean;
  events: RankUpEvent[];
  onClose: () => void;
  themeConfig: ThemeConfig;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  visible,
  events,
  onClose,
  themeConfig,
}) => {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            width: "90%",
            backgroundColor: themeConfig.colors.background,
            borderWidth: 3,
            borderColor: themeConfig.colors.primary,
            padding: 20,
          }}
        >
          <StickerText
            text={t("home.rank_up")}
            themeConfig={themeConfig}
            fontSize={20}
            style={{ marginBottom: 12 }}
          />
          {events.map((e, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <StickerText
                text={`${t(`stats.${e.stat}`)} → R${e.newRank}`}
                themeConfig={themeConfig}
                fontSize={14}
              />
              <StickerText
                text={t(e.titleKey)}
                themeConfig={themeConfig}
                fontSize={12}
              />
            </View>
          ))}
          <TouchableOpacity
            style={{
              marginTop: 12,
              alignSelf: "flex-end",
              borderWidth: 2,
              borderColor: themeConfig.colors.accent,
              backgroundColor: themeConfig.colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
            onPress={onClose}
          >
            <StickerText
              text={"OK"}
              themeConfig={themeConfig}
              fontSize={12}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LevelUpModal;

