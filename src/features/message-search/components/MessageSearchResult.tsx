import {
  JUMP_TO_MESSAGE_LABEL,
  type Message,
  type MessageAuthor,
  messageAttachmentsCount,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../components/ui/Avatar";
import { useThemeColors } from "../../../theme/theme-context";
import { MessageContent } from "../../messages/components/MessageContent";
import { MessageHeader } from "../../messages/components/MessageHeader";

interface MessageSearchResultProps {
  message: Message;
  author: MessageAuthor;
  channelName: string;
  /** Termino buscado, para resaltarlo. */
  term: string;
  onOpen: () => void;
}

/** Un resultado: canal, autor, fecha y contenido con el termino resaltado. */
export function MessageSearchResult({
  message,
  author,
  channelName,
  term,
  onOpen,
}: MessageSearchResultProps) {
  const colors = useThemeColors();
  const attachments = message.attachments?.length ?? 0;

  return (
    <TouchableOpacity
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${JUMP_TO_MESSAGE_LABEL} de ${author.name} en #${channelName}`}
      className="rounded-xl border border-line bg-surface p-3"
    >
      <View className="mb-2 flex-row items-center gap-1">
        <Feather name="hash" size={12} color={colors.textMuted} />
        <Text
          className="shrink text-[12px] font-semibold text-content-muted"
          numberOfLines={1}
        >
          {channelName}
        </Text>
      </View>
      <View className="flex-row gap-3">
        <Avatar name={author.name} uri={author.avatarUrl} size={32} />
        <View className="min-w-0 flex-1">
          <MessageHeader author={author} createdAt={message.inserted_at} />
          <MessageContent
            content={message.content}
            mentions={message}
            highlight={term}
          />
          {attachments > 0 ? (
            <View className="mt-1 flex-row items-center gap-1">
              <Feather name="paperclip" size={12} color={colors.textSubtle} />
              <Text className="text-[12px] text-content-subtle">
                {messageAttachmentsCount(attachments)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
