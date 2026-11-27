import { Feather } from "@expo/vector-icons";
import { type ComponentProps, type ReactNode } from "react";
import { Text, View } from "react-native";

import { useThemeColors } from "../../theme/theme-context";

export const EMPTY_STATE_ICON_SIZE = 27;

type EmptyStateProps = { text: string } & (
  | { icon: ComponentProps<typeof Feather>["name"]; media?: never }
  | { icon?: never; media: ReactNode }
);

export function EmptyState({ icon, media, text }: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View className="items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface-raised px-5 py-8">
      {media ??
        (icon ? (
          <Feather
            name={icon}
            size={EMPTY_STATE_ICON_SIZE}
            color={colors.textSubtle}
          />
        ) : null)}
      <Text className="text-center text-[14px] font-semibold text-content-muted">
        {text}
      </Text>
    </View>
  );
}
