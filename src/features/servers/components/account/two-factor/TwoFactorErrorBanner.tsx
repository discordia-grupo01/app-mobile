import { Text, View } from "react-native";

export function TwoFactorErrorBanner({ message }: { message: string }) {
  return (
    <View
      className="mb-4 rounded-lg border border-danger/30 bg-danger/12 p-3"
      accessibilityRole="alert"
    >
      <Text className="text-center text-[13px] text-danger">{message}</Text>
    </View>
  );
}
