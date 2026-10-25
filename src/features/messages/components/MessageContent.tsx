import {
  isActiveMention,
  MENTION_DELETED_ROLE_NAME,
  type MessageMentions,
  splitHighlight,
  tokenizeMessageContent,
  UNKNOWN_USER_NAME,
} from "@discordia/client-shared";

import type { ReactNode } from "react";
import { Text } from "react-native";

import { MentionChip } from "./MentionChip";
import { useMessageMentions } from "./MentionsContext";

interface MessageContentProps {
  content: string;
  mentions?: MessageMentions;
  /** Va pegado al final del texto, en el mismo renglon si entra (ej. "(editado)"). */
  suffix?: ReactNode;
  /** Termino a resaltar en el texto (resultados de busqueda). */
  highlight?: string;
}

export function MessageContent({
  content,
  mentions = {},
  suffix,
  highlight,
}: MessageContentProps) {
  const { resolveMention } = useMessageMentions();

  return (
    <Text className="text-[15px] leading-[21px] text-content">
      {tokenizeMessageContent(content).map((token, index) => {
        if (token.kind === "text") {
          if (!highlight) return token.value;
          return splitHighlight(token.value, highlight).map((part, i) =>
            part.isMatch ? (
              <Text
                key={`${index}-${i}`}
                className="rounded-sm bg-highlight/30 text-content"
              >
                {part.text}
              </Text>
            ) : (
              part.text
            ),
          );
        }
        if (token.kind === "channel") {
          return <MentionChip key={index} text={token.value} />;
        }
        if (!isActiveMention(token, mentions)) return token.value;
        if (token.kind === "everyone") {
          return <MentionChip key={index} text={token.value} isStrong />;
        }

        const resolved = resolveMention?.(token.kind, token.id);
        const fallbackName =
          token.kind === "role" ? MENTION_DELETED_ROLE_NAME : UNKNOWN_USER_NAME;
        return (
          <MentionChip
            key={index}
            text={`@${resolved?.name ?? fallbackName}`}
            color={resolved?.color}
          />
        );
      })}
      {suffix}
    </Text>
  );
}
