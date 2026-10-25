import {
  MESSAGE_SEARCH_HINT,
  MESSAGE_SEARCH_HINT_TITLE,
  MESSAGE_SEARCH_NO_RESULTS_HINT,
  MESSAGE_SEARCH_NO_RESULTS_TITLE,
  RETRY_LABEL,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { useThemeColors } from "../../../theme/theme-context";

function StatusBlock({
  icon,
  title,
  children,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  title: string;
  children?: ReactNode;
}) {
  const colors = useThemeColors();
  return (
    <View className="items-center px-6 py-12">
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-surface-raised">
        <Feather name={icon} size={22} color={colors.textSubtle} />
      </View>
      <Text className="text-center text-[15px] font-semibold text-content">
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Antes de la primera busqueda. */
export function MessageSearchHint() {
  return (
    <StatusBlock icon="search" title={MESSAGE_SEARCH_HINT_TITLE}>
      <Text className="mt-1 text-center text-[13px] text-content-muted">
        {MESSAGE_SEARCH_HINT}
      </Text>
    </StatusBlock>
  );
}

/** La busqueda no encontro nada. */
export function MessageSearchEmpty() {
  return (
    <StatusBlock icon="inbox" title={MESSAGE_SEARCH_NO_RESULTS_TITLE}>
      <Text className="mt-1 text-center text-[13px] text-content-muted">
        {MESSAGE_SEARCH_NO_RESULTS_HINT}
      </Text>
    </StatusBlock>
  );
}

export function MessageSearchError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View accessibilityRole="alert">
      <StatusBlock icon="alert-triangle" title={message}>
        <View className="mt-3">
          <Button title={RETRY_LABEL} onPress={onRetry} />
        </View>
      </StatusBlock>
    </View>
  );
}

/** Esqueletos mientras llega una pagina. */
export function MessageSearchSkeleton() {
  return (
    <View
      className="gap-2"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {[0, 1, 2, 3].map((item) => (
        <View
          key={item}
          className="rounded-xl border border-line bg-surface p-3 opacity-60"
        >
          <View className="mb-3 h-3 w-20 rounded bg-surface-raised" />
          <View className="flex-row gap-3">
            <View className="h-8 w-8 rounded-full bg-surface-raised" />
            <View className="flex-1 gap-2">
              <View className="h-3 w-1/3 rounded bg-surface-raised" />
              <View className="h-3 w-full rounded bg-surface-raised" />
              <View className="h-3 w-2/3 rounded bg-surface-raised" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
