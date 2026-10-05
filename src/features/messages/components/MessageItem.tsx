import {
  MESSAGE_EDITED_LABEL,
  type Message,
  type MessageAuthor,
} from "@discordia/client-shared";

import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { cn } from "../../../lib/cn";
import { ServerAvatar } from "../../servers/components/ServerAvatar";
import { MessageContent, type MentionResolver } from "./MessageContent";
import { MessageEditForm } from "./MessageEditForm";
import { MessageHeader } from "./MessageHeader";
import { MessageReactions } from "./MessageReactions";

const AVATAR_SIZE = 40;

/** Forma minima que necesita esta fila: sirve tanto para `Message` (canal) como para `DmMessage`. */
export interface MessageItemMessage extends Pick<
  Message,
  "id" | "user_id" | "content" | "inserted_at" | "edited_at"
> {
  reactions?: Message["reactions"];
}

/** `void` en los mensajes directos (maqueta local, no puede fallar). */
export type MessageEditOutcome = { ok: true } | { ok: false; message: string };

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
  /** Si devuelve un fallo, el formulario sigue abierto mostrando el motivo. */
  onSaveEdit: (content: string) => void | Promise<MessageEditOutcome>;
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
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function saveEdit(content: string) {
    if (content === message.content) return cancelEdit();
    setIsSavingEdit(true);
    const result = await onSaveEdit(content);
    setIsSavingEdit(false);
    if (result && !result.ok) return setEditError(result.message);
    setEditError(null);
  }

  function cancelEdit() {
    setEditError(null);
    onCancelEdit();
  }

  return (
    <Pressable
      onLongPress={isEditing ? undefined : onRequestActions}
      delayLongPress={300}
      className={cn(
        "flex-row gap-3 px-4 py-0.5 active:bg-surface-hover",
        isGroupStart && "mt-4",
      )}
      accessibilityHint="Mantené presionado para más acciones"
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
          <MessageHeader author={author} createdAt={message.inserted_at} />
        ) : null}

        {isEditing ? (
          <MessageEditForm
            initialContent={message.content}
            onSave={saveEdit}
            onCancel={cancelEdit}
            isSaving={isSavingEdit}
            error={editError}
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

        {!isEditing &&
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
