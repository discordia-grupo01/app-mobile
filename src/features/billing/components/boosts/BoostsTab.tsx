import {
  BILLING_BOOSTS_COPY,
  BOOST_ACTION_COPY,
  BOOST_TIER_SUMMARIES,
  groupBoostsByServer,
  ownBoostsLabel,
  RETRY_LABEL,
  type ServerBoostGroup,
  serverBoostCount,
  serverBoostLevel,
  serverBoostsSummaryLabel,
  type ServerSummary,
} from "@discordia/client-shared";

import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../../components/ui/Avatar";
import { Button } from "../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { BoostLevelIcon } from "../../../boosts/components/BoostLevelIcon";
import { useOwnBoosts } from "../../../boosts/useOwnBoosts";
import { resolveServerIconUrl } from "../../../servers/api";
import { EmptyHistory } from "../history/EmptyHistory";
import { useServerDirectory } from "./useServerDirectory";

function HowBoostsWork({ onBuyPoints }: { onBuyPoints: () => void }) {
  return (
    <View className="rounded-2xl border border-line bg-surface-raised p-5">
      <Text className="font-display text-base font-bold text-content">
        {BILLING_BOOSTS_COPY.howTitle}
      </Text>
      <Text className="mt-1 text-sm leading-5 text-content-muted">
        {BILLING_BOOSTS_COPY.howDescription}
      </Text>
      <View className="mt-4 gap-2">
        {BOOST_TIER_SUMMARIES.map((tier) => (
          <View
            key={tier.level}
            className="flex-row items-center gap-3 rounded-xl bg-surface-input px-3 py-2.5"
          >
            <BoostLevelIcon level={tier.level} size={22} bare />
            <View className="flex-1">
              <Text className="font-display text-sm font-bold text-content">
                {tier.label}
              </Text>
              <Text className="text-xs text-content-muted">{tier.perks}</Text>
            </View>
          </View>
        ))}
      </View>
      <TouchableOpacity
        onPress={onBuyPoints}
        accessibilityRole="link"
        className="mt-4 self-start"
        hitSlop={8}
      >
        <Text className="text-sm font-semibold text-accent-strong">
          {BOOST_ACTION_COPY.buyPoints}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

interface BoostedServerRowProps {
  group: ServerBoostGroup;
  server: ServerSummary | undefined;
  onManage: (serverId: string) => void;
}

function BoostedServerRow({ group, server, onManage }: BoostedServerRowProps) {
  return (
    <View className="flex-row items-center gap-3 bg-surface-raised px-4 py-3">
      <Avatar
        name={server?.name ?? "?"}
        uri={server ? resolveServerIconUrl(server.icon_url) : null}
        size={40}
        borderRadius={12}
      />
      <View className="flex-1">
        <Text
          className="font-display text-sm font-bold text-content"
          numberOfLines={1}
        >
          {server?.name ?? BILLING_BOOSTS_COPY.unknownServer}
        </Text>
        <View className="mt-0.5 flex-row items-center gap-1.5">
          {server ? (
            <BoostLevelIcon
              level={serverBoostLevel(server)}
              size={14}
              bare
              tight
            />
          ) : null}
          <Text className="flex-1 text-xs text-content-subtle">
            {server
              ? serverBoostsSummaryLabel(
                  serverBoostLevel(server),
                  serverBoostCount(server),
                  group.boosts.length,
                )
              : ownBoostsLabel(group.boosts.length)}
          </Text>
        </View>
      </View>
      {server ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onManage(group.serverId)}
          accessibilityRole="button"
          className="rounded-xl bg-surface-input px-4 py-2"
        >
          <Text className="text-xs font-semibold text-content-muted">
            {BILLING_BOOSTS_COPY.manage}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

interface BoostsTabProps {
  onBuyPoints: () => void;
  onManageServer: (serverId: string) => void;
}

export function BoostsTab({ onBuyPoints, onManageServer }: BoostsTabProps) {
  const colors = useThemeColors();
  const own = useOwnBoosts();
  const servers = useServerDirectory();
  const groups =
    own.state.status === "ready" ? groupBoostsByServer(own.state.boosts) : [];

  return (
    <View className="gap-6">
      <HowBoostsWork onBuyPoints={onBuyPoints} />

      <View>
        <Text
          accessibilityRole="header"
          className="mb-3 font-display text-base font-bold text-content"
        >
          {BILLING_BOOSTS_COPY.yourBoostsTitle}
        </Text>
        {own.state.status === "error" ? (
          <View className="gap-3">
            <FormErrorBanner message={own.state.message} />
            <Button
              title={RETRY_LABEL}
              variant="secondary"
              onPress={own.reload}
            />
          </View>
        ) : own.state.status === "loading" || servers === null ? (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color={colors.textMuted} />
          </View>
        ) : groups.length === 0 ? (
          <EmptyHistory text={BILLING_BOOSTS_COPY.empty} />
        ) : (
          <View className="overflow-hidden rounded-2xl border border-line">
            {groups.map((group, index) => (
              <View
                key={group.serverId}
                className={cn(index > 0 && "border-t border-line")}
              >
                <BoostedServerRow
                  group={group}
                  server={servers.get(group.serverId)}
                  onManage={onManageServer}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
