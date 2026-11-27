import { useState } from "react";
import type { TextLayoutEvent } from "react-native";

const ELLIPSIS = "…";
// Android rellena el renglon cortado con este caracter invisible.
const ZERO_WIDTH_PADDING = /﻿/g;

export function useSingleLinePlaceholder(placeholder: string) {
  const [measured, setMeasured] = useState({
    source: placeholder,
    fitted: placeholder,
  });

  function onTextLayout(event: TextLayoutEvent) {
    const visible = event.nativeEvent.lines[0]?.text
      .replace(ZERO_WIDTH_PADDING, "")
      .trimEnd();
    let fitted = placeholder;
    if (visible && visible !== placeholder) {
      fitted = visible.endsWith(ELLIPSIS)
        ? visible
        : `${visible.slice(0, -1)}${ELLIPSIS}`;
    }
    setMeasured({ source: placeholder, fitted });
  }

  // Si cambio el texto y todavia no se midio, se usa entero hasta el proximo layout.
  const fitted =
    measured.source === placeholder ? measured.fitted : placeholder;
  return { placeholder: fitted, onTextLayout };
}
