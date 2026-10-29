import {
  MAX_NAME,
  SERVER_NAME_LABEL,
  SERVER_NAME_PLACEHOLDER,
} from "@discordia/client-shared";
import { ScrollView, Text, TextInput, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { FieldError } from "../../../../../components/ui/FieldError";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";
import { cn } from "../../../../../lib/cn";
import { useThemeColors } from "../../../../../theme/theme-context";
import type { ServerSettingsForm } from "../../../useServerSettingsForm";
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
  const colors = useThemeColors();
  const isNameTooLong = form.name.length > MAX_NAME;

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
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle uppercase">
            {SERVER_NAME_LABEL} <Text className="text-danger">*</Text>
          </Text>
          <Text
            className={cn(
              "text-[11px]",
              isNameTooLong ? "text-danger" : "text-content-subtle",
            )}
          >
            {form.name.length}/{MAX_NAME}
          </Text>
        </View>
        <View
          className={cn(
            "rounded-xl border bg-surface-input px-3.5 min-h-12 justify-center",
            form.nameError ? "border-danger" : "border-line",
          )}
        >
          <TextInput
            value={form.name}
            onChangeText={form.changeName}
            placeholder={SERVER_NAME_PLACEHOLDER}
            placeholderTextColor={colors.textSubtle}
            maxLength={MAX_NAME + 10}
            className="text-content text-[14px]"
          />
        </View>
        <FieldError message={form.nameError} />
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
