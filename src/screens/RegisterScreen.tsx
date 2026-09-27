import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AuthLogo } from "../components/auth/AuthLogo";
import { ThemeToggleButton } from "../components/ui/ThemeToggleButton";
import { AuthTabs, type AuthMode } from "../features/auth/components/AuthTabs";
import { RegisterForm } from "../features/auth/components/RegisterForm";
import { useStatusBarStyle } from "../theme/theme-context";

interface RegisterScreenProps {
  onSwitchMode: (mode: AuthMode) => void;
  onRegistered: (email: string) => void;
}

export function RegisterScreen({
  onSwitchMode,
  onRegistered,
}: RegisterScreenProps) {
  const statusBarStyle = useStatusBarStyle();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-sunken"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={statusBarStyle} />
      <ThemeToggleButton />
      <ScrollView
        contentContainerClassName="grow items-center justify-center p-4"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[420px] px-4">
          <View className="mb-5 items-center">
            <AuthLogo />
          </View>

          <AuthTabs active="register" onChange={onSwitchMode} />

          <Text className="mb-1.5 text-[24px] font-bold text-content">
            Crea tu cuenta
          </Text>
          <Text className="mb-[26px] text-[14px] text-content-muted">
            Es gratis y siempre lo será.
          </Text>

          {/* Register Form */}
          <RegisterForm
            onSwitchToLogin={() => onSwitchMode("login")}
            onRegistered={onRegistered}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
