import {
  ALLOWED_ATTACHMENT_TYPES,
  type AttachmentLimitOptions,
  attachmentTooLargeMessage,
  canBoostAttachmentLimit,
  canOfferPremiumForAttachment,
  PREMIUM_ATTACHMENT_TYPES,
  validateAttachment,
  validateAttachmentCount,
} from "@discordia/client-shared";

type PickedFile = { uri: string; mimeType?: string; size?: number };

/** Sin `serverLevel` es un mensaje directo: los boosts no cambian el límite. */
type AttachmentOptions = { premium: boolean } & AttachmentLimitOptions;

/** Qué ofrecer cuando un archivo pasa el límite. */
export type AttachmentLimitOffer = "boost" | "premium";

export type AttachmentSelection<T> = {
  accepted: T[];
  error: string | undefined;
  offer: AttachmentLimitOffer | null;
};

export function attachmentPickerTypes({
  premium,
}: Pick<AttachmentOptions, "premium">): string[] {
  return [...(premium ? PREMIUM_ATTACHMENT_TYPES : ALLOWED_ATTACHMENT_TYPES)];
}

function offerFor(options: AttachmentOptions): AttachmentLimitOffer | null {
  if (canBoostAttachmentLimit(options)) return "boost";
  return canOfferPremiumForAttachment(options) ? "premium" : null;
}

export function selectAttachments<T extends PickedFile>(
  current: readonly T[],
  picked: readonly T[],
  options: AttachmentOptions,
): AttachmentSelection<T> {
  const known = new Set(current.map((file) => file.uri));
  const sizeOf = (file: T) => file.size ?? 1;
  const errorOf = (file: T) =>
    validateAttachment(
      { type: file.mimeType ?? "", size: sizeOf(file) },
      options,
    );

  const fresh = picked.filter((file) => !known.has(file.uri));
  const accepted = fresh.filter((file) => errorOf(file) === undefined);
  const overLimit = validateAttachmentCount(current.length, accepted.length);
  if (overLimit) return { accepted: [], error: overLimit, offer: null };

  const rejected = fresh.map(errorOf).find((error) => error !== undefined);
  const tooLarge = fresh.some(
    (file) =>
      errorOf(file) === attachmentTooLargeMessage(sizeOf(file), options),
  );
  return {
    accepted,
    error: rejected,
    offer: tooLarge ? offerFor(options) : null,
  };
}
