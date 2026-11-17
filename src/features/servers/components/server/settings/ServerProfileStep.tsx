import {
  canUseAnimatedServerIcon,
  SERVER_BANNER_BENEFIT_COPY,
  serverIconFormatsHint,
} from "@discordia/client-shared";
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { FieldError } from "../../../../../components/ui/FieldError";
import { FormErrorBanner } from "../../../../../components/ui/FormErrorBanner";
import { BoostBenefitField } from "../../../../boosts/components/BoostBenefitField";
import { BoostProgressStrip } from "../../../../boosts/components/BoostProgressStrip";
import type { ServerSettingsForm } from "../../../useServerSettingsForm";
import { ServerNameField } from "../ServerNameField";
import { AnimatedIconField } from "./AnimatedIconField";
import { BannerPresetPicker } from "./BannerPresetPicker";
import { ServerIdentityEditor } from "./ServerIdentityEditor";

interface ServerProfileStepProps {
  form: ServerSettingsForm;
  serverName: string;
  onCancel: () => void;
  onBoost?: () => void;
  /** "Ver qué suma cada nivel": Boosts del servidor en la pestaña Beneficios. */
  onShowBenefits?: () => void;
  /** URL de invitación personalizada: se guarda aparte, con su propio botón. */
  vanityField?: ReactNode;
}

export function ServerProfileStep({
  form,
  serverName,
  onCancel,
  onBoost,
  onShowBenefits,
  vanityField,
}: ServerProfileStepProps) {
  return (
    <ScrollView
      contentContainerClassName="pb-7"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-6 px-6 pt-5">
        <Text className="text-[13px] leading-[19px] text-content-muted">
          Tocá el banner o el ícono para cambiarlos.
        </Text>

        {form.globalError ? (
          <FormErrorBanner message={form.globalError} />
        ) : null}

        <BoostProgressStrip
          level={form.boostLevel}
          boostCount={form.boostCount}
          onBoost={onBoost}
          onShowBenefits={onShowBenefits}
        />

        <ServerNameField
          value={form.name}
          error={form.nameError}
          onChange={form.changeName}
        />

        <BoostBenefitField
          perk="custom_banner"
          level={form.boostLevel}
          boostCount={form.boostCount}
          title={SERVER_BANNER_BENEFIT_COPY.title}
        >
          <ServerIdentityEditor
            serverName={form.name || serverName}
            iconUri={form.iconPreviewUri}
            bannerUri={form.bannerPreviewUri}
            bannerPreset={form.selectedPreset}
            isBannerLocked={form.isBannerLocked}
            canUseGif={canUseAnimatedServerIcon(form.boostLevel)}
            onPickIcon={form.pickIcon}
            onPickBanner={form.pickBanner}
            onRemoveBanner={form.clearBanner}
          />
          <FieldError message={form.iconError} />
          <FieldError message={form.bannerError} />
          <Text className="text-[11px] text-content-subtle">
            {serverIconFormatsHint(form.boostLevel)}
          </Text>
        </BoostBenefitField>

        <AnimatedIconField
          level={form.boostLevel}
          boostCount={form.boostCount}
          onPickIcon={form.pickIcon}
        />

        <BannerPresetPicker
          selectedId={form.selectedPreset?.id ?? null}
          level={form.boostLevel}
          boostCount={form.boostCount}
          onSelect={form.choosePreset}
        />

        {vanityField}
      </View>

      <View className="flex-row gap-3 px-6 mt-7 pt-5 border-t border-t-line">
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
