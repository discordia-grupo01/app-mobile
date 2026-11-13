import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useStatusBarStyle } from "../../theme/theme-context";
import { ThemeToggleButton } from "../ui/ThemeToggleButton";
import { AuthLogo } from "./AuthLogo";

const EDGE_SPACING = 24;

export function AuthScreen({ children }: { children: ReactNode }) {
  const statusBarStyle = useStatusBarStyle();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-sunken"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={statusBarStyle} />
      <ThemeToggleButton />
      <ScrollView
        contentContainerClassName="grow items-center justify-center px-6"
        contentContainerStyle={{
          paddingTop: insets.top + EDGE_SPACING,
          paddingBottom: insets.bottom + EDGE_SPACING,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[420px]">
          <View className="mb-5 items-center">
            <AuthLogo />
          </View>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
