export const BILLING_COPY = {
  groupTitle: "Facturación",
  balanceLabel: "Saldo actual",
  premiumTitle: "Discordia Premium",
  planTitle: "Plan Premium",
  planSubtitle:
    "Suscribite con una tarifa mensual y accedé a beneficios personales exclusivos.",
  perMonthPlain: "por mes",
  benefitsTitle: "Mientras el plan esté activo",
  showcaseFacts: [
    "Se renueva automáticamente cada mes.",
    "Si cancelás, conservás los beneficios hasta la fecha ya paga.",
    "El pago se hace en Mercado Pago: Discordia no guarda tarjetas.",
  ],
  subscribeCta: "Suscribirse",
  manage: "Gestionar",
  activeUntil: (date: string) => `Activo hasta el ${date}`,
  subscriptionsTitle: "Suscripciones",
  subscriptionsSubtitle: "Estado y gestión de Discordia Premium.",
  noSubscription: "¿Querés ver todo lo que incluye?",
  discoverPremium: "Conocé el plan",
  resubscribe: "Volver a suscribirme",
  cancelRenewal: "Cancelar renovación",
  cancelSubscription: "Cancelar suscripción",
  cancelTitle: "¿Cancelar la suscripción?",
  keepPremium: "Mantener Premium",
  pointsTitle: "Puntos",
  pointsSubtitle: "Tu saldo y paquetes disponibles.",
  buyPointsTitle: "Comprar puntos",
  buyPointsHint: "Elegí uno de los tres paquetes disponibles.",
  pointsUnit: "puntos",
  buyPackage: (points: string) => `Comprar ${points}`,
  transactionsTitle: "Historial",
  transactionsSubtitle: "Compras con dinero y movimientos de puntos.",
  historyTitle: "Compras con dinero",
  historySubtitle: "Paquetes de puntos pagados mediante Mercado Pago.",
  historyEmpty: "Todavía no hiciste compras de puntos.",
  movementsTitle: "Movimientos de puntos",
  movementsSubtitle: "Últimos ingresos y gastos de tu saldo.",
  movementsEmpty: "Todavía no hay movimientos de puntos.",
  checkoutTitle: {
    premium: "Estás por suscribirte a",
    points: "Estás por comprar",
  },
  checkoutPreparing: "Abriendo Mercado Pago…",
  checkoutContinue: "Continuar a Mercado Pago",
  payerEmailLabel: "Email del pagador",
  retry: "Reintentar",
  loading: "Cargando…",
  resultTitle: "Resultado del pago",
  backToBilling: "Volver a Facturación",
  close: "Cerrar",
  premiumPill: "Premium",
  premiumPillLabel: "Plan Premium activo",
} as const;

export type PremiumBenefitId =
  "attachments" | "animated" | "global-emojis" | "badge";

export const PREMIUM_SHOWCASE_BENEFITS: readonly {
  id: PremiumBenefitId;
  title: string;
  description: string;
}[] = [
  {
    id: "attachments",
    title: "Adjuntos de hasta 50 MB",
    description: "Por archivo, en canales y mensajes directos.",
  },
  {
    id: "animated",
    title: "Emojis animados",
    description: "Usá emojis GIF en tus mensajes y reacciones.",
  },
  {
    id: "global-emojis",
    title: "Emojis de todos tus servidores",
    description:
      "Usá los emojis personalizados de cualquier servidor del que seas miembro, no solo los del servidor donde escribís.",
  },
  {
    id: "badge",
    title: "Insignia Premium",
    description: "Se ve en tu perfil, para vos y para los demás.",
  },
];

export const BILLING_EXTRA_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  CHECKOUT_IN_PROGRESS:
    "Ya estamos preparando este pago. Esperá unos segundos y volvé a intentar.",
  IDEMPOTENCY_KEY_REUSED:
    "No pudimos preparar el pago. Cerrá esta ventana y empezá de nuevo.",
};
