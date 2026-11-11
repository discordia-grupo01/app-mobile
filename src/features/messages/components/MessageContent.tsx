import {
  isActiveMention,
  MENTION_DELETED_ROLE_NAME,
  type MessageBlock,
  type MessageInline,
  type MessageMentions,
  parseMessageMarkdown,
  splitHighlight,
  UNKNOWN_USER_NAME,
} from "@discordia/client-shared";

import type { ReactNode } from "react";
import { Platform, ScrollView, Text, View } from "react-native";

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

const MONOSPACE = {
  fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
};

const HEADING_CLASS: Record<1 | 2 | 3, string> = {
  1: "text-[22px] leading-[28px] font-bold",
  2: "text-[19px] leading-[25px] font-bold",
  3: "text-[17px] leading-[23px] font-bold",
};

const BODY_CLASS = "text-[15px] leading-[21px] text-content";

export function MessageContent({
  content,
  mentions = {},
  suffix,
  highlight,
}: MessageContentProps) {
  const { resolveMention } = useMessageMentions();
  const blocks = parseMessageMarkdown(content);
  const lastIndex = blocks.length - 1;
  const suffixInline =
    blocks.length > 0 && blocks[lastIndex].kind !== "code-block";

  function renderText(value: string, key: string | number): ReactNode {
    if (!highlight) return value;
    return splitHighlight(value, highlight).map((part, i) =>
      part.isMatch ? (
        <Text
          key={`${key}-${i}`}
          className="rounded-sm bg-highlight/30 text-content"
        >
          {part.text}
        </Text>
      ) : (
        part.text
      ),
    );
  }

  function renderInline(nodes: readonly MessageInline[]): ReactNode {
    return nodes.map((node, index) => {
      switch (node.kind) {
        case "text":
          return renderText(node.value, index);
        case "bold":
          return (
            <Text key={index} className="font-bold">
              {renderInline(node.children)}
            </Text>
          );
        case "italic":
          return (
            <Text key={index} className="italic">
              {renderInline(node.children)}
            </Text>
          );
        case "strike":
          return (
            <Text key={index} className="line-through">
              {renderInline(node.children)}
            </Text>
          );
        case "code":
          return (
            <Text
              key={index}
              className="rounded bg-surface-sunken text-[13px]"
              style={MONOSPACE}
            >
              {renderText(node.value, index)}
            </Text>
          );
        case "channel":
          return <MentionChip key={index} text={node.value} />;
      }

      if (!isActiveMention(node, mentions)) return node.value;
      if (node.kind === "everyone") {
        return <MentionChip key={index} text={node.value} isStrong />;
      }
      const resolved = resolveMention?.(node.kind, node.id);
      const fallbackName =
        node.kind === "role" ? MENTION_DELETED_ROLE_NAME : UNKNOWN_USER_NAME;
      return (
        <MentionChip
          key={index}
          text={`@${resolved?.name ?? fallbackName}`}
          color={resolved?.color}
        />
      );
    });
  }

  function renderBlock(block: MessageBlock, index: number): ReactNode {
    const tail = index === lastIndex && suffixInline ? suffix : null;
    switch (block.kind) {
      case "paragraph":
        return (
          <Text key={index} className={BODY_CLASS}>
            {renderInline(block.children)}
            {tail}
          </Text>
        );
      case "heading":
        return (
          <Text
            key={index}
            className={`text-content ${HEADING_CLASS[block.level]}`}
          >
            {renderInline(block.children)}
            {tail}
          </Text>
        );
      case "list":
        return (
          <View key={index} className="gap-0.5">
            {block.items.map((item, i) => (
              <View key={i} className="flex-row pl-1">
                <Text className={`${BODY_CLASS} w-4`}>•</Text>
                <Text className={`${BODY_CLASS} flex-1`}>
                  {renderInline(item)}
                  {i === block.items.length - 1 ? tail : null}
                </Text>
              </View>
            ))}
          </View>
        );
      case "quote":
        return (
          <View key={index} className="border-l-4 border-line-strong pl-3">
            <Text className={BODY_CLASS}>
              {renderInline(block.children)}
              {tail}
            </Text>
          </View>
        );
      case "code-block":
        return (
          <ScrollView
            key={index}
            horizontal
            className="rounded-md border border-line bg-surface-sunken"
            contentContainerClassName="p-2"
          >
            <Text className="text-[13px] text-content" style={MONOSPACE}>
              {renderText(block.value, index)}
            </Text>
          </ScrollView>
        );
    }
  }

  return (
    <View className="gap-1">
      {blocks.map(renderBlock)}
      {suffixInline || !suffix ? null : (
        <Text className={BODY_CLASS}>{suffix}</Text>
      )}
    </View>
  );
}
