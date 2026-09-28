import { type ServerSummary } from "@discordia/client-shared";

import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { listMyServers, resolveServerIconUrl } from "../../servers/api";
import { ServerAvatar } from "../../servers/components/ServerAvatar";

interface MutualServersListProps {
  serverIds: string[];
}

export function MutualServersList({ serverIds }: MutualServersListProps) {
  const [servers, setServers] = useState<ServerSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMyServers().then((result) => {
      if (!cancelled && result.ok) setServers(result.servers);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const mutualServers = (servers ?? []).filter((server) =>
    serverIds.includes(server.id),
  );

  return (
    <View>
      <Text className="text-[11px] font-bold tracking-[1.2px] text-content-subtle mb-1.5">
        SERVIDORES EN COMÚN
      </Text>
      {serverIds.length === 0 ? (
        <Text className="text-[13px] text-content-subtle">
          Sin servidores en común.
        </Text>
      ) : (
        <View className="gap-1.5">
          {mutualServers.map((server) => (
            <View
              key={server.id}
              className="flex-row items-center gap-2.5 py-0.5"
            >
              <ServerAvatar
                name={server.name}
                uri={resolveServerIconUrl(server.icon_url)}
                size={32}
                borderRadius={12}
              />
              <Text
                className="flex-1 text-[13px] font-semibold text-content-muted"
                numberOfLines={1}
              >
                {server.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
