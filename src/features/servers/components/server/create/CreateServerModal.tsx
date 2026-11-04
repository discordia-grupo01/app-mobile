import { type ServerSummary } from "@discordia/client-shared";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";
import { ModalCloseButton } from "../../../../../components/ui/ModalCloseButton";
import { ModalShell } from "../../../../../components/ui/ModalShell";
import { useCreateServerForm } from "../../../useCreateServerForm";
import { ServerNameField } from "../ServerNameField";
import { CreateServerSuccess } from "./CreateServerSuccess";
import { ServerIconPicker } from "./ServerIconPicker";

interface CreateServerModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (server: ServerSummary) => void;
}

export function CreateServerModal({
  visible,
  onClose,
  onCreated,
}: CreateServerModalProps) {
  const form = useCreateServerForm();
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) form.reset();
  }

  return (
    <ModalShell visible={visible} onClose={onClose} className="max-w-115">
      <ModalCloseButton onPress={onClose} />

      <ScrollView
        contentContainerClassName="p-7 pt-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {form.created ? (
          <CreateServerSuccess
            server={form.created}
            iconUri={form.icon?.uri}
            onContinue={() => form.created && onCreated(form.created)}
          />
        ) : (
          <View>
            <View className="items-center mb-5">
              <Text className="text-[20px] font-bold text-content mb-1">
                Crear un servidor
              </Text>
              <Text className="text-[13px] leading-[19px] text-content-muted text-center">
                Personalizá tu servidor con un nombre e ícono.{"\n"}Siempre
                podés cambiarlo después.
              </Text>
            </View>

            <FormErrorBanner message={form.globalError} />

            <ServerIconPicker
              serverName={form.name}
              iconUri={form.icon?.uri}
              error={form.iconError}
              onPick={form.pickIcon}
              onRemove={form.removeIcon}
            />

            <View className="mb-1">
              <ServerNameField
                value={form.name}
                error={form.nameError}
                onChange={form.changeName}
                autoFocus
              />
            </View>

            <View className="flex-row gap-3 mt-6 pt-5 border-t border-t-line">
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={onClose}
                style={{ flex: 1, width: undefined }}
              />
              <Button
                title="Crear servidor"
                onPress={form.submit}
                disabled={!form.canSubmit}
                isLoading={form.isSubmitting}
                style={{ flex: 1, width: undefined }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </ModalShell>
  );
}
