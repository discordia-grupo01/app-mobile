import {
  type ApiErrorDetails,
  BOOST_PERK_LEVEL,
  boostLevelRequiredMessage,
  requiredBoostLevelOf,
  type UpdateServerFieldErrors,
  type UpdateServerResult,
} from "@discordia/client-shared";

const BOOST_LEVEL_FIELD: Partial<
  Record<number, keyof UpdateServerFieldErrors>
> = {
  [BOOST_PERK_LEVEL.animated_icon]: "icon",
  [BOOST_PERK_LEVEL.custom_banner]: "banner",
};

export function boostLevelFailure(
  details: ApiErrorDetails | undefined,
): UpdateServerResult | undefined {
  const level = requiredBoostLevelOf(details);
  if (level === undefined) return undefined;

  const message = boostLevelRequiredMessage(level);
  const field = BOOST_LEVEL_FIELD[level];
  return field
    ? { ok: false, message, fieldErrors: { [field]: message } }
    : { ok: false, message };
}
