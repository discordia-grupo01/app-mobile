import { VANITY_INVITE_COPY } from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useCopyLink } from "../../../../hooks/useCopyLink";
import { BoostedBadge } from "../../../boosts/components/BoostedBadge";
import { vanityLinkText } from "../../api";
import { VanityLinkText } from "./VanityLinkText";

/** Arriba del modal de invitación: la URL personalizada, para todos los que invitan. */
export function ServerVanityLink({ code }: { code: string }) {
  const { copied, error, copy } = useCopyLink();

  return (
    <View className="gap-2 rounded-2xl border border-accent bg-surface-raised p-3.5">
      <View className="flex-row items-center gap-2">
        <Text className="text-[14px] font-semibold text-content flex-1">
          {VANITY_INVITE_COPY.title}
        </Text>
        <BoostedBadge size={16} />
      </View>
      <View className="flex-row items-center gap-2">
        <View className="flex-1 rounded-xl bg-surface-input px-3 py-2.5">
          <VanityLinkText code={code} />
        </View>
        <TouchableOpacity
          onPress={() => void copy(vanityLinkText(code))}
          accessibilityRole="button"
          className="flex-row items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5"
        >
          <Feather name={copied ? "check" : "copy"} size={13} color="#ffffff" />
          <Text className="text-[13px] font-bold text-on-accent">
            {copied ? VANITY_INVITE_COPY.copied : VANITY_INVITE_COPY.copy}
          </Text>
        </TouchableOpacity>
      </View>
      <Text
        className={
          error ? "text-xs text-danger" : "text-xs text-content-subtle"
        }
      >
        {error || VANITY_INVITE_COPY.note}
      </Text>
    </View>
  );
}
