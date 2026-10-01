import {
  MESSAGE_EDITED_LABEL,
  type Message,
  type MessageAuthor,
} from "@discordia/client-shared";

import { Pressable, Text, View } from "react-native";

import { cn } from "../../../lib/cn";
import { ServerAvatar } from "../../servers/components/ServerAvatar";
import { MessageContent, type MentionResolver } from "./MessageContent";
import { MessageDeletedNotice } from "./MessageDeletedNotice";
import { MessageEditForm } from "./MessageEditForm";
import { MessageHeader } from "./MessageHeader";
import { MessageReactions } from "./MessageReactions";

const AVATAR_SIZE = 40;

/** Forma minima que necesita esta fila: sirve tanto para `Message` (canal) como para `DmMessage`. */
export interface MessageItemMessage extends Pick<
  Message,
  "id" | "author_id" | "content" | "created_at" | "edited_at" | "deleted_at"
> {
  reactions?: Message["reactions"];
}

interface MessageItemProps {
  message: MessageItemMessage;
  author: MessageAuthor;
  isGroupStart: boolean;
  isEditing: boolean;
  resolveMention?: MentionResolver;
  onToggleReaction?: (emoji: string) => void;
  /** Boton "+" de reacciones: abre el picker de emojis directo. */
  onRequestReaction?: () => void;
  /** Mantener presionado: abre el menu de reaccionar/editar/eliminar. */
  onRequestActions: () => void;
  onSaveEdit: (content: string) => void;
  onCancelEdit: () => void;
}

export function MessageItem({
  message,
  author,
  isGroupStart,
  isEditing,
  resolveMention,
  onToggleReaction,
  onRequestReaction,
  onRequestActions,
  onSaveEdit,
  onCancelEdit,
}: MessageItemProps) {
  const isDeleted = message.deleted_at !== null;

  return (
    <Pressable
      onLongPress={isDeleted || isEditing ? undefined : onRequestActions}
      delayLongPress={300}
      className={cn(
        "flex-row gap-3 px-4 py-0.5 active:bg-surface-hover",
        isGroupStart && "mt-4",
      )}
      accessibilityHint={
        isDeleted ? undefined : "Mantené presionado para más acciones"
      }
    >
      {isGroupStart ? (
        <ServerAvatar
          name={author.name}
          uri={author.avatarUrl}
          size={AVATAR_SIZE}
        />
      ) : (
        <View style={{ width: AVATAR_SIZE }} />
      )}

      <View className="min-w-0 flex-1">
        {isGroupStart ? (
          <MessageHeader author={author} createdAt={message.created_at} />
        ) : null}

        {isDeleted ? (
          <MessageDeletedNotice />
        ) : isEditing ? (
          <MessageEditForm
            initialContent={message.content}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <>
            <MessageContent
              content={message.content}
              resolveMention={resolveMention}
            />
            {message.edited_at ? (
              <Text className="text-[11px] text-content-subtle">
                {MESSAGE_EDITED_LABEL}
              </Text>
            ) : null}
          </>
        )}

        {!isDeleted &&
        !isEditing &&
        message.reactions &&
        onToggleReaction &&
        onRequestReaction ? (
          <MessageReactions
            reactions={message.reactions}
            onToggle={onToggleReaction}
            onAddPress={onRequestReaction}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
