import {
  VANITY_REMOVE_COPY,
  vanityRemoveImpact,
} from "@discordia/client-shared";
import { Text, View } from "react-native";

import { Button } from "../../../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../../../components/ui/FormErrorBanner";
import { ModalShell } from "../../../../../../components/ui/ModalShell";
import { vanityLinkText } from "../../../../api";

interface RemoveVanityModalProps {
  code: string | null;
  pending: boolean;
  error: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function RemoveVanityModal({
  code,
  pending,
  error,
  onConfirm,
  onClose,
}: RemoveVanityModalProps) {
  return (
    <ModalShell
      visible={code !== null}
      onClose={pending ? () => undefined : onClose}
      dismissOnBackdrop={!pending}
      className="max-w-[400px]"
    >
      {code !== null ? (
        <View className="gap-5 px-6 py-7">
          <View>
            <Text
              accessibilityRole="header"
              className="mb-1 font-display text-xl font-bold text-content"
            >
              {VANITY_REMOVE_COPY.title}
            </Text>
            <Text className="text-sm leading-5 text-content-muted">
              {vanityRemoveImpact(vanityLinkText(code))}
            </Text>
          </View>
          <FormErrorBanner message={error || null} />
          <View className="flex-row gap-3">
            <Button
              title={VANITY_REMOVE_COPY.cancel}
              variant="secondary"
              disabled={pending}
              onPress={onClose}
              style={{ flex: 1, width: undefined }}
            />
            <Button
              title={VANITY_REMOVE_COPY.confirm}
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
