import {
  ANIMATED_SERVER_ICON_UNLOCKED,
  BOOST_PERK_LEVEL,
  nextBoostLevel,
} from "@discordia/client-shared";
import { ScrollView, Text, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { FieldError } from "../../../../../components/ui/FieldError";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";
import { BoostPerkHint } from "../../../../boosts/components/BoostPerkHint";
import { BoostProgressStrip } from "../../../../boosts/components/BoostProgressStrip";
import { BoostServerButton } from "../../../../boosts/components/BoostServerButton";
import type { ServerSettingsForm } from "../../../useServerSettingsForm";
import { ServerNameField } from "../ServerNameField";
import { BannerPresetPicker } from "./BannerPresetPicker";
import { ServerIdentityEditor } from "./ServerIdentityEditor";

interface ServerProfileStepProps {
  form: ServerSettingsForm;
  serverName: string;
  onCancel: () => void;
  onBoost?: () => void;
}

export function ServerProfileStep({
  form,
  serverName,
  onCancel,
  onBoost,
}: ServerProfileStepProps) {
  const boostStripInBanner =
    nextBoostLevel(form.boostLevel) === BOOST_PERK_LEVEL.custom_banner;

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
        isBannerLocked={form.isBannerLocked}
        boostCount={form.boostCount}
        bannerFooter={
          boostStripInBanner ? (
            <BoostProgressStrip
              level={form.boostLevel}
              boostCount={form.boostCount}
              compact
            />
          ) : undefined
        }
        bannerAction={
          boostStripInBanner && onBoost ? (
            <BoostServerButton onPress={onBoost} />
          ) : undefined
        }
        onPickIcon={form.pickIcon}
        onPickBanner={form.pickBanner}
        onRemoveBanner={form.clearBanner}
      />

      <View className="mx-7">
        <FieldError message={form.iconError} />
        <FieldError message={form.bannerError} />
        <View className="mt-3">
          <BoostPerkHint
            perk="animated_icon"
            level={form.boostLevel}
            boostCount={form.boostCount}
            unlockedHint={ANIMATED_SERVER_ICON_UNLOCKED}
          />
        </View>
        {form.isBannerLocked && !boostStripInBanner ? (
          <View className="mt-3">
            <BoostProgressStrip
              level={form.boostLevel}
              boostCount={form.boostCount}
              onBoost={onBoost}
            />
          </View>
        ) : null}
      </View>

      <BannerPresetPicker
        selectedId={form.selectedPreset?.id ?? null}
        isLocked={form.isBannerLocked}
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
