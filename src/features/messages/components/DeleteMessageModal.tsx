import {
  DELETE_MESSAGE_CANCEL_ACTION,
  DELETE_MESSAGE_CONFIRM_ACTION,
  DELETE_MESSAGE_CONFIRM_BODY,
  DELETE_MESSAGE_CONFIRM_TITLE,
  type MessageAuthor,
  type MentionResolver,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { ModalShell } from "../../../components/ui/ModalShell";
import { useThemeColors } from "../../../theme/theme-context";
import { Avatar } from "../../../components/ui/Avatar";
import { MessageContent } from "./MessageContent";
import { MessageHeader } from "./MessageHeader";

interface DeleteMessageModalProps {
  visible: boolean;
  /** El mensaje que se va a eliminar, completo, para que se vea cual es. */
  message: { content: string; inserted_at: string } | null;
  author: MessageAuthor | null;
  resolveMention?: MentionResolver;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmacion antes de eliminar un mensaje: no hay forma de deshacerlo. */
export function DeleteMessageModal({
  visible,
  message,
  author,
  resolveMention,
  onConfirm,
  onCancel,
}: DeleteMessageModalProps) {
  const colors = useThemeColors();

  return (
    <ModalShell
      visible={visible}
      onClose={onCancel}
      className="max-w-80 items-center p-7 pt-6"
    >
      <View className="mt-2 mb-5 h-16 w-16 items-center justify-center rounded-[18px] bg-[rgba(224,82,82,0.14)]">
        <Feather name="trash-2" size={26} color={colors.danger} />
      </View>
      <Text className="text-center text-[19px] font-bold text-content">
        {DELETE_MESSAGE_CONFIRM_TITLE}
      </Text>
      <Text className="mt-2.5 mb-2 text-center text-[14px] leading-5 text-content-muted">
        {DELETE_MESSAGE_CONFIRM_BODY}
      </Text>
      {message && author ? (
        <ScrollView
          className="mt-3 max-h-48 w-full rounded-xl border border-line bg-surface-input"
          contentContainerClassName="flex-row gap-3 px-3 py-2.5"
        >
          <Avatar name={author.name} uri={author.avatarUrl} size={32} />
          <View className="min-w-0 flex-1">
            <MessageHeader author={author} createdAt={message.inserted_at} />
            <MessageContent
              content={message.content}
              resolveMention={resolveMention}
            />
          </View>
        </ScrollView>
      ) : null}
      <View className="mt-5 w-full flex-col gap-2.5">
        <Button
          title={DELETE_MESSAGE_CANCEL_ACTION}
          variant="secondary"
          onPress={onCancel}
        />
        <Button
          title={DELETE_MESSAGE_CONFIRM_ACTION}
          variant="danger"
          onPress={onConfirm}
        />
      </View>
    </ModalShell>
  );
}
