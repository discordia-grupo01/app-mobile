import {
  APP_PAYMENT_RETURN_URL,
  type CheckoutDeps,
  type CheckoutItem,
  newIdempotencyKey,
  type PaymentReturnParams,
  runCheckout,
  shouldRenewIdempotencyKey,
} from "@discordia/client-shared";

import * as WebBrowser from "expo-web-browser";
import { useCallback, useRef, useState } from "react";

import { startPointsCheckout, startPremiumCheckout } from "../../api";

async function openCheckout(url: string): Promise<void> {
  await WebBrowser.openAuthSessionAsync(url, APP_PAYMENT_RETURN_URL);
}

const DEPS: CheckoutDeps = {
  startPremium: (payerEmail, key) =>
    startPremiumCheckout({ payer_email: payerEmail }, key),
  startPoints: (packageId, key) =>
    startPointsCheckout({ package_id: packageId }, key),
  openCheckout,
};

export function useCheckout(
  onReturned: (payment: PaymentReturnParams) => void,
) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef(newIdempotencyKey());
  const inFlight = useRef(false);

  const start = useCallback(
    async (item: CheckoutItem, payerEmail: string) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setPending(true);
      setError(null);
      const outcome = await runCheckout(item, payerEmail, keyRef.current, DEPS);
      inFlight.current = false;
      setPending(false);
      if (shouldRenewIdempotencyKey(outcome)) {
        keyRef.current = newIdempotencyKey();
      }
      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }
      onReturned(outcome.payment);
    },
    [onReturned],
  );

  const reset = useCallback(() => {
    keyRef.current = newIdempotencyKey();
    setPending(false);
    setError(null);
  }, []);

  return { pending, error, start, reset };
}
