import {
  activeBoostCount,
  type Boost,
  RETRY_LABEL,
  type ServerBoostSummary,
  type ServerSummary,
  serverBoosts,
} from "@discordia/client-shared";

import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { useThemeColors } from "../../../theme/theme-context";
import type { OwnBoosts } from "../useOwnBoosts";
import { BoostActionCard } from "./actions/BoostActionCard";
import {
  BoostConfirmModal,
  type BoostConfirmSnapshot,
} from "./actions/BoostConfirmModal";
import { RemoveBoostModal } from "./actions/RemoveBoostModal";
import { ServerBoostList } from "./actions/ServerBoostList";
import { useBoostServer } from "./actions/useBoostServer";
import { useRemoveBoost } from "./actions/useRemoveBoost";
import { BoostStatusCard } from "./BoostStatusCard";

interface ServerBoostTabProps {
  server: ServerSummary;
  summary: ServerBoostSummary;
  /** Se pide en la sección, a la par del resumen, para no esperar uno detrás del otro. */
  own: OwnBoosts;
  /** Vuelve a pedir el resumen del servidor (nivel y contador). */
  onSummaryStale: () => void;
  onBuyPoints: () => void;
}

export function ServerBoostTab({
  server,
  summary,
  own,
  onSummaryStale,
  onBuyPoints,
}: ServerBoostTabProps) {
  const colors = useThemeColors();
  const boosting = useBoostServer(server.id);
  const removing = useRemoveBoost(own.replaceBoost);
  const [confirm, setConfirm] = useState<BoostConfirmSnapshot | null>(null);
  const [toRemove, setToRemove] = useState<Boost | null>(null);

  const finished = boosting.flow.phase === "done";
  const { reload } = own;
  useEffect(() => {
    // Al terminar no se espera solo al socket: se piden el nivel, la lista y el saldo.
    if (!finished) return;
    onSummaryStale();
    reload();
  }, [finished, onSummaryStale, reload]);

  function openConfirm(balance: number) {
    boosting.reset();
    setConfirm({ boostCount: summary.boost_count, balance });
  }

  function closeConfirm() {
    setConfirm(null);
    boosting.reset();
  }

  function closeRemove() {
    setToRemove(null);
    removing.clearError();
  }

  async function confirmRemove() {
    if (!toRemove || !(await removing.remove(toRemove))) return;
    setToRemove(null);
    onSummaryStale();
  }

  return (
    <View className="gap-7">
      <BoostStatusCard summary={summary} />

      {own.state.status === "error" ? (
        <View className="gap-3">
          <FormErrorBanner message={own.state.message} />
          <Button
            title={RETRY_LABEL}
            variant="secondary"
            onPress={own.reload}
          />
        </View>
      ) : own.state.status === "loading" ? (
        <View className="items-center py-6">
          <ActivityIndicator size="small" color={colors.accentBright} />
        </View>
      ) : (
        <>
          <BoostActionCard
            balance={own.state.balance}
            onBoost={() => {
              if (own.state.status === "ready") openConfirm(own.state.balance);
            }}
            onBuyPoints={onBuyPoints}
          />
          <ServerBoostList
            boosts={serverBoosts(own.state.boosts, server.id)}
            activeCount={activeBoostCount(own.state.boosts, server.id)}
            onRemove={setToRemove}
          />
        </>
      )}

      <BoostConfirmModal
        serverName={server.name}
        snapshot={confirm}
        flow={boosting.flow}
        error={boosting.error}
        onConfirm={() => void boosting.submit()}
        onClose={closeConfirm}
      />

      <RemoveBoostModal
        serverName={server.name}
        boost={toRemove}
        boostCount={summary.boost_count}
        pending={removing.pending}
        error={removing.error}
        onConfirm={() => void confirmRemove()}
        onClose={closeRemove}
      />
    </View>
  );
}
