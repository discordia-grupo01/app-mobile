import {
  BILLING_COPY,
  type BillingSection,
  isBillingSection,
  type ThemeName,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState, type ComponentRef } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BillingSettings } from "../../../billing/BillingSettings";
import { BillingTabs } from "../../../billing/components/navigation/BillingTabs";
import { PlatformStatusStep } from "../../../platform-status/components/PlatformStatusStep";
import { useThemeColors } from "../../../../theme/theme-context";
import { AccountSettingsMenu } from "./account-settings/AccountSettingsMenu";
import { AppearanceSettingsStep } from "./account-settings/AppearanceSettingsStep";
import { PushSettingsStep } from "./account-settings/PushSettingsStep";
import { SecuritySettingsStep } from "./account-settings/SecuritySettingsStep";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { PinSetupPanel } from "./PinSetupPanel";
import { TwoFactorPanel } from "./TwoFactorPanel";
import { useModalInsets } from "../../../platform-status/hooks/useModalInsets";

type Section =
  | "menu"
  | "appearance"
  | "notifications"
  | "security"
  | "two-factor"
  | "pin"
  | "status"
  | BillingSection;

const TITLES: Record<Section, string> = {
  menu: "Configuración",
  appearance: "Apariencia",
  notifications: "Notificaciones",
  security: "Seguridad",
  "two-factor": "Verificación en dos pasos",
  pin: "PIN de acceso rápido",
  status: "Estado de la plataforma",
  premium: "Premium",
  subscriptions: BILLING_COPY.subscriptionsTitle,
  points: BILLING_COPY.pointsTitle,
  transactions: BILLING_COPY.transactionsTitle,
};

const BACK_TARGET: Record<Section, Section> = {
  menu: "menu",
  appearance: "menu",
  notifications: "menu",
  security: "menu",
  "two-factor": "security",
  pin: "security",
  status: "menu",
  premium: "menu",
  subscriptions: "menu",
  points: "menu",
  transactions: "menu",
};

interface AccountSettingsSheetProps {
  visible: boolean;
  isPinEnabled: boolean;
  onClose: () => void;
  onLogout: () => void;
  theme: ThemeName;
  onSelectTheme: (preference: ThemeName) => void;
}

export function AccountSettingsSheet({
  visible,
  isPinEnabled,
  onClose,
  onLogout,
  theme,
  onSelectTheme,
}: AccountSettingsSheetProps) {
  const colors = useThemeColors();
  const insets = useModalInsets();
  const [section, setSection] = useState<Section>("menu");
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [section]);

  function handleClose() {
    setSection("menu");
    onClose();
  }

  function handleConfirmLogout() {
    setIsConfirmVisible(false);
    handleClose();
    onLogout();
  }

  function goBack() {
    setSection(BACK_TARGET[section]);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
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
              onSelectNotifications={() => setSection("notifications")}
              onSelectSecurity={() => setSection("security")}
              onSelectStatus={() => setSection("status")}
              onSelectBilling={setSection}
              onLogout={() => setIsConfirmVisible(true)}
            />
          ) : section === "appearance" ? (
            <AppearanceSettingsStep selected={theme} onSelect={onSelectTheme} />
          ) : section === "notifications" ? (
            <PushSettingsStep />
          ) : section === "security" ? (
            <SecuritySettingsStep
              isPinEnabled={isPinEnabled}
              onOpenTwoFactor={() => setSection("two-factor")}
              onOpenPinSetup={() => setSection("pin")}
            />
          ) : section === "status" ? (
            <PlatformStatusStep />
          ) : isBillingSection(section) ? (
            <View className="pt-4">
              <BillingTabs active={section} onSelect={setSection} />
              <View className="px-4.5 pt-5">
                <BillingSettings tab={section} onNavigate={setSection} />
              </View>
            </View>
          ) : section === "two-factor" ? (
            <TwoFactorPanel onClose={goBack} scrollRef={scrollRef} />
          ) : (
            <PinSetupPanel
              isPinEnabled={isPinEnabled}
              onClose={goBack}
              scrollRef={scrollRef}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <LogoutConfirmModal
        visible={isConfirmVisible}
        onClose={() => setIsConfirmVisible(false)}
        onConfirm={handleConfirmLogout}
      />
    </Modal>
  );
}
