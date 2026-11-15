import {
  type BoostLevel,
  canSetVanityUrl,
  vanitySlug,
} from "@discordia/client-shared";
import { useState } from "react";

import { BoostPerkHint } from "../../../../../boosts/components/BoostPerkHint";
import { useVanityUrl } from "../../../../useVanityUrl";
import { RemoveVanityModal } from "./RemoveVanityModal";
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
  const [isRemoving, setIsRemoving] = useState(false);

  if (!canSetVanityUrl(level)) {
    return (
      <BoostPerkHint
        perk="vanity_url"
        level={level}
        boostCount={boostCount}
        unlockedHint=""
      />
    );
  }

  const { savedCode } = vanity;

  async function save(code: string) {
    if (await vanity.save(code)) setIsEditing(false);
  }

  async function remove() {
    if (!(await vanity.save(null))) return;
    setIsRemoving(false);
    setIsEditing(false);
  }

  return (
    <>
      {savedCode === null || isEditing ? (
        <VanityUrlEditor
          initialCode={savedCode ?? vanitySlug(serverName)}
          pending={vanity.pending}
          saveError={isRemoving ? "" : vanity.error}
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
        <VanityUrlSaved
          code={savedCode}
          onChange={() => setIsEditing(true)}
          onRemove={() => {
            vanity.clearError();
            setIsRemoving(true);
          }}
        />
      )}
      <RemoveVanityModal
        code={isRemoving ? savedCode : null}
        pending={vanity.pending}
        error={vanity.error}
        onConfirm={() => void remove()}
        onClose={() => {
          vanity.clearError();
          setIsRemoving(false);
        }}
      />
    </>
  );
}
