import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { listMyServers, serverIconUrl } from "../../servers/api";
import { ServerAvatar } from "../../servers/components/ServerAvatar";
import type { ServerSummary } from "../../servers/types";
import { colors } from "../../../theme/colors";

interface MutualServersListProps {
  serverIds: string[];
  authToken: string | null;
}

export function MutualServersList({
  serverIds,
  authToken,
}: MutualServersListProps) {
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
      <Text style={styles.label}>SERVIDORES EN COMÚN</Text>
      {serverIds.length === 0 ? (
        <Text style={styles.empty}>Sin servidores en común.</Text>
      ) : (
        <View style={styles.list}>
          {mutualServers.map((server) => (
            <View key={server.id} style={styles.row}>
              <ServerAvatar
                name={server.name}
                uri={serverIconUrl(server.id)}
                authToken={authToken}
                size={32}
                borderRadius={12}
              />
              <Text style={styles.serverName} numberOfLines={1}>
                {server.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textSubtle,
    marginBottom: 6,
  },
  empty: {
    fontSize: 13,
    color: colors.textSubtle,
  },
  list: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 2,
  },
  serverName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
});
