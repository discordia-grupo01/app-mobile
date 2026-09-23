import { Linking } from "react-native";

export function getConfirmationToken(url: string): string | undefined {
  try {
    return new URL(url).searchParams.get("token") ?? undefined;
  } catch {
    return undefined;
  }
}

export function subscribeToConfirmationLinks(
  onToken: (token: string) => void,
): () => void {
  const subscription = Linking.addEventListener("url", ({ url }) => {
    const token = getConfirmationToken(url);
    if (token) onToken(token);
  });
  return () => subscription.remove();
}
