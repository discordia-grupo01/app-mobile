import {
  dmConversationStart,
  startsMessageGroup,
  type DmMessage,
  type MessageAuthor,
} from "@discordia/client-shared";

import { useMemo } from "react";
import { FlatList, Text, View } from "react-native";

import { MessageItem } from "../../messages/components/MessageItem";
import { ServerAvatar } from "../../servers/components/ServerAvatar";

interface DmMessageListProps {
  partner: MessageAuthor;
  currentAuthor: MessageAuthor;
  messages: DmMessage[];
  editingMessageId: string | null;
  onRequestActions: (messageId: string) => void;
  onSaveEdit: (messageId: string, content: string) => void;
  onCancelEdit: () => void;
}

/** Historial de una conversacion directa. Sin reacciones ni moderacion. */
export function DmMessageList({
  partner,
  currentAuthor,
  messages,
  editingMessageId,
  onRequestActions,
  onSaveEdit,
  onCancelEdit,
}: DmMessageListProps) {
  const newestFirst = useMemo(() => [...messages].reverse(), [messages]);

  return (
    <FlatList
      inverted
      data={newestFirst}
      keyExtractor={(message) => message.id}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="pt-3"
      ListFooterComponent={
        <View className="mb-6 items-start px-4">
          <ServerAvatar name={partner.name} uri={partner.avatarUrl} size={56} />
          <Text className="mt-3 mb-1 text-[19px] font-bold text-content">
            {partner.name}
          </Text>
          <Text className="text-[14px] text-content-muted">
            {dmConversationStart(partner.name)}
          </Text>
        </View>
      }
      renderItem={({ item, index }) => {
        const previous = newestFirst[index + 1];
        const isOwn = item.user_id === currentAuthor.id;
        return (
          <MessageItem
            message={item}
            author={isOwn ? currentAuthor : partner}
            isGroupStart={startsMessageGroup(previous, item)}
            isEditing={editingMessageId === item.id}
            onRequestActions={() => onRequestActions(item.id)}
            onSaveEdit={(content) => onSaveEdit(item.id, content)}
            onCancelEdit={onCancelEdit}
          />
        );
      }}
    />
  );
}
