import {
  type Boost,
  boostBlockReason,
  RETRY_LABEL,
  type ServerBoostSummary,
  type ServerSummary,
} from "@discordia/client-shared";

import { useEffect, useState } from "react";
import { View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { usePointsBalance } from "../usePointsBalance";
import { useServerBoostsPage } from "../useServerBoostsPage";
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
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";

interface ServerBoostTabProps {
  server: ServerSummary;
  summary: ServerBoostSummary;
  /** Vuelve a pedir el resumen del servidor (nivel y contador). */
  onSummaryStale: () => void;
  onBuyPoints: () => void;
}

export function ServerBoostTab({
  server,
  summary,
  onSummaryStale,
  onBuyPoints,
}: ServerBoostTabProps) {
  const points = usePointsBalance();
  const list = useServerBoostsPage(server.id);
  const boosting = useBoostServer(server.id);
  const removing = useRemoveBoost(list.restart);
  const [confirm, setConfirm] = useState<BoostConfirmSnapshot | null>(null);
  const [toRemove, setToRemove] = useState<Boost | null>(null);

  const capReached = summary.next_level === null;

  const finished = boosting.flow.phase === "done";
  const { reload: reloadPoints } = points;
  const { restart: restartList } = list;
  useEffect(() => {
    if (!finished) return;
    onSummaryStale();
    reloadPoints();
    restartList();
  }, [finished, onSummaryStale, reloadPoints, restartList]);

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

      {points.state.status === "error" ? (
        <View className="gap-3">
          <FormErrorBanner message={points.state.message} />
          <Button
            title={RETRY_LABEL}
            variant="secondary"
            onPress={points.reload}
          />
        </View>
      ) : points.state.status === "loading" ? (
        <LoadingSpinner />
      ) : (
        <BoostActionCard
          serverName={server.name}
          balance={points.state.balance}
          blockReason={boostBlockReason({
            boostCount: summary.boost_count,
            balance: points.state.balance,
          })}
          onBoost={() => {
            if (points.state.status === "ready") {
              openConfirm(points.state.balance);
            }
          }}
          onBuyPoints={onBuyPoints}
        />
      )}

      <ServerBoostList list={list} onRemove={setToRemove} />

      <BoostConfirmModal
        serverName={server.name}
        snapshot={confirm}
        flow={boosting.flow}
        error={boosting.error}
        capReached={capReached}
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
