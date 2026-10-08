import {
  dmConversationStart,
  type MessageAuthor,
} from "@discordia/client-shared";

import { Text, View } from "react-native";

import { ServerAvatar } from "../../servers/components/ServerAvatar";

/** Comienzo del historial de una conversacion directa. */
export function DmWelcome({ partner }: { partner: MessageAuthor }) {
  return (
    <View className="mb-6 items-start px-4">
      <ServerAvatar name={partner.name} uri={partner.avatarUrl} size={56} />
      <Text className="mt-3 mb-1 text-[19px] font-bold text-content">
        {partner.name}
      </Text>
      <Text className="text-[14px] text-content-muted">
        {dmConversationStart(partner.name)}
      </Text>
    </View>
  );
}
