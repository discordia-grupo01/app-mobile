import type { ComponentType } from "react";

import { BILLING_COPY } from "../../billingCopy";
import type { BillingSection } from "../../billingSections";
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

/** Los mismos ítems, textos e íconos que el grupo "Facturación" de web. */
export const BILLING_MENU_ITEMS: readonly BillingMenuItem[] = [
  {
    id: "premium",
    label: "Premium",
    description: "Conocé el plan",
    icon: DiscordiaPremiumIcon,
  },
  {
    id: "subscriptions",
    label: BILLING_COPY.subscriptionsTitle,
    description: "Estado y renovación",
    icon: DiscordiaPremiumIcon,
  },
  {
    id: "points",
    label: BILLING_COPY.pointsTitle,
    description: "Saldo y paquetes",
    icon: DiscordiaPointIcon,
  },
  {
    id: "transactions",
    label: BILLING_COPY.transactionsTitle,
    description: "Pagos y movimientos",
    icon: DiscordiaPointIcon,
  },
];
