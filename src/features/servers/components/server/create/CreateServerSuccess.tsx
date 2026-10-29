import { type ServerSummary } from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Avatar } from "../../../../../components/ui/Avatar";
import { Button } from "../../../../../components/ui/Button";
import { useThemeColors } from "../../../../../theme/theme-context";

interface CreateServerSuccessProps {
  server: ServerSummary;
  iconUri: string | undefined;
  onContinue: () => void;
}

export function CreateServerSuccess({
  server,
  iconUri,
  onContinue,
}: CreateServerSuccessProps) {
  const colors = useThemeColors();

  return (
    <View className="items-center gap-6">
      <View className="w-full rounded-2xl border border-line-strong bg-surface-raised overflow-hidden">
        <View className="flex-row items-center gap-2.5 px-4 py-3 border-b border-b-line">
          <Avatar
            name={server.name}
            uri={iconUri}
            size={36}
            borderRadius={18}
          />
          <Text
            className="flex-1 text-[14px] font-bold text-content"
            numberOfLines={1}
          >
            {server.name}
          </Text>
        </View>
        <View className="px-3 py-2.5 gap-1">
          {server.channels.map((channel) => (
            <View
              key={channel.id}
              className="flex-row items-center gap-2 rounded-lg bg-surface-input px-2 py-[7px]"
            >
              <Feather
                name={channel.kind === "text" ? "hash" : "volume-2"}
                size={15}
                color={colors.textSubtle}
              />
              <Text className="text-[13px] text-content-muted">
                {channel.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="items-center gap-1.5">
        <View className="w-12 h-12 rounded-2xl items-center justify-center bg-[rgba(56,161,105,0.15)] mb-1">
          <Feather name="check" size={26} color={colors.success} />
        </View>
        <Text className="text-[16px] font-bold text-content">
          ¡Servidor creado!
        </Text>
        <Text className="text-[13px] leading-[19px] text-content-muted text-center max-w-65">
          <Text className="text-content font-bold">{server.name}</Text> ya está
          listo. Encontrás tus canales en la barra lateral.
        </Text>
      </View>

      <Button title="Ir al servidor" onPress={onContinue} />
    </View>
  );
}
