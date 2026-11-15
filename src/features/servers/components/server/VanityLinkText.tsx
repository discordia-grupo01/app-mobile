import { Text } from "react-native";

import { vanityLinkPrefix } from "../../api";

/** "discordia.app/invite/club-lectura" con el código resaltado. */
export function VanityLinkText({ code }: { code: string }) {
  return (
    <Text className="flex-1 text-[14px] text-content" numberOfLines={1}>
      {vanityLinkPrefix()}
      <Text className="font-bold text-boost-band-highlight">{code}</Text>
    </Text>
  );
}
