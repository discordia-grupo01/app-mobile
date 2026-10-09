import {
  hexToRgba,
  mentionsPerson,
  MESSAGE_EDITED_LABEL,
  type Message,
  type MessageAuthor,
  type MessageMentions,
} from "@discordia/client-shared";

import { useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";

import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import { Avatar } from "../../../components/ui/Avatar";
import { useMessageMentions } from "./MentionsContext";
import { MessageContent } from "./MessageContent";
import { MessageHeader } from "./MessageHeader";
import { MessageReactions } from "./MessageReactions";

const AVATAR_SIZE = 40;
/** Cuanto tarda en apagarse el destello al soltar el dedo. */
const FLASH_FADE_MS = 300;

/** Forma minima que necesita esta fila: sirve para los mensajes de un canal y de un DM. */
export interface MessageItemMessage
  extends
    Pick<Message, "id" | "user_id" | "content" | "inserted_at" | "edited_at">,
    MessageMentions {
  reactions?: Message["reactions"];
}

interface MessageItemProps {
  message: MessageItemMessage;
  author: MessageAuthor;
  isGroupStart: boolean;
  /** Es el mensaje que se esta editando en el composer: se resalta. */
  isEditing: boolean;
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
  onToggleReaction,
  onRequestReaction,
  onRequestActions,
}: MessageItemProps) {
  const { me } = useMessageMentions();
  const colors = useThemeColors();
  const isMentioningMe =
    me.userId !== null && mentionsPerson(message, me.userId, me.roleIds);

  // Destello al tocar: se enciende apenas se apoya el dedo y se apaga suave al
  // soltar, asi hasta un toque muy corto deja un resaltado visible.
  const [flash] = useState(() => new Animated.Value(0));
  const showFlash = () => {
    flash.stopAnimation();
    flash.setValue(1);
  };
  const fadeFlash = () =>
    Animated.timing(flash, {
      toValue: 0,
      duration: FLASH_FADE_MS,
      useNativeDriver: true,
    }).start();

  return (
    <Pressable
      onPressIn={showFlash}
      onPressOut={fadeFlash}
      onLongPress={isEditing ? undefined : onRequestActions}
      delayLongPress={300}
      className={cn(
        "flex-row gap-3 px-4 py-0.5",
        isGroupStart && "mt-4",
        isEditing && "bg-surface-hover",
      )}
      // El color viene de los tokens del tema: con una variable CSS no se puede aplicar transparencia.
      style={
        isMentioningMe
          ? {
              borderLeftWidth: 2,
              borderLeftColor: colors.highlight,
              backgroundColor: hexToRgba(colors.highlight, 0.1),
            }
          : undefined
      }
      accessibilityHint="Mantené presionado para más acciones"
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          opacity: flash,
          backgroundColor: isMentioningMe
            ? hexToRgba(colors.highlight, 0.2)
            : colors.bgHover,
        }}
      />
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
          mentions={message}
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
