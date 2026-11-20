import { Text, View } from "react-native";

/** Aviso flotante abajo del panel; lo arma `useToast`. Va al final del panel que lo muestra. */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View
      accessibilityLiveRegion="polite"
      className="absolute bottom-6 left-6 right-6 max-w-105 flex-row items-center gap-2.5 self-center rounded-[14px] border border-line-strong bg-surface-raised px-4 py-3"
    >
      <View className="h-2 w-2 rounded-sm bg-accent-strong" />
      <Text
        className="flex-1 text-[13px] font-semibold text-content"
        numberOfLines={2}
      >
        {message}
      </Text>
    </View>
  );
}
