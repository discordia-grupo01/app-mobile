import { getInitial } from "@discordia/client-shared";

import { Image, Text, View } from "react-native";

import { useResolvedImageUri } from "../../../lib/use-resolved-image-uri";

interface ServerAvatarProps {
  name: string;
  uri?: string | null;
  authToken?: string | null;
  size?: number;
  borderRadius?: number;
}

export function ServerAvatar({
  name,
  uri,
  authToken,
  size = 48,
  borderRadius,
}: ServerAvatarProps) {
  const radius = borderRadius ?? size / 2;
  const { resolvedUri, failed, markFailed } = useResolvedImageUri(
    uri,
    authToken,
    "server-icons",
  );

  if (resolvedUri && !failed) {
    return (
      <Image
        source={{ uri: resolvedUri }}
        onError={markFailed}
        className="bg-surface-raised"
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  const initial = getInitial(name) ?? "?";

  return (
    <View
      className="items-center justify-center bg-accent"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Text className="text-white font-bold" style={{ fontSize: size * 0.42 }}>
        {initial}
      </Text>
    </View>
  );
}
