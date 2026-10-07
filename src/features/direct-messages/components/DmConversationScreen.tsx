import {
  BLOCKED_BADGE_LABEL,
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

import { PublicProfileModal } from "../../profile/components/PublicProfileModal";
import { DeleteMessageModal } from "../../messages/components/DeleteMessageModal";
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
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );
  const { partner, blockedByMe, blocksMe } = summary;

  const actionsMessage =
    messages.find((m) => m.id === actionsMessageId) ?? null;
  const canEditActions = actionsMessage
    ? canEditMessage(actionsMessage, currentAuthor.id)
    : false;

  const editingMessage =
    messages.find((m) => m.id === editingMessageId) ?? null;
  const deletingMessage =
    messages.find((m) => m.id === deletingMessageId) ?? null;

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
        <TouchableOpacity
          onPress={() => setIsProfileVisible(true)}
          className="flex-1 flex-row items-center gap-3"
          accessibilityRole="button"
          accessibilityLabel={`Ver perfil de ${partner.name}`}
        >
          <ServerAvatar name={partner.name} uri={partner.avatarUrl} size={30} />
          <Text
            className="flex-1 text-[17px] font-bold text-content"
            numberOfLines={1}
          >
            {partner.name}
          </Text>
        </TouchableOpacity>
        {blockedByMe || blocksMe ? (
          <View className="rounded-full bg-danger/15 px-2 py-1">
            <Text className="text-[10px] text-danger">
              {blockedByMe ? BLOCKED_BADGE_LABEL : "te bloqueó"}
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
        />
        <DmComposer
          partnerName={partner.name}
          blockedByMe={blockedByMe}
          onSend={onSend}
          editing={
            editingMessage
              ? {
                  id: editingMessage.id,
                  content: editingMessage.content,
                  onSave: (content) => {
                    onEditMessage(editingMessage.id, content);
                    setEditingMessageId(null);
                  },
                  onCancel: () => setEditingMessageId(null),
                }
              : null
          }
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
          setDeletingMessageId(actionsMessageId);
          setActionsMessageId(null);
        }}
        onClose={() => setActionsMessageId(null)}
      />

      <PublicProfileModal
        visible={isProfileVisible}
        userId={partner.id}
        canBlock
        onClose={() => setIsProfileVisible(false)}
      />

      <DeleteMessageModal
        visible={deletingMessageId !== null}
        message={deletingMessage}
        author={
          deletingMessage
            ? deletingMessage.user_id === currentAuthor.id
              ? currentAuthor
              : partner
            : null
        }
        onConfirm={() => {
          if (deletingMessageId) onDeleteMessage(deletingMessageId);
          setDeletingMessageId(null);
        }}
        onCancel={() => setDeletingMessageId(null)}
      />
    </View>
  );
}
