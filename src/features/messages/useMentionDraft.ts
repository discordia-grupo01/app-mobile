import {
  applyMentionCandidate,
  createMentionDraft,
  type DraftSegment,
  draftSegments,
  type MentionCandidate,
  mentionDraftReducer,
  mentionDraftView,
  type MentionSources,
  type PickedMention,
} from "@discordia/client-shared";

import { useCallback, useMemo, useReducer, useState } from "react";
import type {
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from "react-native";

interface UseMentionDraftOptions {
  /** Lo que se puede mencionar; `null` en un chat sin menciones (DMs): sin selector. */
  sources: MentionSources | null;
}

export function useMentionDraft({ sources }: UseMentionDraftOptions) {
  const [state, dispatch] = useReducer(
    mentionDraftReducer,
    undefined,
    createMentionDraft,
  );
  /** Cursor que se le impone al input tras elegir; el proximo cambio de seleccion lo libera. */
  const [forcedCursor, setForcedCursor] = useState<number | null>(null);
  const view = useMemo(
    () => mentionDraftView(state, sources),
    [state, sources],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      // `onChangeText` no trae el cursor: se estima y `onSelectionChange` lo corrige enseguida.
      const estimated = state.cursor + (text.length - state.text.length);
      dispatch({
        type: "change",
        text,
        cursor: Math.max(0, Math.min(text.length, estimated)),
      });
    },
    [state.cursor, state.text.length],
  );

  const handleSelectionChange = useCallback(
    (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      setForcedCursor(null);
      dispatch({
        type: "moveCursor",
        cursor: event.nativeEvent.selection.end,
      });
    },
    [],
  );

  const pick = useCallback(
    (candidate: MentionCandidate) => {
      if (!view.active) return;
      const applied = applyMentionCandidate(state.text, view.active, candidate);
      dispatch({ type: "pick", applied });
      setForcedCursor(applied.cursor);
    },
    [view.active, state.text],
  );

  const load = useCallback(
    (text: string, picked: PickedMention[]) =>
      dispatch({ type: "load", text, picked }),
    [],
  );

  // Sin selector (DMs) no hay menciones que resaltar.
  const segments = useMemo<DraftSegment[] | null>(
    () =>
      sources
        ? draftSegments(state.text, state.picked, sources.canMentionEveryone)
        : null,
    [state.text, state.picked, sources],
  );

  return {
    text: state.text,
    segments,
    encoded: view.encoded,
    isOpen: view.isOpen,
    query: view.active?.query ?? "",
    candidates: view.candidates,
    /** Para el prop `selection` del `TextInput`: solo se impone justo despues de elegir. */
    selection:
      forcedCursor === null
        ? undefined
        : { start: forcedCursor, end: forcedCursor },
    handleChangeText,
    handleSelectionChange,
    pick,
    load,
    /** Agrega texto al final (un emoji) sin tocar las menciones elegidas. */
    append: (text: string) => dispatch({ type: "append", text }),
    reset: () => dispatch({ type: "reset" }),
  };
}
