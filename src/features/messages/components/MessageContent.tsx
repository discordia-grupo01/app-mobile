import {
  isActiveMention,
  MENTION_DELETED_ROLE_NAME,
  type MessageBlock,
  type MessageInline,
  type MessageList,
  type MessageMentions,
  parseMessageMarkdown,
  splitHighlight,
  UNKNOWN_USER_NAME,
} from "@discordia/client-shared";

import type { ReactNode } from "react";
import { Linking, Platform, ScrollView, Text, View } from "react-native";

import { HighlightedCode } from "./HighlightedCode";
import { MentionChip } from "./MentionChip";
import { useMessageMentions } from "./MentionsContext";
import { Spoiler } from "./Spoiler";

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
const SUBTEXT_CLASS = "text-[12px] leading-[16px] text-content-subtle";

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

  function renderText(
    value: string,
    key: string | number,
    concealed = false,
  ): ReactNode {
    if (!highlight || concealed) return value;
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

  /**
   * `concealed`: adentro de un spoiler tapado. Lo que tiene color propio
   * (menciones, links, resaltado) va como texto comun para que no se vea.
   */
  function renderInline(
    nodes: readonly MessageInline[],
    concealed = false,
  ): ReactNode {
    const inner = (children: readonly MessageInline[]) =>
      renderInline(children, concealed);
    return nodes.map((node, index) => {
      switch (node.kind) {
        case "text":
          return renderText(node.value, index, concealed);
        case "bold":
          return (
            <Text key={index} className="font-bold">
              {inner(node.children)}
            </Text>
          );
        case "italic":
          return (
            <Text key={index} className="italic">
              {inner(node.children)}
            </Text>
          );
        case "strike":
          return (
            <Text key={index} className="line-through">
              {inner(node.children)}
            </Text>
          );
        case "underline":
          return (
            <Text key={index} className="underline">
              {inner(node.children)}
            </Text>
          );
        case "spoiler":
          return (
            <Spoiler key={index}>
              {(hidden) => renderInline(node.children, hidden)}
            </Spoiler>
          );
        case "link":
          if (concealed) return inner(node.children);
          return (
            <Text
              key={index}
              accessibilityRole="link"
              className="text-sky"
              onPress={() => void Linking.openURL(node.url)}
            >
              {inner(node.children)}
            </Text>
          );
        case "code":
          if (concealed) return node.value;
          return (
            <Text
              key={index}
              className="rounded bg-surface-sunken text-[13px]"
              style={MONOSPACE}
            >
              {renderText(node.value, index, concealed)}
            </Text>
          );
        case "channel":
          if (concealed) return node.value;
          return <MentionChip key={index} text={node.value} />;
      }

      if (!isActiveMention(node, mentions)) return node.value;
      if (concealed && node.kind === "everyone") return node.value;
      if (node.kind === "everyone") {
        return <MentionChip key={index} text={node.value} isStrong />;
      }
      const resolved = resolveMention?.(node.kind, node.id);
      const fallbackName =
        node.kind === "role" ? MENTION_DELETED_ROLE_NAME : UNKNOWN_USER_NAME;
      const name = `@${resolved?.name ?? fallbackName}`;
      if (concealed) return name;
      return <MentionChip key={index} text={name} color={resolved?.color} />;
    });
  }

  function renderList(
    list: MessageList,
    depth: number,
    tail: ReactNode,
    key?: number,
  ): ReactNode {
    const last = list.items.length - 1;
    return (
      <View key={key} className="gap-0.5">
        {list.items.map((item, i) => {
          const itemTail = i === last ? tail : null;
          const lastList = item.lists.length - 1;
          const marker = list.ordered
            ? `${list.start + i}.`
            : depth === 0
              ? "•"
              : "◦";
          return (
            <View key={i} className="flex-row pl-1">
              <Text className={`${BODY_CLASS} min-w-4 pr-1`}>{marker}</Text>
              <View className="flex-1 gap-0.5">
                <Text className={BODY_CLASS}>
                  {renderInline(item.children)}
                  {lastList === -1 ? itemTail : null}
                </Text>
                {item.lists.map((nested, j) =>
                  renderList(
                    nested,
                    depth + 1,
                    j === lastList ? itemTail : null,
                    j,
                  ),
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
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
      case "subtext":
        return (
          <Text key={index} className={SUBTEXT_CLASS}>
            {renderInline(block.children)}
            {tail}
          </Text>
        );
      case "list":
        return renderList(block, 0, tail, index);
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
              {block.language && !highlight ? (
                <HighlightedCode code={block.value} language={block.language} />
              ) : (
                renderText(block.value, index)
              )}
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
