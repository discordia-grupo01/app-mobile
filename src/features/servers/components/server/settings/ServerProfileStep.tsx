import { ScrollView, Text, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { FieldError } from "../../../../../components/ui/FieldError";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";
import type { ServerSettingsForm } from "../../../useServerSettingsForm";
import { ServerNameField } from "../ServerNameField";
import { BannerPresetPicker } from "./BannerPresetPicker";
import { ServerIdentityEditor } from "./ServerIdentityEditor";

interface ServerProfileStepProps {
  form: ServerSettingsForm;
  serverName: string;
  onCancel: () => void;
}

export function ServerProfileStep({
  form,
  serverName,
  onCancel,
}: ServerProfileStepProps) {
  return (
    <ScrollView
      contentContainerClassName="pb-7"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-7 pt-6 mb-1">
        <Text className="text-[13px] leading-[19px] text-content-muted">
          Tocá el banner o el ícono para cambiarlos.
        </Text>
      </View>

      {form.globalError ? (
        <View className="mx-7 mt-4">
          <FormErrorBanner message={form.globalError} />
        </View>
      ) : null}

      <ServerIdentityEditor
        serverName={form.name || serverName}
        iconUri={form.iconPreviewUri}
        bannerUri={form.bannerPreviewUri}
        bannerPreset={form.selectedPreset}
        onPickIcon={form.pickIcon}
        onPickBanner={form.pickBanner}
        onRemoveBanner={form.clearBanner}
      />

      <View className="mx-7">
        <FieldError message={form.iconError} />
        <FieldError message={form.bannerError} />
      </View>

      <BannerPresetPicker
        selectedId={form.selectedPreset?.id ?? null}
        onSelect={form.choosePreset}
      />

      <View className="px-7 mt-7">
        <ServerNameField
          value={form.name}
          error={form.nameError}
          onChange={form.changeName}
        />
      </View>

      <View className="flex-row gap-3 px-7 mt-7 pt-5 border-t border-t-line">
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={onCancel}
          style={{ flex: 1, width: undefined }}
        />
        <Button
          title="Guardar cambios"
          onPress={form.submit}
          disabled={!form.canSubmit}
          isLoading={form.isSubmitting}
          style={{ flex: 1, width: undefined }}
        />
      </View>
    </ScrollView>
  );
}
