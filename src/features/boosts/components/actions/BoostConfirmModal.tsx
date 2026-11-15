import {
  balanceAfterBoost,
  BOOST_CONFIRM_COPY,
  BOOST_COST_POINTS,
  BOOST_OUTCOME_ACTIONS,
  boostLevelLabel,
  boostLevelUpNotice,
  boostOutcomeCopy,
  boostRefundDelta,
  boostRemainingBalanceLabel,
  formatPoints,
  levelChangeIfBoosted,
} from "@discordia/client-shared";

import { ActivityIndicator, Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { ModalCloseButton } from "../../../../components/ui/ModalCloseButton";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { BoostActionIcon } from "../BoostActionIcon";
import { BoostLevelIcon } from "../BoostLevelIcon";
import type { BoostFlow } from "./useBoostServer";

/** Boosts del servidor y saldo al abrir el diálogo, antes de este boost. */
export interface BoostConfirmSnapshot {
  boostCount: number;
  balance: number;
}

interface BoostConfirmModalProps {
  serverName: string;
  snapshot: BoostConfirmSnapshot | null;
  flow: BoostFlow;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function BoostConfirmModal({
  snapshot,
  flow,
  onClose,
  ...content
}: BoostConfirmModalProps) {
  const locked = flow.phase === "submitting";

  return (
    <ModalShell
      visible={snapshot !== null}
      onClose={locked ? () => undefined : onClose}
      dismissOnBackdrop={!locked}
      className="max-w-[400px]"
    >
      {snapshot ? (
        flow.phase === "waiting" || flow.phase === "done" ? (
          <BoostOutcome
            {...content}
            snapshot={snapshot}
            flow={flow}
            onClose={onClose}
          />
        ) : (
          <BoostConfirmForm
            {...content}
            snapshot={snapshot}
            submitting={locked}
            onClose={onClose}
          />
        )
      ) : null}
    </ModalShell>
  );
}

function Fact({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-sm text-content-subtle">{label}</Text>
      <Text
        className={cn(
          "text-sm font-semibold tabular-nums",
          highlight ? "text-success" : "text-content",
        )}
      >
        {value}
      </Text>
    </View>
  );
}

interface BoostConfirmFormProps {
  snapshot: BoostConfirmSnapshot;
  submitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

function BoostConfirmForm({
  snapshot,
  submitting,
  error,
  onConfirm,
  onClose,
}: BoostConfirmFormProps) {
  const levelUpNotice = boostLevelUpNotice(snapshot.boostCount);

  return (
    <View className="gap-5 px-6 py-7">
      {submitting ? null : <ModalCloseButton onPress={onClose} />}
      <View>
        <View className="flex-row items-center gap-3 pr-8">
          <BoostActionIcon size={24} />
          <Text
            accessibilityRole="header"
            className="flex-1 font-display text-xl font-bold text-content"
          >
            {BOOST_CONFIRM_COPY.title}
          </Text>
        </View>
        <Text className="mt-2 text-sm leading-5 text-content-muted">
          {BOOST_CONFIRM_COPY.description}
        </Text>
      </View>

      <View className="gap-2.5 rounded-2xl bg-surface-input px-4 py-4">
        <Fact
          label={BOOST_CONFIRM_COPY.costLabel}
          value={formatPoints(BOOST_COST_POINTS)}
        />
        <Fact
          label={BOOST_CONFIRM_COPY.balanceLabel}
          value={snapshot.balance}
        />
        <Fact
          label={BOOST_CONFIRM_COPY.remainingLabel}
          value={balanceAfterBoost(snapshot.balance)}
          highlight
        />
      </View>

      {levelUpNotice ? (
        <Text className="rounded-xl bg-boost-column px-4 py-3 text-sm leading-5 text-content">
          {levelUpNotice}
        </Text>
      ) : null}

      <FormErrorBanner message={error} />

      <View className="flex-row gap-3">
        <Button
          title={BOOST_CONFIRM_COPY.cancel}
          variant="secondary"
          disabled={submitting}
          onPress={onClose}
          style={{ flex: 1, width: undefined }}
        />
        <Button
          title={BOOST_CONFIRM_COPY.confirm}
          isLoading={submitting}
          onPress={onConfirm}
          style={{ flex: 1, width: undefined }}
        />
      </View>
    </View>
  );
}

interface BoostOutcomeProps {
  serverName: string;
  snapshot: BoostConfirmSnapshot;
  flow: Extract<BoostFlow, { phase: "waiting" | "done" }>;
  onClose: () => void;
}

function BoostOutcome({
  serverName,
  snapshot,
  flow,
  onClose,
}: BoostOutcomeProps) {
  const colors = useThemeColors();
  const { request } = flow;
  const { outcome } = request.progress;
  const change = levelChangeIfBoosted(snapshot.boostCount);
  const copy = boostOutcomeCopy(outcome, {
    serverName,
    ...snapshot,
    statusDetail: request.boost?.status_detail,
  });
  const leveledUp = outcome === "applied" && change.to !== change.from;
  const action =
    outcome === "applied"
      ? BOOST_OUTCOME_ACTIONS.done
      : outcome === "rejected"
        ? BOOST_OUTCOME_ACTIONS.understood
        : BOOST_OUTCOME_ACTIONS.close;

  return (
    <View>
      {leveledUp ? (
        <View className="flex-row items-center gap-3 bg-boost-band px-6 py-5">
          <View className="h-12 w-12 items-center justify-center rounded-xl border border-boost-band-line bg-boost-band-tile">
            <BoostLevelIcon level={change.to} size={30} bare />
          </View>
          <Text className="font-display text-xl font-bold text-boost-on-band">
            {boostLevelLabel(change.to)}
          </Text>
        </View>
      ) : null}

      <View className="gap-5 px-6 py-7">
        {leveledUp ? null : (
          <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface-input">
            {outcome === "applying" ? (
              <ActivityIndicator size="small" color={colors.accentBright} />
            ) : (
              <BoostActionIcon size={28} />
            )}
          </View>
        )}

        <View>
          <Text
            accessibilityRole="header"
            className="mb-1 font-display text-xl font-bold text-content"
          >
            {copy.title}
          </Text>
          <Text
            accessibilityLiveRegion="polite"
            className="text-sm leading-5 text-content-muted"
          >
            {copy.description}
          </Text>
        </View>

        {outcome === "rejected" && request.boost ? (
          <View className="flex-row items-center justify-between rounded-xl bg-surface-input px-4 py-3">
            <Text className="text-sm text-content-muted">
              {BOOST_OUTCOME_ACTIONS.refundRow}
            </Text>
            <Text className="font-display text-sm font-bold text-success tabular-nums">
              {boostRefundDelta(request.boost)}
            </Text>
          </View>
        ) : null}

        {outcome === "applied" ? (
          <Text className="text-xs text-content-subtle">
            {boostRemainingBalanceLabel(snapshot.balance)}
          </Text>
        ) : null}

        <FormErrorBanner message={request.error} />

        {flow.phase === "done" || outcome === "applying" ? (
          <Button
            title={action}
            variant={outcome === "applying" ? "secondary" : "primary"}
            onPress={onClose}
          />
        ) : null}
      </View>
    </View>
  );
}
