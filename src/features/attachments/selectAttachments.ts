import {
  ALLOWED_ATTACHMENT_TYPES,
  PREMIUM_ATTACHMENT_TYPES,
  validateAttachment,
  validateAttachmentCount,
} from "@discordia/client-shared";

type PickedFile = { uri: string; mimeType?: string; size?: number };

type AttachmentOptions = { premium: boolean };

export type AttachmentSelection<T> = {
  accepted: T[];
  error: string | undefined;
};

export function attachmentPickerTypes({
  premium,
}: AttachmentOptions): string[] {
  return [...(premium ? PREMIUM_ATTACHMENT_TYPES : ALLOWED_ATTACHMENT_TYPES)];
}

export function selectAttachments<T extends PickedFile>(
  current: readonly T[],
  picked: readonly T[],
  { premium }: AttachmentOptions,
): AttachmentSelection<T> {
  const known = new Set(current.map((file) => file.uri));
  const errorOf = (file: T) =>
    validateAttachment(
      { type: file.mimeType ?? "", size: file.size ?? 1 },
      { premium },
    );

  const fresh = picked.filter((file) => !known.has(file.uri));
  const accepted = fresh.filter((file) => errorOf(file) === undefined);
  const overLimit = validateAttachmentCount(current.length, accepted.length);
  if (overLimit) return { accepted: [], error: overLimit };

  const rejected = fresh.map(errorOf).find((error) => error !== undefined);
  return { accepted, error: rejected };
}
