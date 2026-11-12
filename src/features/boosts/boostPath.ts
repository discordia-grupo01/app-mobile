import {
  BOOST_LEVEL_THRESHOLDS,
  type BoostLevel,
  BOOSTED_MAX_ATTACHMENT_MB,
  boostsMissingFor,
  nextBoostLevel,
} from "@discordia/client-shared";

export type BoostMilestone = Exclude<BoostLevel, 0>;

export const BOOST_MILESTONES: readonly BoostMilestone[] = [1, 2, 3];

export const BOOST_MILESTONE_LABELS: Readonly<Record<BoostMilestone, string>> =
  {
    1: "Ícono animado",
    2: "Banner",
    3: "URL propia",
  };

const NEXT_LEVEL_PERKS: Readonly<Record<BoostMilestone, string>> = {
  1: "ícono animado y 20 emojis más",
  2: `banner y adjuntos de ${BOOSTED_MAX_ATTACHMENT_MB} MB`,
  3: "URL propia e insignia",
};

export const BOOST_PATH_START_LABEL = "Hoy";

export const BOOST_COMING_SOON =
  "Muy pronto vas a poder boostear el servidor desde acá.";

export function boostServerTitle(serverName: string): string {
  return `Boosteá ${serverName}`;
}

export function boostNextLevelPitch(
  level: BoostLevel,
  boostCount: number,
): string | undefined {
  const next = nextBoostLevel(level);
  if (next === undefined) return undefined;
  const missing = boostsMissingFor(next, boostCount);
  const boosts = missing === 1 ? "1 boost" : `${missing} boosts`;
  return `Con ${boosts} más llega al nivel ${next}: ${NEXT_LEVEL_PERKS[next]}.`;
}

export function boostPathProgress(boostCount: number): number {
  const filled = BOOST_LEVEL_THRESHOLDS.reduce((sum, threshold, index) => {
    const from = index === 0 ? 0 : BOOST_LEVEL_THRESHOLDS[index - 1];
    const segment = (boostCount - from) / (threshold - from);
    return sum + Math.max(0, Math.min(1, segment));
  }, 0);
  return filled / BOOST_LEVEL_THRESHOLDS.length;
}
