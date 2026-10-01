import {
  canEditMessage,
  type DmMessage,
  type MessageAuthor,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MessageActionsSheet } from "../../messages/components/MessageActionsSheet";
import { ServerAvatar } from "../../servers/components/ServerAvatar";
import { useThemeColors } from "../../../theme/theme-context";
import type { ConversationSummary, SendDmResult } from "../useDirectMessages";
import { DmComposer } from "./DmComposer";
import { DmMessageList } from "./DmMessageList";

interface DmConversationScreenProps {
  currentAuthor: MessageAuthor;
  summary: ConversationSummary;
  messages: DmMessage[];
  onSend: (content: string) => SendDmResult;
  onEditMessage: (messageId: string, content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onBack: () => void;
}

export function DmConversationScreen({
  currentAuthor,
  summary,
  messages,
  onSend,
  onEditMessage,
  onDeleteMessage,
  onBack,
}: DmConversationScreenProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [actionsMessageId, setActionsMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const { partner, blockedByMe, blocksMe } = summary;

  const actionsMessage =
    messages.find((m) => m.id === actionsMessageId) ?? null;
  const canEditActions = actionsMessage
    ? canEditMessage(actionsMessage, currentAuthor.id)
    : false;

  return (
    <View className="flex-1 bg-surface">
      <View
        className="min-h-15 flex-row items-center gap-3 border-b border-b-line px-3"
        style={{ paddingTop: insets.top }}
      >
        <TouchableOpacity
          onPress={onBack}
          className="h-8.5 w-8.5 items-center justify-center"
          accessibilityLabel="Volver"
        >
          <Feather name="arrow-left" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <ServerAvatar name={partner.name} uri={partner.avatarUrl} size={30} />
        <Text
          className="flex-1 text-[17px] font-bold text-content"
          numberOfLines={1}
        >
          {partner.name}
        </Text>
        {blockedByMe || blocksMe ? (
          <View className="rounded-full bg-danger/15 px-2 py-1">
            <Text className="text-[10px] text-danger">
              {blockedByMe ? "bloqueado" : "te bloqueó"}
            </Text>
          </View>
        ) : null}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <DmMessageList
          partner={partner}
          currentAuthor={currentAuthor}
          messages={messages}
          editingMessageId={editingMessageId}
          onRequestActions={setActionsMessageId}
          onSaveEdit={(id, content) => {
            onEditMessage(id, content);
            setEditingMessageId(null);
          }}
          onCancelEdit={() => setEditingMessageId(null)}
        />
        <DmComposer
          partnerName={partner.name}
          blockedByMe={blockedByMe}
          onSend={onSend}
        />
      </KeyboardAvoidingView>

      <MessageActionsSheet
        visible={actionsMessageId !== null}
        canEdit={canEditActions}
        canDelete={canEditActions}
        onEdit={() => {
          setEditingMessageId(actionsMessageId);
          setActionsMessageId(null);
        }}
        onDelete={() => {
          if (actionsMessageId) onDeleteMessage(actionsMessageId);
          setActionsMessageId(null);
        }}
        onClose={() => setActionsMessageId(null)}
      />
    </View>
  );
}
