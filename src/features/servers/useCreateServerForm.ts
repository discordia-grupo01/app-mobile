import {
  MAX_NAME,
  MIN_SERVER_NAME,
  type ServerSummary,
  validateServerIcon,
  validateServerName,
} from "@discordia/client-shared";
import { useState } from "react";

import { createServer } from "./api";
import { pickServerImage } from "./pickServerImage";
import type { CreateServerIconInput } from "./types";

export function useCreateServerForm() {
  const [created, setCreated] = useState<ServerSummary | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<CreateServerIconInput | null>(null);
  const [nameError, setNameError] = useState("");
  const [iconError, setIconError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    name.trim().length >= MIN_SERVER_NAME &&
    name.length <= MAX_NAME &&
    !isSubmitting;

  function reset() {
    setCreated(null);
    setName("");
    setIcon(null);
    setNameError("");
    setIconError("");
    setGlobalError("");
    setIsSubmitting(false);
  }

  function changeName(value: string) {
    setName(value);
    setNameError("");
    setGlobalError("");
  }

  async function pickIcon() {
    setIconError("");
    const result = await pickServerImage({
      validate: validateServerIcon,
      purpose: "un ícono",
      fallbackName: "icon.jpg",
    });
    if (result.kind === "invalid") setIconError(result.error);
    if (result.kind === "picked") setIcon(result.image);
  }

  function removeIcon() {
    setIcon(null);
    setIconError("");
  }

  async function submit() {
    setNameError("");
    setGlobalError("");

    const trimmed = name.trim();
    const validationError = validateServerName(trimmed);
    if (validationError) {
      setNameError(validationError);
      return;
    }

    setIsSubmitting(true);
    const result = await createServer({ name: trimmed, icon });
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors?.name) setNameError(result.fieldErrors.name);
      if (result.fieldErrors?.icon) setIconError(result.fieldErrors.icon);
      if (!result.fieldErrors) setGlobalError(result.message);
      return;
    }

    setCreated(result.server);
  }

  return {
    created,
    name,
    changeName,
    icon,
    pickIcon,
    removeIcon,
    nameError,
    iconError,
    globalError,
    isSubmitting,
    canSubmit,
    reset,
    submit,
  };
}
