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
import { LoginForm } from "../features/auth/components/LoginForm";

interface LoginScreenProps {
  onSwitchMode: (mode: AuthMode) => void;
  onForgotPassword: () => void;
  justRegistered?: boolean;
}

export function LoginScreen({
  onSwitchMode,
  onForgotPassword,
  justRegistered = false,
}: LoginScreenProps) {
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
          <View className="mb-5 items-center">
            <Image
              source={require("../../assets/logo-light.png")}
              className="h-[52px] w-[200px]"
              resizeMode="contain"
            />
          </View>

          <AuthTabs active="login" onChange={onSwitchMode} />

          <Text className="mb-1.5 text-[24px] font-bold text-content">
            ¡Bienvenido de nuevo!
          </Text>
          <Text className="mb-[26px] text-[14px] text-content-muted">
            Ingresa tus credenciales para acceder.
          </Text>

          {/* Login Form */}
          <LoginForm
            onSwitchToRegister={() => onSwitchMode("register")}
            onForgotPassword={onForgotPassword}
            justRegistered={justRegistered}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
