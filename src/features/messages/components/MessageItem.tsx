import {
  MESSAGE_EDITED_LABEL,
  type Message,
  type MessageAuthor,
  type MentionResolver,
} from "@discordia/client-shared";

import { Pressable, Text, View } from "react-native";

import { cn } from "../../../lib/cn";
import { Avatar } from "../../../components/ui/Avatar";
import { MessageContent } from "./MessageContent";
import { MessageHeader } from "./MessageHeader";
import { MessageReactions } from "./MessageReactions";

const AVATAR_SIZE = 40;

/** Forma minima que necesita esta fila: sirve para los mensajes de un canal y de un DM. */
export interface MessageItemMessage extends Pick<
  Message,
  "id" | "user_id" | "content" | "inserted_at" | "edited_at"
> {
  reactions?: Message["reactions"];
}

interface MessageItemProps {
  message: MessageItemMessage;
  author: MessageAuthor;
  isGroupStart: boolean;
  /** Es el mensaje que se esta editando en el composer: se resalta. */
  isEditing: boolean;
  resolveMention?: MentionResolver;
  onToggleReaction?: (emoji: string) => void;
  /** Boton "+" de reacciones: abre el picker de emojis directo. */
  onRequestReaction?: () => void;
  /** Mantener presionado: abre el menu de reaccionar/editar/eliminar. */
  onRequestActions: () => void;
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
}: MessageItemProps) {
  return (
    <Pressable
      onLongPress={isEditing ? undefined : onRequestActions}
      delayLongPress={300}
      className={cn(
        "flex-row gap-3 px-4 py-0.5 active:bg-surface-hover",
        isGroupStart && "mt-4",
        isEditing && "bg-surface-hover",
      )}
      accessibilityHint="Mantené presionado para más acciones"
    >
      {isGroupStart ? (
        <Avatar name={author.name} uri={author.avatarUrl} size={AVATAR_SIZE} />
      ) : (
        <View style={{ width: AVATAR_SIZE }} />
      )}

      <View className="min-w-0 flex-1">
        {isGroupStart ? (
          <MessageHeader author={author} createdAt={message.inserted_at} />
        ) : null}

        <MessageContent
          content={message.content}
          resolveMention={resolveMention}
          suffix={
            message.edited_at ? (
              <Text className="text-[11px] text-content-subtle">
                {" "}
                {MESSAGE_EDITED_LABEL}
              </Text>
            ) : null
          }
        />

        {message.reactions && onToggleReaction && onRequestReaction ? (
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
