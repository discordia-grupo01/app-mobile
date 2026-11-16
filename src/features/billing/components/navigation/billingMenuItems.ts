import {
  BILLING_SECTION_LABELS,
  BILLING_SECTIONS,
  type BillingSection,
} from "@discordia/client-shared";

import type { ComponentType } from "react";

import { BoostsSectionIcon } from "../../../boosts/components/BoostsSectionIcon";
import {
  DiscordiaPointIcon,
  DiscordiaPremiumIcon,
} from "../shared/DiscordiaIcons";

/** Color del ítem activo: amarillo para lo de Premium y puntos, petrol para Boosts. */
export type BillingMenuTone = "premium" | "boost";

export interface BillingMenuItem {
  id: BillingSection;
  label: string;
  description: string;
  /** `onAccent`: el ícono va sobre petrol (solo lo usa Boosts). */
  icon: ComponentType<{ size?: number; onAccent?: boolean }>;
  tone: BillingMenuTone;
}

const BILLING_ICONS: Record<BillingSection, BillingMenuItem["icon"]> = {
  premium: DiscordiaPremiumIcon,
  subscriptions: DiscordiaPremiumIcon,
  points: DiscordiaPointIcon,
  boosts: BoostsSectionIcon,
  transactions: DiscordiaPointIcon,
};

export const BILLING_MENU_ITEMS: readonly BillingMenuItem[] =
  BILLING_SECTIONS.map((id) => ({
    id,
    ...BILLING_SECTION_LABELS[id],
    icon: BILLING_ICONS[id],
    tone: id === "boosts" ? "boost" : "premium",
  }));
