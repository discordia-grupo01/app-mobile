import { StatusBar } from "expo-status-bar";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { AuthTabs, type AuthMode } from "../features/auth/components/AuthTabs";
import { RegisterForm } from "../features/auth/components/RegisterForm";

interface RegisterScreenProps {
  onSwitchMode: (mode: AuthMode) => void;
  onRegistered: () => void;
}

export function RegisterScreen({
  onSwitchMode,
  onRegistered,
}: RegisterScreenProps) {
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-servers"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerClassName="grow items-center justify-center p-5"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[420px] px-7">
          {/* Logo Discordia (Light Version for Dark Background) */}
          <View className="mb-5 items-center">
            <Image
              source={require("../../assets/logo-light.png")}
              className="h-[52px] w-[200px]"
              resizeMode="contain"
            />
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
