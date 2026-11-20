import {
  ACCOUNT_PASSWORD_COPY,
  BILLING_BOOSTS_COPY,
  BILLING_COPY,
  type BillingSection,
  isBillingSection,
  type ThemeName,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
} from "react";
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
import { useAuth } from "../../../auth/auth-context";
import { AccountSettingsMenu } from "./account-settings/AccountSettingsMenu";
import { AppearanceSettingsStep } from "./account-settings/AppearanceSettingsStep";
import { ChangePasswordStep } from "./account-settings/ChangePasswordStep";
import { PushSettingsStep } from "./account-settings/PushSettingsStep";
import { SecuritySettingsStep } from "./account-settings/SecuritySettingsStep";
import {
  SET_PASSWORD_COPY,
  SetPasswordStep,
} from "./account-settings/SetPasswordStep";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import { PinSetupPanel } from "./PinSetupPanel";
import { TwoFactorPanel } from "./TwoFactorPanel";
import { useModalInsets } from "../../../../hooks/useModalInsets";
import { serverBoostsRequest } from "../../../../lib/navigationRequests";

type Section =
  | "menu"
  | "appearance"
  | "notifications"
  | "security"
  | "two-factor"
  | "change-password"
  | "set-password"
  | "pin"
  | "status"
  | BillingSection;

const TITLES: Record<Section, string> = {
  menu: "Configuración",
  appearance: "Apariencia",
  notifications: "Notificaciones",
  security: "Seguridad",
  "two-factor": "Verificación en dos pasos",
  "change-password": ACCOUNT_PASSWORD_COPY.changeFormTitle,
  "set-password": SET_PASSWORD_COPY.title,
  pin: "PIN de acceso rápido",
  status: "Estado de la plataforma",
  premium: "Premium",
  subscriptions: BILLING_COPY.subscriptionsTitle,
  points: BILLING_COPY.pointsTitle,
  boosts: BILLING_BOOSTS_COPY.title,
  transactions: BILLING_COPY.transactionsTitle,
};

const BACK_TARGET: Record<Section, Section> = {
  menu: "menu",
  appearance: "menu",
  notifications: "menu",
  security: "menu",
  "two-factor": "security",
  "change-password": "security",
  "set-password": "security",
  pin: "security",
  status: "menu",
  premium: "menu",
  subscriptions: "menu",
  points: "menu",
  boosts: "menu",
  transactions: "menu",
};

interface AccountSettingsSheetProps {
  visible: boolean;
  /** Solapa con la que se abre (por ejemplo, Puntos desde Boosts). */
  initialSection?: BillingSection;
  isPinEnabled: boolean;
  onClose: () => void;
  onLogout: () => void;
  theme: ThemeName;
  onSelectTheme: (preference: ThemeName) => void;
}

export function AccountSettingsSheet({
  visible,
  initialSection,
  isPinEnabled,
  onClose,
  onLogout,
  theme,
  onSelectTheme,
}: AccountSettingsSheetProps) {
  const colors = useThemeColors();
  const insets = useModalInsets();
  const [section, setSection] = useState<Section>(initialSection ?? "menu");
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const { user, updateUser } = useAuth();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [twoFactorTitle, setTwoFactorTitle] = useState<string | null>(null);
  const twoFactorBackRef = useRef<(() => void) | null>(null);
  const title =
    section === "two-factor" && twoFactorTitle
      ? twoFactorTitle
      : TITLES[section];

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [section]);

  function handleClose() {
    setSection("menu");
    setTwoFactorTitle(null);
    setSecurityNotice(null);
    onClose();
  }

  function handleConfirmLogout() {
    setIsConfirmVisible(false);
    handleClose();
    onLogout();
  }

  function openServerBoosts(serverId: string) {
    handleClose();
    serverBoostsRequest.request({ serverId, tab: "boost" });
  }

  function goBack() {
    if (section === "two-factor" && twoFactorBackRef.current) {
      twoFactorBackRef.current();
      return;
    }
    if (section === "security") setSecurityNotice(null);
    setSection(BACK_TARGET[section]);
  }

  const exitTwoFactor = useCallback(() => {
    setTwoFactorTitle(null);
    twoFactorBackRef.current = null;
    setSection("security");
  }, []);

  function openPassword() {
    setSecurityNotice(null);
    setSection(user?.has_password ? "change-password" : "set-password");
  }

  function switchToSetPassword() {
    if (user?.has_password) updateUser({ ...user, has_password: false });
    setSection("set-password");
  }

  function finishPassword(notice: string) {
    setSecurityNotice(notice);
    setSection("security");
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
            {title}
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
              hasPassword={user ? user.has_password : null}
              notice={securityNotice}
              onOpenTwoFactor={() => setSection("two-factor")}
              onOpenPassword={openPassword}
              onOpenPinSetup={() => setSection("pin")}
            />
          ) : section === "change-password" ? (
            <ChangePasswordStep
              onChanged={() => finishPassword(ACCOUNT_PASSWORD_COPY.changed)}
              onPasswordNotSet={switchToSetPassword}
            />
          ) : section === "set-password" ? (
            <SetPasswordStep
              onPasswordReady={() => finishPassword(ACCOUNT_PASSWORD_COPY.set)}
            />
          ) : section === "status" ? (
            <PlatformStatusStep />
          ) : isBillingSection(section) ? (
            <View className="pt-4">
              <BillingTabs active={section} onSelect={setSection} />
              <View className="px-4.5 pt-5">
                <BillingSettings
                  tab={section}
                  onNavigate={setSection}
                  onOpenServerBoosts={openServerBoosts}
                />
              </View>
            </View>
          ) : section === "two-factor" ? (
            <TwoFactorPanel
              onClose={exitTwoFactor}
              scrollRef={scrollRef}
              onTitleChange={setTwoFactorTitle}
              backRef={twoFactorBackRef}
            />
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
