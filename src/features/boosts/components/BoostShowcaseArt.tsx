import {
  BOOST_SHOWCASE_ART_COPY as ART_COPY,
  type BoostPerk,
  type ServerSummary,
  vanitySlug,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Avatar } from "../../../components/ui/Avatar";
import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import { resolveServerIconUrl } from "../../servers/api";
import { BoostLevelIcon } from "./BoostLevelIcon";

type ThemeColorKey = keyof ReturnType<typeof useThemeColors>;

const EMOJI_TILES: readonly { tile: string; icon: ThemeColorKey }[] = [
  { tile: "bg-accent", icon: "boostPaper" },
  { tile: "bg-info", icon: "boostInk" },
  { tile: "bg-sky", icon: "boostInk" },
  { tile: "bg-boost-paper", icon: "accent" },
];

interface BoostShowcaseArtProps {
  perk: BoostPerk;
  server: ServerSummary;
}

export function BoostShowcaseArt({ perk, server }: BoostShowcaseArtProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-24 flex-row items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-surface-sunken p-3"
    >
      <Art perk={perk} server={server} />
    </View>
  );
}

function Art({ perk, server }: BoostShowcaseArtProps) {
  const colors = useThemeColors();
  const iconUri = resolveServerIconUrl(server.icon_url);

  switch (perk) {
    case "extra_emoji_slots":
      return (
        <>
          {EMOJI_TILES.map(({ tile, icon }) => (
            <View
              key={tile}
              className={cn(
                "h-8.5 w-8.5 items-center justify-center rounded-[10px]",
                tile,
              )}
            >
              <Feather name="smile" size={16} color={colors[icon]} />
            </View>
          ))}
          <View className="h-8.5 justify-center rounded-[10px] bg-boost-yellow px-2.5">
            <Text className="text-xs font-bold text-boost-ink">
              {ART_COPY.extraEmojiSlots}
            </Text>
          </View>
        </>
      );
    case "animated_icon":
      return (
        <>
          <View className="items-center gap-1.5">
            <View className="h-6 w-6 rounded-lg bg-surface-input" />
            <View className="rounded-[14px] border-2 border-boost-yellow p-0.5">
              <Avatar
                name={server.name}
                uri={iconUri}
                size={32}
                borderRadius={10}
              />
            </View>
            <View className="h-6 w-6 rounded-lg bg-surface-input" />
          </View>
          <View className="gap-1">
            <Text className="text-[11px] font-bold text-content">
              {ART_COPY.serverList}
            </Text>
            <Text className="text-[10px] text-content-muted">
              {ART_COPY.animatedIconHint}
            </Text>
          </View>
        </>
      );
    case "custom_banner":
      return (
        <View className="h-18 flex-1 overflow-hidden rounded-[10px] border border-line">
          <View className="h-8.5 flex-row items-end gap-2 bg-accent px-2.5 pb-1.5">
            <Text
              numberOfLines={1}
              className="flex-1 text-[11px] font-bold text-boost-paper"
            >
              {server.name}
            </Text>
            <View className="flex-row items-end gap-0.75">
              <View className="h-3 w-2 rounded-sm bg-info" />
              <View className="h-4.5 w-2 rounded-sm bg-sky" />
              <View className="h-2 w-2 rounded-sm bg-boost-yellow" />
            </View>
          </View>
          <View className="flex-1 gap-1.5 bg-surface-raised px-2.5 py-2">
            <View className="h-1.25 w-3/5 rounded-sm bg-line-strong" />
            <View className="h-1.25 w-2/5 rounded-sm bg-line" />
          </View>
        </View>
      );
    case "larger_attachments":
      return (
        <>
          <View className="h-12.5 w-10.5 items-center justify-center rounded-lg bg-info">
            <Text className="text-[10px] font-bold text-boost-ink">
              {ART_COPY.attachmentKind}
            </Text>
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="text-[11px] font-semibold text-content">
              {ART_COPY.attachmentName}
            </Text>
            <View className="h-1.25 overflow-hidden rounded-sm bg-surface-input">
              <View className="h-full w-4/5 bg-info" />
            </View>
            <Text className="text-[10px] text-content-muted">
              {ART_COPY.attachmentUsed}{" "}
              <Text className="font-bold text-content">
                {ART_COPY.attachmentLimit}
              </Text>
            </Text>
          </View>
        </>
      );
    case "vanity_url":
      return (
        <View className="flex-1 gap-1.5">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-content-subtle">
            {ART_COPY.invite}
          </Text>
          <View className="flex-row items-center gap-2 rounded-[10px] border border-line-strong bg-surface-raised px-2.5 py-2">
            <Feather name="link-2" size={14} color={colors.textMuted} />
            <Text
              numberOfLines={1}
              className="flex-1 text-xs text-content-muted"
            >
              {ART_COPY.invitePath}
              <Text className="font-bold text-boost-yellow">
                {vanitySlug(server.name)}
              </Text>
            </Text>
          </View>
        </View>
      );
    case "boosted_badge":
      return (
        <>
          <Avatar name={server.name} uri={iconUri} size={44} />
          <View className="flex-1 gap-1.5">
            <Text numberOfLines={1} className="text-xs font-bold text-content">
              {server.name}
            </Text>
            <View className="flex-row items-center gap-1.5 self-start rounded-full bg-boost-paper px-2 py-0.75">
              <BoostLevelIcon level={3} size={13} bare />
              <Text className="text-[10px] font-bold text-boost-ink">
                {ART_COPY.badge}
              </Text>
            </View>
          </View>
        </>
      );
  }
}
