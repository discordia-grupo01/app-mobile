import {
  type Channel,
  validateChannelName,
  validateChannelTopic,
} from "@discordia/client-shared";

import { useCallback, useState } from "react";

import { updateChannel } from "../../../api";

type OverviewSaveResult =
  { ok: true; channel: Channel } | { ok: false; message?: string };

interface OverviewValues {
  name: string;
  topic: string;
}

function valuesOf(channel: Channel): OverviewValues {
  return { name: channel.name, topic: channel.topic ?? "" };
}

export function useChannelOverviewForm(channel: Channel) {
  const [saved, setSaved] = useState<OverviewValues>(() => valuesOf(channel));
  const [name, setNameValue] = useState(saved.name);
  const [topic, setTopicValue] = useState(saved.topic);
  const [nameError, setNameError] = useState("");
  const [topicError, setTopicError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = name.trim() !== saved.name || topic !== saved.topic;

  const setName = useCallback((value: string) => {
    setNameValue(value);
    setNameError("");
  }, []);

  const setTopic = useCallback((value: string) => {
    setTopicValue(value);
    setTopicError("");
  }, []);

  const validate = useCallback((): boolean => {
    const nextNameError = validateChannelName(name) ?? "";
    // Un tema largo que ya venia del back no bloquea guardar el nombre.
    const nextTopicError =
      topic !== saved.topic ? (validateChannelTopic(topic) ?? "") : "";
    setNameError(nextNameError);
    setTopicError(nextTopicError);
    return !nextNameError && !nextTopicError;
  }, [name, topic, saved.topic]);

  const save = useCallback(async (): Promise<OverviewSaveResult> => {
    const trimmed = name.trim();
    const input: { name?: string; topic?: string } = {};
    if (trimmed !== saved.name) input.name = trimmed;
    if (topic !== saved.topic) input.topic = topic;

    setIsSaving(true);
    const result = await updateChannel(channel.id, input);
    setIsSaving(false);
    if (!result.ok) {
      if (result.fieldErrors?.name) {
        setNameError(result.fieldErrors.name);
        return { ok: false };
      }
      return { ok: false, message: result.message };
    }

    const next = valuesOf(result.channel);
    setSaved(next);
    setNameValue(next.name);
    setTopicValue(next.topic);
    return { ok: true, channel: result.channel };
  }, [channel.id, name, saved, topic]);

  return {
    name,
    topic,
    nameError,
    topicError,
    hasChanges,
    isSaving,
    setName,
    setTopic,
    validate,
    save,
  };
}

export type ChannelOverviewForm = ReturnType<typeof useChannelOverviewForm>;
