import { CHAT_OFFLINE_TITLE, RETRY_LABEL } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useRetryAction } from "../../../hooks/useRetryAction";
import { useThemeColors } from "../../../theme/theme-context";

interface DmListErrorProps {
  /** Texto del error cuando no es por falta de conexion. */
  message: string;
  isOffline: boolean;
  onRetry: () => void | Promise<unknown>;
}

/**
 * Lugar de la lista de conversaciones cuando no se pudo cargar. Sin conexion es
 * una sola linea: el aviso del chat ya explica el corte y no hace falta repetirlo.
 */
export function DmListError({ message, isOffline, onRetry }: DmListErrorProps) {
  const colors = useThemeColors();
  const { isRetrying, run } = useRetryAction(onRetry);

  const retry = (
    <Pressable
      onPress={() => void run()}
      disabled={isRetrying}
      accessibilityRole="button"
      accessibilityState={{ busy: isRetrying }}
      hitSlop={8}
      className="flex-row items-center gap-1.5"
    >
      {isRetrying ? (
        <ActivityIndicator size="small" color={colors.textMuted} />
      ) : null}
      <Text className="text-[13px] font-medium text-content underline">
        {RETRY_LABEL}
      </Text>
    </Pressable>
  );

  if (isOffline) {
    return (
      <View
        accessibilityRole="alert"
        className="flex-row items-center gap-2 px-2 py-3"
      >
        <Feather name="cloud-off" size={16} color={colors.textMuted} />
        <Text
          numberOfLines={1}
          className="flex-1 text-[13px] text-content-muted"
        >
          {CHAT_OFFLINE_TITLE}
        </Text>
        {retry}
      </View>
    );
  }

  return (
    <View accessibilityRole="alert" className="items-center gap-3 px-4 py-6">
      <View className="size-12 items-center justify-center rounded-xl bg-surface-input">
        <Feather name="alert-circle" size={22} color={colors.danger} />
      </View>
      <Text className="text-center text-[14px] font-medium text-content">
        {message}
      </Text>
      {retry}
    </View>
  );
}
