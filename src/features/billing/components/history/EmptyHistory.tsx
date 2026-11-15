import { Text, View } from "react-native";

import { DiscordiaPointIcon } from "../shared/DiscordiaIcons";

/** Bloque punteado con el ícono de puntos para las listas vacías de Facturación. */
export function EmptyHistory({ text }: { text: string }) {
  return (
    <View className="items-center rounded-2xl border border-dashed border-line-strong bg-surface-raised px-5 py-8">
      <DiscordiaPointIcon size={27} />
      <Text className="mt-3 text-center text-[14px] font-semibold text-content-muted">
        {text}
      </Text>
    </View>
  );
}
