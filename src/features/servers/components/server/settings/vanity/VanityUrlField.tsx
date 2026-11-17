import {
  type BoostLevel,
  canSetVanityUrl,
  VANITY_URL_COPY,
  vanitySlug,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";

import { useThemeColors } from "../../../../../../theme/theme-context";
import { BoostBenefitField } from "../../../../../boosts/components/BoostBenefitField";
import { vanityLinkPrefix } from "../../../../api";
import { useVanityUrl } from "../../../../useVanityUrl";
import { VanityUrlEditor } from "./VanityUrlEditor";
import { VanityUrlSaved } from "./VanityUrlSaved";

interface VanityUrlFieldProps {
  serverId: string;
  serverName: string;
  level: BoostLevel;
  boostCount: number;
  /** El que trae el servidor; `null` sin URL o debajo del nivel 3. */
  vanityCode: string | null;
}

/** Configuración › Perfil del servidor › URL de invitación personalizada. */
export function VanityUrlField({
  serverId,
  serverName,
  level,
  boostCount,
  vanityCode,
}: VanityUrlFieldProps) {
  const vanity = useVanityUrl(serverId, vanityCode);
  const [isEditing, setIsEditing] = useState(false);

  const { savedCode } = vanity;

  async function save(code: string) {
    if (await vanity.save(code)) setIsEditing(false);
  }

  return (
    <BoostBenefitField
      perk="vanity_url"
      level={level}
      boostCount={boostCount}
      title={VANITY_URL_COPY.title}
    >
      {!canSetVanityUrl(level) ? (
        <LockedVanityUrl code={savedCode ?? vanitySlug(serverName)} />
      ) : savedCode === null || isEditing ? (
        <VanityUrlEditor
          initialCode={savedCode ?? vanitySlug(serverName)}
          pending={vanity.pending}
          saveError={vanity.error}
          onSave={(code) => void save(code)}
          onEdit={vanity.clearError}
          onCancel={
            savedCode === null
              ? undefined
              : () => {
                  vanity.clearError();
                  setIsEditing(false);
                }
          }
        />
      ) : (
        <VanityUrlSaved code={savedCode} onChange={() => setIsEditing(true)} />
      )}
    </BoostBenefitField>
  );
}

function LockedVanityUrl({ code }: { code: string }) {
  const colors = useThemeColors();

  return (
    <>
      <View
        accessibilityState={{ disabled: true }}
        className="min-h-11 flex-row items-center rounded-xl border border-dashed border-line-strong bg-surface-input px-3.5"
      >
        <Text
          className="flex-1 text-[13px] text-content-subtle opacity-70"
          numberOfLines={1}
        >
          {vanityLinkPrefix()}
          <Text className="font-bold">{code}</Text>
        </Text>
        <Feather name="lock" size={14} color={colors.textSubtle} />
      </View>
      <Text className="text-xs text-content-muted">
        {VANITY_URL_COPY.locked}
      </Text>
    </>
  );
}
