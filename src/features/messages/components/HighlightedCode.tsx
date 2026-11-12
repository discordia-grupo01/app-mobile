import {
  type CodeTokenKind,
  highlightCode,
} from "@discordia/client-shared/dist/format/code-highlight";

import { useMemo } from "react";
import { Text } from "react-native";

const KIND_CLASS: Record<CodeTokenKind, string> = {
  keyword: "text-syntax-keyword",
  string: "text-syntax-string",
  number: "text-syntax-number",
  comment: "text-syntax-comment italic",
  function: "text-syntax-function",
  type: "text-syntax-type",
  attribute: "text-syntax-attribute",
};

interface HighlightedCodeProps {
  code: string;
  language: string;
}

/** Codigo coloreado segun el lenguaje. Si el lenguaje no esta soportado, va sin color. */
export function HighlightedCode({ code, language }: HighlightedCodeProps) {
  const tokens = useMemo(() => highlightCode(code, language), [code, language]);
  if (!tokens) return code;
  return tokens.map((token, index) =>
    token.kind ? (
      <Text key={index} className={KIND_CLASS[token.kind]}>
        {token.text}
      </Text>
    ) : (
      token.text
    ),
  );
}
