import {
  applyMentionCandidate,
  createMentionDraft,
  type CustomEmojiRef,
  type DraftSegment,
  EVERYONE_MENTION,
  matchPickedEmojis,
  matchPickedMentions,
  type MentionCandidate,
  mentionDraftReducer,
  mentionDraftView,
  type MentionSources,
  messageCodeRanges,
  overlapsAny,
  type PickedMention,
} from "@discordia/client-shared";
import { useCallback, useMemo, useReducer, useState } from "react";
import type { TextInputSelectionChangeEvent } from "react-native";

export type ComposerSegment =
  | DraftSegment
  | { kind: "custom_emoji"; value: string; id: string; animated: boolean };

export interface ActiveDraftEmoji {
  start: number;
  end: number;
  emoji: CustomEmojiRef;
}

const EVERYONE_PATTERN = new RegExp(
  `(^|[^\\w@&<])(${EVERYONE_MENTION})(?![\\w-])`,
  "g",
);

interface Marked {
  start: number;
  end: number;
  segment: Exclude<ComposerSegment, { kind: "text" }>;
}

/**
 * Al borrar caracteres en el input, si la eliminacion toca o borra el final de
 * un emoji del servidor elegido (:nombre:), se borra el emoji completo en vez
 * de dejar un texto roto :nom.
 */
export function adjustTextForEmojiDeletion(
  oldText: string,
  newText: string,
  pickedEmojis: readonly CustomEmojiRef[],
): { text: string; cursor: number } | null {
  if (pickedEmojis.length === 0 || newText.length >= oldText.length) {
    return null;
  }

  const code = messageCodeRanges(oldText);
  const matches = matchPickedEmojis(oldText, pickedEmojis, code);
  if (matches.length === 0) return null;

  let prefix = 0;
  while (
    prefix < newText.length &&
    prefix < oldText.length &&
    newText[prefix] === oldText[prefix]
  ) {
    prefix++;
  }

  let suffixOld = oldText.length - 1;
  let suffixNew = newText.length - 1;
  while (
    suffixOld >= prefix &&
    suffixNew >= prefix &&
    oldText[suffixOld] === newText[suffixNew]
  ) {
    suffixOld--;
    suffixNew--;
  }

  const deletedStart = prefix;
  const deletedEnd = suffixOld + 1;

  const touched = matches.find(
    (m) =>
      (deletedStart < m.end && deletedEnd > m.start) ||
      (deletedEnd === m.end && deletedStart >= m.start),
  );

  if (!touched) return null;

  const start = Math.min(deletedStart, touched.start);
  const end = Math.max(deletedEnd, touched.end);
  const text = oldText.slice(0, start) + oldText.slice(end);
  return { text, cursor: start };
}

function composerSegments(
  draft: string,
  picked: readonly PickedMention[],
  pickedEmojis: readonly CustomEmojiRef[],
  canMentionEveryone: boolean,
): ComposerSegment[] {
  const code = messageCodeRanges(draft);
  const marked: Marked[] = [
    ...matchPickedMentions(draft, picked, code).map(
      ({ start, end, mention }) => ({
        start,
        end,
        segment: {
          kind: mention.kind,
          id: mention.id,
          value: draft.slice(start, end),
        } as const,
      }),
    ),
    ...matchPickedEmojis(draft, pickedEmojis, code).map(
      ({ start, end, emoji }) => ({
        start,
        end,
        segment: {
          kind: "custom_emoji" as const,
          id: emoji.id,
          animated: emoji.animated,
          value: draft.slice(start, end),
        },
      }),
    ),
  ];

  if (canMentionEveryone) {
    for (const match of draft.matchAll(EVERYONE_PATTERN)) {
      const prefix = match[1] ?? "";
      const everyone = match[2] ?? "";
      const start = (match.index ?? 0) + prefix.length;
      const end = start + everyone.length;
      if (overlapsAny(start, end, code)) continue;
      if (marked.some((m) => start < m.end && end > m.start)) continue;
      marked.push({
        start,
        end,
        segment: { kind: "everyone", value: everyone },
      });
    }
  }

  marked.sort((a, b) => a.start - b.start);

  const segments: ComposerSegment[] = [];
  let cursor = 0;
  for (const item of marked) {
    if (item.start < cursor) continue;
    if (item.start > cursor) {
      segments.push({ kind: "text", value: draft.slice(cursor, item.start) });
    }
    segments.push(item.segment);
    cursor = item.end;
  }
  if (cursor < draft.length) {
    segments.push({ kind: "text", value: draft.slice(cursor) });
  }

  return segments;
}

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
      const adjusted = adjustTextForEmojiDeletion(
        state.text,
        text,
        state.pickedEmojis,
      );
      if (adjusted) {
        dispatch({
          type: "change",
          text: adjusted.text,
          cursor: adjusted.cursor,
        });
        setForcedCursor(adjusted.cursor);
        return;
      }

      // `onChangeText` no trae el cursor: se estima y `onSelectionChange` lo corrige enseguida.
      const estimated = state.cursor + (text.length - state.text.length);
      dispatch({
        type: "change",
        text,
        cursor: Math.max(0, Math.min(text.length, estimated)),
      });
    },
    [state.cursor, state.text, state.pickedEmojis],
  );

  const handleSelectionChange = useCallback(
    (event: TextInputSelectionChangeEvent) => {
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

  const pickEmoji = useCallback((emoji: CustomEmojiRef) => {
    dispatch({ type: "pickEmoji", emoji });
  }, []);

  const load = useCallback(
    (text: string, picked: PickedMention[]) =>
      dispatch({ type: "load", text, picked }),
    [],
  );

  const segments = useMemo<ComposerSegment[] | null>(() => {
    if (!sources && state.pickedEmojis.length === 0) return null;
    return composerSegments(
      state.text,
      state.picked,
      state.pickedEmojis,
      sources?.canMentionEveryone ?? false,
    );
  }, [state.text, state.picked, state.pickedEmojis, sources]);

  const activeEmojis = useMemo<ActiveDraftEmoji[]>(() => {
    if (state.pickedEmojis.length === 0) return [];
    const code = messageCodeRanges(state.text);
    return matchPickedEmojis(state.text, state.pickedEmojis, code);
  }, [state.text, state.pickedEmojis]);

  const removeEmoji = useCallback(
    (start: number, end: number) => {
      const text = state.text.slice(0, start) + state.text.slice(end);
      const cursor = Math.min(start, text.length);
      dispatch({ type: "change", text, cursor });
      setForcedCursor(cursor);
    },
    [state.text],
  );

  return {
    text: state.text,
    segments,
    activeEmojis,
    encoded: view.encoded,
    isOpen: view.isOpen,
    query: view.active?.query ?? "",
    candidates: view.candidates,
    pickedEmojis: state.pickedEmojis,
    /** Para el prop `selection` del `TextInput`: solo se impone justo despues de elegir. */
    selection:
      forcedCursor === null
        ? undefined
        : { start: forcedCursor, end: forcedCursor },
    handleChangeText,
    handleSelectionChange,
    pick,
    pickEmoji,
    removeEmoji,
    load,
    /** Agrega texto al final (un emoji unicode) sin tocar las menciones elegidas. */
    append: (text: string) => dispatch({ type: "append", text }),
    reset: () => dispatch({ type: "reset" }),
  };
}
