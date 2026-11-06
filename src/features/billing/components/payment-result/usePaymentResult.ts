import {
  PAYMENT_RETURN_POLL_MS,
  PAYMENT_RETURN_TIMEOUT_MS,
  PAYMENT_STATUS_FAILED,
  type PaymentReturnParams,
} from "@discordia/client-shared";

import { useCallback, useEffect, useState } from "react";

import { getPointsOverview, getPremium, getPurchase } from "../../api";
import {
  checkPaymentStep,
  type PaymentResultState,
  type PaymentStatusApi,
  VERIFYING,
} from "./paymentResult";

const STATUS_API: PaymentStatusApi = {
  getPurchase,
  getPointsOverview: () => getPointsOverview(),
  getPremium,
};

export function usePaymentResult({ kind, purchaseId }: PaymentReturnParams) {
  const [state, setState] = useState<PaymentResultState>(VERIFYING);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const payment: PaymentReturnParams = { kind, purchaseId };
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    async function tick() {
      const elapsed = Date.now() - startedAt;
      const step = await checkPaymentStep(payment, elapsed, STATUS_API);
      if (cancelled) return;

      if (step.kind === "progress") {
        setState(step.state);
        if (step.state.progress.done) return;
      } else if (elapsed >= PAYMENT_RETURN_TIMEOUT_MS) {
        setState((current) => ({
          ...current,
          progress: { ...current.progress, done: true },
          error: PAYMENT_STATUS_FAILED,
        }));
        return;
      }
      timer = setTimeout(() => void tick(), PAYMENT_RETURN_POLL_MS);
    }

    void tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [kind, purchaseId, attempt]);

  const retry = useCallback(() => {
    setState(VERIFYING);
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}
