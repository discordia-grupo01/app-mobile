import { tokenizeMessageContent } from "@discordia/client-shared";

import { Text } from "react-native";

export function MessageContent({ content }: { content: string }) {
  return (
    <Text className="text-[15px] leading-[21px] text-content">
      {tokenizeMessageContent(content).map((token, index) =>
        token.kind === "text" ? (
          token.value
        ) : (
          <Text
            key={index}
            className="rounded bg-highlight/15 font-medium text-highlight"
          >
            {token.value}
          </Text>
        ),
      )}
    </Text>
  );
}
