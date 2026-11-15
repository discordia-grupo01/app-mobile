import {
  BOOST_REMOVE_COPY,
  type Boost,
  boostRemoveImpact,
  boostRemoveNoRefund,
  boostRemoveTitle,
  boostRemoveVanityNote,
  lostPerksIfRemoved,
} from "@discordia/client-shared";

import { Text, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { ModalCloseButton } from "../../../../components/ui/ModalCloseButton";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { cn } from "../../../../lib/cn";
import { BoostLevelIcon } from "../BoostLevelIcon";

interface RemoveBoostModalProps {
  serverName: string;
  boost: Boost | null;
  boostCount: number;
  pending: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function RemoveBoostModal({
  serverName,
  boost,
  boostCount,
  pending,
  error,
  onConfirm,
  onClose,
}: RemoveBoostModalProps) {
  const change = lostPerksIfRemoved(boostCount);
  const dropsLevel = change.to !== change.from;

  return (
    <ModalShell
      visible={boost !== null}
      onClose={pending ? () => undefined : onClose}
      dismissOnBackdrop={!pending}
      className="max-w-[400px] px-6 py-7"
    >
      {pending ? null : <ModalCloseButton onPress={onClose} />}
      {boost ? (
        <View className="gap-5">
          <View className="pr-8">
            <Text
              accessibilityRole="header"
              className="mb-1 font-display text-xl font-bold text-content"
            >
              {boostRemoveTitle(serverName)}
            </Text>
            <Text className="text-sm leading-5 text-content-muted">
              {boostRemoveNoRefund(boost)}
            </Text>
          </View>

          <View
            className={cn(
              "flex-row items-start gap-3 rounded-xl px-4 py-3",
              dropsLevel ? "bg-danger-soft" : "bg-surface-input",
            )}
          >
            <BoostLevelIcon level={change.to} size={20} bare />
            <Text
              className={cn(
                "flex-1 text-sm leading-5",
                dropsLevel ? "text-danger" : "text-content-muted",
              )}
            >
              {boostRemoveImpact(boostCount)}
              {boostRemoveVanityNote(boostCount)
                ? ` ${boostRemoveVanityNote(boostCount)}`
                : null}
            </Text>
          </View>

          <FormErrorBanner message={error} />

          <View className="flex-row gap-3">
            <Button
              title={BOOST_REMOVE_COPY.cancel}
              variant="secondary"
              disabled={pending}
              onPress={onClose}
              style={{ flex: 1, width: undefined }}
            />
            <Button
              title={BOOST_REMOVE_COPY.confirm}
              variant="danger"
              isLoading={pending}
              onPress={onConfirm}
              style={{ flex: 1, width: undefined }}
            />
          </View>
        </View>
      ) : null}
    </ModalShell>
  );
}
