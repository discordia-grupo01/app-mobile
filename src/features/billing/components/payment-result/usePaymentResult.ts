import {
  applyPaymentStep,
  checkPaymentStep,
  PAYMENT_RESULT_VERIFYING,
  PAYMENT_RETURN_POLL_MS,
  type PaymentResultState,
  type PaymentReturnParams,
  type PaymentStatusApi,
} from "@discordia/client-shared";

import { useCallback, useEffect, useState } from "react";

import { getPointsOverview, getPremium, getPurchase } from "../../api";

const STATUS_API: PaymentStatusApi = {
  getPurchase,
  getPointsOverview: () => getPointsOverview(),
  getPremium,
};

export function usePaymentResult({ kind, purchaseId }: PaymentReturnParams) {
  const [state, setState] = useState<PaymentResultState>(
    PAYMENT_RESULT_VERIFYING,
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const payment: PaymentReturnParams = { kind, purchaseId };
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let current = PAYMENT_RESULT_VERIFYING;
    const startedAt = Date.now();

    async function tick() {
      const elapsed = Date.now() - startedAt;
      const step = await checkPaymentStep(payment, elapsed, STATUS_API);
      if (cancelled) return;

      const applied = applyPaymentStep(current, step, elapsed);
      current = applied.state;
      setState(current);
      if (applied.finished) return;
      timer = setTimeout(() => void tick(), PAYMENT_RETURN_POLL_MS);
    }

    void tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [kind, purchaseId, attempt]);

  const retry = useCallback(() => {
    setState(PAYMENT_RESULT_VERIFYING);
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}
