import { hexToRgba, tokenizeMessageContent } from "@discordia/client-shared";

import { Text } from "react-native";

/** Color a usar para un `@usuario` o `@rol` mencionado, o `null` si no se reconoce. */
export type MentionResolver = (name: string) => { color: string } | null;

const EVERYONE_NAMES = new Set(["everyone", "here"]);

interface MessageContentProps {
  content: string;
  /** Resuelve el color de `@usuario`/`@rol` por nombre. Ausente en DMs (sin roles de server). */
  resolveMention?: MentionResolver;
}

export function MessageContent({
  content,
  resolveMention,
}: MessageContentProps) {
  return (
    <Text className="text-[15px] leading-[21px] text-content">
      {tokenizeMessageContent(content).map((token, index) => {
        if (token.kind === "text") return token.value;

        if (token.kind === "channel") {
          return (
            <Text
              key={index}
              className="rounded bg-highlight/15 font-medium text-highlight"
            >
              {token.value}
            </Text>
          );
        }

        const name = token.value.slice(1);
        if (EVERYONE_NAMES.has(name)) {
          return (
            <Text
              key={index}
              className="rounded bg-highlight/15 font-bold text-highlight"
            >
              {token.value}
            </Text>
          );
        }

        const resolved = resolveMention?.(name);
        if (!resolved) {
          return (
            <Text
              key={index}
              className="rounded bg-highlight/15 font-medium text-highlight"
            >
              {token.value}
            </Text>
          );
        }
        return (
          <Text
            key={index}
            className="rounded font-medium"
            style={{
              backgroundColor: hexToRgba(resolved.color, 0.16),
              color: resolved.color,
            }}
          >
            {token.value}
          </Text>
        );
      })}
    </Text>
  );
}
