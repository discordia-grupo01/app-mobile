import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

import { useThemeColors } from "../../theme/theme-context";

interface LoadMoreFooterProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  /** Lo que se esta listando: "baneados", "miembros". */
  noun: string;
}

export function LoadMoreFooter({
  hasMore,
  isLoading,
  onLoadMore,
  noun,
}: LoadMoreFooterProps) {
  const colors = useThemeColors();

  if (!hasMore) {
    return (
      <Text className="py-2 text-center text-xs text-content-subtle">
        No hay más {noun}
      </Text>
    );
  }

  return (
    <TouchableOpacity
      onPress={onLoadMore}
      disabled={isLoading}
      accessibilityRole="button"
      className="min-h-11 items-center justify-center rounded-xl"
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.accentBright} />
      ) : (
        <Text className="text-[14px] font-semibold text-accent-strong">
          Mostrar más {noun}
        </Text>
      )}
    </TouchableOpacity>
  );
}
