import {
  PREMIUM_BRAND_COLORS,
  PREMIUM_SHOWCASE_ART_COPY as ART_COPY,
  type PremiumBenefitId,
  resolveImageUrl,
  type User,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Avatar } from "../../../../components/ui/Avatar";
import { cn } from "../../../../lib/cn";
import { env } from "../../../../lib/env";
import { useThemeColors } from "../../../../theme/theme-context";
import { PremiumPill } from "../shared/PremiumPill";

type ThemeColorKey = keyof ReturnType<typeof useThemeColors>;

const EMOJI_TILES: readonly { tile: string; icon: ThemeColorKey }[] = [
  { tile: "bg-accent", icon: "boostPaper" },
  { tile: "bg-info", icon: "boostInk" },
  { tile: "bg-sky", icon: "boostInk" },
];

const SERVER_TILES = ["bg-accent", "bg-info", "bg-sky"];

export type PremiumArtProfile = Pick<User, "name" | "avatar_url">;

interface PremiumShowcaseArtProps {
  benefit: PremiumBenefitId;
  profile: PremiumArtProfile | null;
}

export function PremiumShowcaseArt({
  benefit,
  profile,
}: PremiumShowcaseArtProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="h-24 flex-row items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-surface-sunken p-3"
    >
      <Art benefit={benefit} profile={profile} />
    </View>
  );
}

function Art({ benefit, profile }: PremiumShowcaseArtProps) {
  const colors = useThemeColors();
  const gold = { backgroundColor: PREMIUM_BRAND_COLORS.yellow };

  switch (benefit) {
    case "attachments":
      return (
        <>
          <View
            className="h-12.5 w-10.5 items-center justify-center rounded-lg"
            style={gold}
          >
            <Text className="text-[10px] font-bold text-boost-ink">
              {ART_COPY.attachmentKind}
            </Text>
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="text-[11px] font-semibold text-content">
              {ART_COPY.attachmentName}
            </Text>
            <View className="h-1.25 overflow-hidden rounded-sm bg-surface-input">
              <View className="h-full w-full" style={gold} />
            </View>
            <Text className="text-[10px] tabular-nums">
              <Text className="text-content-subtle line-through">
                {ART_COPY.attachmentBaseLimit}
              </Text>{" "}
              <Text
                className="font-bold"
                style={{ color: PREMIUM_BRAND_COLORS.yellow }}
              >
                {ART_COPY.attachmentLimit}
              </Text>
            </Text>
          </View>
        </>
      );
    case "animated":
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
          <View
            className="h-8.5 justify-center rounded-[10px] px-2.5"
            style={gold}
          >
            <Text className="text-xs font-bold text-boost-ink">
              {ART_COPY.animatedKind}
            </Text>
          </View>
        </>
      );
    case "global-emojis":
      return (
        <>
          <View className="flex-row">
            {SERVER_TILES.map((tile, index) => (
              <View
                key={tile}
                className={cn(
                  "h-9 w-9 rounded-xl border-2 border-surface-sunken",
                  index > 0 && "-ml-2.5",
                  tile,
                )}
              />
            ))}
          </View>
          <View className="shrink gap-1">
            <Text className="text-[11px] font-bold text-content">
              {ART_COPY.globalEmojisTitle}
            </Text>
            <Text className="text-[10px] text-content-muted">
              {ART_COPY.globalEmojisHint}
            </Text>
          </View>
        </>
      );
    case "badge":
      return (
        <>
          <Avatar
            name={profile?.name ?? ""}
            uri={resolveImageUrl(profile?.avatar_url, env.apiUrl)}
            size={44}
          />
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-1.5">
              {profile ? (
                <Text
                  numberOfLines={1}
                  className="shrink text-xs font-bold text-content"
                >
                  {profile.name}
                </Text>
              ) : (
                <View className="h-2 w-16 rounded-sm bg-line-strong" />
              )}
              <PremiumPill />
            </View>
            <Text className="text-[10px] font-semibold text-content-muted">
              {ART_COPY.profileLabel}
            </Text>
          </View>
        </>
      );
  }
}
