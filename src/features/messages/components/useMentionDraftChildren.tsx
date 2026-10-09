import { type DraftSegment, mentionChipColors } from "@discordia/client-shared";

import type { ReactNode } from "react";
import { Text } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { useMessageMentions } from "./MentionsContext";

/**
 * Hijos del `TextInput` del composer: el texto del borrador con las menciones
 * elegidas resaltadas (mismos colores y fondo plano que en web, de
 * `mentionChipColors`). Va como hijos y no como `value`: asi el input dibuja
 * cada tramo con su estilo.
 */
export function useMentionDraftChildren(segments: DraftSegment[]): ReactNode[] {
  const colors = useThemeColors();
  const { sources } = useMessageMentions();

  return segments.map((segment, index) => {
    const roleColor =
      segment.kind === "role"
        ? sources?.roles.find(
            (role) => role.id.toLowerCase() === segment.id.toLowerCase(),
          )?.color
        : null;
    const chip = mentionChipColors(segment.kind, colors, roleColor);
    return chip ? (
      <Text key={index} style={chip}>
        {segment.value}
      </Text>
    ) : (
      segment.value
    );
  });
}
