import type { PaymentKind } from "@discordia/client-shared";

export const BILLING_SECTIONS = [
  "premium",
  "subscriptions",
  "points",
  "transactions",
] as const;

export type BillingSection = (typeof BILLING_SECTIONS)[number];

export function isBillingSection(value: string): value is BillingSection {
  return (BILLING_SECTIONS as readonly string[]).includes(value);
}

export const BILLING_HISTORY_PAGE_SIZE = 10;

export const RETURN_SECTION = {
  premium: "subscriptions",
  points: "transactions",
} as const satisfies Record<PaymentKind, BillingSection>;
