import { StatusBar } from "expo-status-bar";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { ForgotPasswordForm } from "../features/auth/components/ForgotPasswordForm";

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
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

          <ForgotPasswordForm onBack={onBack} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
