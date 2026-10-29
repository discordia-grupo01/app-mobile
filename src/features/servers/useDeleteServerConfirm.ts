import {
  type DeleteServerResult,
  matchesServerNameForDeletion,
} from "@discordia/client-shared";
import { useState } from "react";

interface UseDeleteServerConfirmArgs {
  serverName: string;
  onConfirm: (confirmName: string) => Promise<DeleteServerResult>;
  onDeleted: () => void;
}

export type DeleteServerConfirm = ReturnType<typeof useDeleteServerConfirm>;

export function useDeleteServerConfirm({
  serverName,
  onConfirm,
  onDeleted,
}: UseDeleteServerConfirmArgs) {
  const [typedName, setTypedName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    matchesServerNameForDeletion(serverName, typedName) && !isSubmitting;

  function reset() {
    setTypedName("");
    setError("");
    setIsSubmitting(false);
  }

  async function confirm() {
    if (!canSubmit) return;

    setError("");
    setIsSubmitting(true);
    const result = await onConfirm(typedName.trim());
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.fieldErrors?.confirm_name ?? result.message);
      return;
    }

    onDeleted();
  }

  return {
    typedName,
    setTypedName,
    error,
    canSubmit,
    isSubmitting,
    reset,
    confirm,
  };
}
