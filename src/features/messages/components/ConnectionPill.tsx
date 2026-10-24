import {
  CHAT_OFFLINE_TITLE,
  CHAT_RECONNECTING_HINT,
  CHAT_RECONNECTING_NOTICE,
  CONNECTION_NOTICE_DELAY_MS,
  RETRY_LABEL,
  type ChatStatus,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useRetryAction } from "../../../hooks/useRetryAction";
import { useThemeColors } from "../../../theme/theme-context";

interface ConnectionPillProps {
  status: ChatStatus;
  /** Vuelve a conectar el chat; se ofrece cuando se agotaron los reintentos. */
  onRetry: () => void | Promise<unknown>;
}

const PILL_CLASS =
  "max-w-full flex-row items-center gap-2 rounded-full border border-line bg-surface-hover px-3.5 py-1.5 shadow-lg";

/**
 * Globito flotante arriba del chat con el estado de la conexion. Va encima de los
 * mensajes, sin empujarlos. "Reconectando" espera un momento antes de aparecer:
 * un corte de un instante no debe parpadear.
 */
export function ConnectionPill({ status, onRetry }: ConnectionPillProps) {
  const colors = useThemeColors();
  const isReconnecting = status === "reconnecting";
  const [hasWaited, setHasWaited] = useState(false);
  useEffect(() => {
    if (!isReconnecting) return;
    const timer = setTimeout(
      () => setHasWaited(true),
      CONNECTION_NOTICE_DELAY_MS,
    );
    return () => {
      clearTimeout(timer);
      setHasWaited(false);
    };
  }, [isReconnecting]);
  const { isRetrying, run } = useRetryAction(onRetry);

  let pill = null;
  if (status === "offline") {
    pill = (
      <View accessibilityRole="alert" className={PILL_CLASS}>
        <Feather name="cloud-off" size={14} color={colors.text} />
        <Text className="text-[12px] font-medium text-content">
          {CHAT_OFFLINE_TITLE}
        </Text>
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
          <Text className="text-[12px] font-medium text-content-muted underline">
            {RETRY_LABEL}
          </Text>
        </Pressable>
      </View>
    );
  } else if (isReconnecting && hasWaited) {
    pill = (
      <View accessibilityRole="alert" className={PILL_CLASS}>
        <ActivityIndicator size="small" color={colors.warning} />
        <Text className="text-[12px] font-medium text-content">
          {CHAT_RECONNECTING_NOTICE}
        </Text>
        <Text
          numberOfLines={1}
          className="shrink text-[12px] text-content-muted"
        >
          {CHAT_RECONNECTING_HINT}
        </Text>
      </View>
    );
  }

  if (!pill) return null;

  return (
    <View pointerEvents="box-none" className="z-10 h-0">
      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 top-3 items-center px-4"
      >
        {pill}
      </View>
    </View>
  );
}
