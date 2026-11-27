import { Linking } from "react-native";

// Acepta:
//   discordia://reset-password?token=...   (esquema propio)
//   exp://host/--/reset-password?token=... (Expo Go)
// El link del mail es https y apunta a /app-link/reset-password: esa pagina de
// la web es la que abre la app con discordia://reset-password.
const RESET_PASSWORD_LINK =
  /(?:^[a-z][a-z0-9+.-]*:\/\/|\/--\/)reset-password\/?(?:[?#]|$)/i;
const TOKEN_PARAM = /[?&]token=([^&#]+)/;

export function getResetPasswordToken(url: string): string | undefined {
  if (!RESET_PASSWORD_LINK.test(url)) return undefined;
  const match = TOKEN_PARAM.exec(url);
  if (!match?.[1]) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return undefined;
  }
}

export function subscribeToResetPasswordLinks(
  onToken: (token: string) => void,
): () => void {
  const subscription = Linking.addEventListener("url", ({ url }) => {
    const token = getResetPasswordToken(url);
    if (token) onToken(token);
  });
  return () => subscription.remove();
}
