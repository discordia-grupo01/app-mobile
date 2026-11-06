import { Linking } from "react-native";

const CONFIRM_EMAIL_LINK =
  /(?:^[a-z][a-z0-9+.-]*:\/\/|\/--\/)confirm-email\/?(?:[?#]|$)/i;
const TOKEN_PARAM = /[?&]token=([^&#]+)/;

export function getConfirmationToken(url: string): string | undefined {
  if (!CONFIRM_EMAIL_LINK.test(url)) return undefined;
  const match = TOKEN_PARAM.exec(url);
  if (!match?.[1]) return undefined;
  try {
    return decodeURIComponent(match[1]);
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
