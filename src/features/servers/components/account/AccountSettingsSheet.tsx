import type { ThemeName } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "../../../../theme/theme-context";
import { AccountSettingsMenu } from "./account-settings/AccountSettingsMenu";
import { AppearanceSettingsStep } from "./account-settings/AppearanceSettingsStep";
import { SecuritySettingsStep } from "./account-settings/SecuritySettingsStep";
import { PinSetupPanel } from "./PinSetupPanel";
import { TwoFactorPanel } from "./TwoFactorPanel";

type Section = "menu" | "appearance" | "security" | "two-factor" | "pin";

const TITLES: Record<Section, string> = {
  menu: "Configuración",
  appearance: "Apariencia",
  security: "Seguridad",
  "two-factor": "Verificación en dos pasos",
  pin: "PIN de acceso rápido",
};

const BACK_TARGET: Record<Section, Section> = {
  menu: "menu",
  appearance: "menu",
  security: "menu",
  "two-factor": "security",
  pin: "security",
};

interface AccountSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeName;
  onSelectTheme: (preference: ThemeName) => void;
}

export function AccountSettingsSheet({
  visible,
  onClose,
  theme,
  onSelectTheme,
}: AccountSettingsSheetProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState<Section>("menu");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [section]);

  function handleClose() {
    setSection("menu");
    onClose();
  }

  function goBack() {
    setSection(BACK_TARGET[section]);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        className="flex-1 bg-surface-modal"
        style={{ paddingTop: insets.top }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-row items-center gap-2 border-b border-line px-4 py-3">
          {section !== "menu" ? (
            <TouchableOpacity
              className="w-10 h-10 rounded-xl items-center justify-center bg-surface-input"
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Volver"
            >
              <Feather name="arrow-left" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
          <Text className="flex-1 text-[17px] font-bold text-content">
            {TITLES[section]}
          </Text>
          <TouchableOpacity
            className="w-10 h-10 rounded-xl items-center justify-center"
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar configuración"
          >
            <Feather name="x" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {section === "menu" ? (
            <AccountSettingsMenu
              onSelectAppearance={() => setSection("appearance")}
              onSelectSecurity={() => setSection("security")}
            />
          ) : section === "appearance" ? (
            <AppearanceSettingsStep selected={theme} onSelect={onSelectTheme} />
          ) : section === "security" ? (
            <SecuritySettingsStep
              onOpenTwoFactor={() => setSection("two-factor")}
              onOpenPinSetup={() => setSection("pin")}
            />
          ) : section === "two-factor" ? (
            <TwoFactorPanel onClose={goBack} scrollRef={scrollRef} />
          ) : (
            <PinSetupPanel onClose={goBack} scrollRef={scrollRef} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
