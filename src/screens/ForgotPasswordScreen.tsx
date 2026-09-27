import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { AuthLogo } from "../components/auth/AuthLogo";
import { ThemeToggleButton } from "../components/ui/ThemeToggleButton";
import { ForgotPasswordForm } from "../features/auth/components/ForgotPasswordForm";
import { useStatusBarStyle } from "../theme/theme-context";

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
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

          <ForgotPasswordForm onBack={onBack} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
