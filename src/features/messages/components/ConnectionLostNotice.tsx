import {
  CHAT_OFFLINE_HINT,
  CHAT_OFFLINE_TITLE,
  RETRY_LABEL,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { useRetryAction } from "../../../hooks/useRetryAction";
import { useThemeColors } from "../../../theme/theme-context";

interface ConnectionLostNoticeProps {
  /** Vuelve a conectar sin reiniciar la app. */
  onRetry: () => void | Promise<unknown>;
}

/** Ocupa el lugar del chat cuando se agotaron los reintentos de conexion y nunca llego a cargar. */
export function ConnectionLostNotice({ onRetry }: ConnectionLostNoticeProps) {
  const colors = useThemeColors();
  const { isRetrying, run } = useRetryAction(onRetry);

  return (
    <View
      accessibilityRole="alert"
      className="flex-1 items-center justify-center gap-3 px-6"
    >
      <View className="size-14 items-center justify-center rounded-2xl bg-surface-input">
        <Feather name="cloud-off" size={26} color={colors.text} />
      </View>
      <View className="max-w-xs items-center gap-1">
        <Text className="text-center text-[14px] font-medium text-content">
          {CHAT_OFFLINE_TITLE}
        </Text>
        <Text className="text-center text-[12px] text-content-muted">
          {CHAT_OFFLINE_HINT}
        </Text>
      </View>
      <Button
        title={RETRY_LABEL}
        onPress={() => void run()}
        isLoading={isRetrying}
      />
    </View>
  );
}
