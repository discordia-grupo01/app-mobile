import {
  addBannedWord,
  BANNED_WORD_MAX_LENGTH,
  BANNED_WORDS_MAX,
  removeBannedWord,
  removeBannedWordLabel,
  validateBannedWord,
  WORD_FILTER_ADD_ACTION,
  WORD_FILTER_DESCRIPTION,
  WORD_FILTER_EMPTY,
  WORD_FILTER_INPUT_PLACEHOLDER,
  WORD_FILTER_SAVE_ACTION,
  WORD_FILTER_SAVED,
  WORD_FILTER_TITLE,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "../../../../components/ui/Button";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { listBannedWords, saveBannedWords } from "../../../word-filter/api";

/**
 * Lista de palabras prohibidas (CA2). Los cambios quedan locales hasta
 * "Guardar cambios", que manda la lista entera.
 */
export function WordFilterStep({ serverId }: { serverId: string }) {
  const colors = useThemeColors();
  const [saved, setSaved] = useState<string[] | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listBannedWords(serverId).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setLoadError(result.message);
        return;
      }
      setSaved(result.words);
      setWords(result.words);
    });
    return () => {
      cancelled = true;
    };
  }, [serverId]);

  const isDirty =
    saved !== null &&
    (saved.length !== words.length || saved.some((w, i) => w !== words[i]));

  function handleAdd() {
    const error = validateBannedWord(draft, words);
    if (error) {
      setDraftError(error);
      return;
    }
    setWords((prev) => addBannedWord(prev, draft));
    setDraft("");
    setDraftError("");
    setSavedNotice(false);
  }

  function handleRemove(word: string) {
    setWords((prev) => removeBannedWord(prev, word));
    setSavedNotice(false);
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveError("");
    const result = await saveBannedWords(serverId, words);
    setIsSaving(false);
    if (!result.ok) {
      setSaveError(result.message);
      return;
    }
    setSaved(result.words);
    setWords(result.words);
    setSavedNotice(true);
  }

  const alert = loadError || saveError;

  return (
    <ScrollView
      contentContainerClassName="pb-7"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-7 pt-6">
        <Text className="text-[13px] leading-[19px] text-content-muted">
          {WORD_FILTER_DESCRIPTION}
        </Text>
      </View>

      {alert ? (
        <View className="flex-row items-start gap-2.5 mx-7 rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3.5 py-3 mt-4">
          <Feather name="alert-circle" size={16} color={colors.danger} />
          <Text className="flex-1 text-danger text-[13px]">{alert}</Text>
        </View>
      ) : null}

      {saved === null && !loadError ? (
        <ActivityIndicator className="mt-8" color={colors.textMuted} />
      ) : null}

      {saved !== null ? (
        <>
          <View className="px-7 mt-5">
            <View className="flex-row gap-2">
              <View
                className={cn(
                  "flex-1 rounded-xl border bg-surface-input px-3.5 min-h-12 justify-center",
                  draftError ? "border-danger" : "border-line",
                )}
              >
                <TextInput
                  value={draft}
                  onChangeText={(text) => {
                    setDraft(text);
                    setDraftError("");
                  }}
                  onSubmitEditing={handleAdd}
                  submitBehavior="submit"
                  returnKeyType="done"
                  placeholder={WORD_FILTER_INPUT_PLACEHOLDER}
                  placeholderTextColor={colors.textSubtle}
                  maxLength={BANNED_WORD_MAX_LENGTH + 10}
                  autoCapitalize="none"
                  accessibilityLabel={WORD_FILTER_INPUT_PLACEHOLDER}
                  className="text-content text-[14px]"
                />
              </View>
              <Button
                title={WORD_FILTER_ADD_ACTION}
                variant="secondary"
                onPress={handleAdd}
                fullWidth={false}
                className="px-4"
              />
            </View>
            {draftError ? (
              <View className="flex-row items-center gap-1.5 mt-1.5">
                <Feather name="alert-circle" size={13} color={colors.danger} />
                <Text className="text-danger text-[12px]">{draftError}</Text>
              </View>
            ) : null}
          </View>

          <View className="px-7 mt-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle uppercase">
                {WORD_FILTER_TITLE}
              </Text>
              <Text className="text-[11px] text-content-subtle">
                {words.length}/{BANNED_WORDS_MAX}
              </Text>
            </View>
            {words.length === 0 ? (
              <Text className="text-[13px] text-content-subtle">
                {WORD_FILTER_EMPTY}
              </Text>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {words.map((word) => (
                  <View
                    key={word}
                    className="flex-row items-center gap-1 rounded-full border border-line bg-surface-input py-1 pl-3 pr-1.5"
                  >
                    <Text className="text-[13px] text-content">{word}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemove(word)}
                      hitSlop={8}
                      className="w-6 h-6 items-center justify-center"
                      accessibilityRole="button"
                      accessibilityLabel={removeBannedWordLabel(word)}
                    >
                      <Feather name="x" size={12} color={colors.textSubtle} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="px-7 mt-7 pt-5 border-t border-t-line gap-3">
            {savedNotice && !isDirty ? (
              <Text
                accessibilityRole="alert"
                className="text-center text-[13px] text-content-muted"
              >
                {WORD_FILTER_SAVED}
              </Text>
            ) : null}
            <Button
              title={WORD_FILTER_SAVE_ACTION}
              onPress={handleSave}
              disabled={!isDirty}
              isLoading={isSaving}
            />
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
