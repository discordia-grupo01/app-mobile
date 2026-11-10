import {
  BILLING_SECTION_LABELS,
  BILLING_SECTIONS,
  type BillingSection,
} from "@discordia/client-shared";

import type { ComponentType } from "react";

import {
  DiscordiaPointIcon,
  DiscordiaPremiumIcon,
} from "../shared/DiscordiaIcons";

export interface BillingMenuItem {
  id: BillingSection;
  label: string;
  description: string;
  icon: ComponentType<{ size?: number }>;
}

const BILLING_ICONS: Record<BillingSection, BillingMenuItem["icon"]> = {
  premium: DiscordiaPremiumIcon,
  subscriptions: DiscordiaPremiumIcon,
  points: DiscordiaPointIcon,
  transactions: DiscordiaPointIcon,
};

export const BILLING_MENU_ITEMS: readonly BillingMenuItem[] =
  BILLING_SECTIONS.map((id) => ({
    id,
    ...BILLING_SECTION_LABELS[id],
    icon: BILLING_ICONS[id],
  }));
