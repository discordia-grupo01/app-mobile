import { Image, View, type StyleProp, type ViewStyle } from "react-native";

import { useResolvedImageUri } from "../../../lib/use-resolved-image-uri";

interface ServerBannerProps {
  uri?: string | null;
  authToken?: string | null;
  height: number;
  style?: StyleProp<ViewStyle>;
}

export function ServerBanner({
  uri,
  authToken,
  height,
  style,
}: ServerBannerProps) {
  const { resolvedUri, failed, markFailed } = useResolvedImageUri(
    uri,
    authToken,
    "server-banners",
  );

  if (!uri) return null;
  if (failed) return null;

  if (!resolvedUri) {
    return <View className="bg-surface-raised" style={[{ height }, style]} />;
  }

  return (
    <Image
      source={{ uri: resolvedUri }}
      onError={markFailed}
      resizeMode="cover"
      className="bg-surface-raised"
      style={[{ width: "100%", height }, style]}
    />
  );
}
