import { NOTIFICATIONS_LOADING, RETRY_LABEL } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { useThemeColors } from "../../../../theme/theme-context";

export function NotificationCenterLoading() {
  const colors = useThemeColors();
  return (
    <View
      accessibilityRole="progressbar"
      className="flex-row items-center justify-center gap-2 py-12"
    >
      <ActivityIndicator size="small" color={colors.textMuted} />
      <Text className="text-[14px] text-content-muted">
        {NOTIFICATIONS_LOADING}
      </Text>
    </View>
  );
}

export function NotificationCenterError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const colors = useThemeColors();
  return (
    <View accessibilityRole="alert" className="items-center gap-3 px-6 py-12">
      <Feather name="alert-circle" size={22} color={colors.danger} />
      <Text className="text-center text-[14px] text-content-muted">
        {message}
      </Text>
      <Button
        title={RETRY_LABEL}
        variant="secondary"
        size="sm"
        onPress={onRetry}
      />
    </View>
  );
}

export function NotificationCenterEmpty({ message }: { message: string }) {
  const colors = useThemeColors();
  return (
    <View className="items-center gap-3 px-6 py-12">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-raised">
        <Feather name="bell" size={22} color={colors.textSubtle} />
      </View>
      <Text className="text-center text-[14px] text-content-muted">
        {message}
      </Text>
    </View>
  );
}
