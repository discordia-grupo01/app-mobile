import { Linking } from "react-native";

const APP_SCHEME = "discordia";

const INVITE_LINK =
  /(?:^[a-z][a-z0-9+.-]*:\/\/|\/--\/)invite\/([A-Za-z0-9_-]+)\/?(?:[?#]|$)/i;

/** El link propio de la app: abre "Unirse a un servidor" con el código cargado. */
export function appInviteLink(code: string): string {
  return `${APP_SCHEME}://invite/${code}`;
}

/** El código de `discordia://invite/<código>` (o `exp://…/--/invite/<código>` en Expo Go). */
export function getInviteCode(url: string): string | undefined {
  return INVITE_LINK.exec(url)?.[1];
}

export function subscribeToInviteLinks(
  onCode: (code: string) => void,
): () => void {
  const subscription = Linking.addEventListener("url", ({ url }) => {
    const code = getInviteCode(url);
    if (code) onCode(code);
  });
  return () => subscription.remove();
}
