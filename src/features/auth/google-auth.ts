import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import type { AuthSessionResult } from "expo-auth-session";

// Requerido una sola vez a nivel de modulo (patron estandar de
// expo-auth-session): cierra la pestaña/tab del navegador auxiliar y
// resuelve la promise de `promptAsync()` cuando Google redirige de vuelta
// a la app despues del login.
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/**
 * Hook compartido entre LoginForm y RegisterForm para el boton
 * "Continuar con Google".
 *
 * Solo configuramos `webClientId` porque el proyecto todavia corre en Expo
 * Go / managed workflow sin `bundleIdentifier`/`package` en app.json (no
 * hay prebuild ni dev client), asi que no existen Client IDs nativos
 * (iOS/Android) para pedirle a Google Cloud Console todavia.
 *
 * Ademas de `webClientId`, pasamos el mismo valor como `clientId` (fallback
 * generico): la implementacion de `Google.useAuthRequest` en
 * expo-auth-session ~57 elige el client id segun la plataforma
 * (`iosClientId` en iOS, `androidClientId` en Android, `webClientId` en
 * web) y si el que corresponde a la plataforma actual no esta definido,
 * *no* cae de nuevo en `webClientId`: tira una excepcion sincrona
 * ("Client Id property `androidClientId`/`iosClientId` must be defined...")
 * apenas se llama el hook. Sin este fallback, la app crashearia al
 * renderizar LoginForm/RegisterForm en un celular real (Expo Go en iOS o
 * Android), rompiendo tambien el login con email+contraseña que esta al
 * lado (CA3). Con `clientId` seteado, esa misma libreria cae en el a modo
 * de fallback generico cuando no hay `iosClientId`/`androidClientId`.
 *
 * `responseType: "id_token"` es lo que le pide a Google el ID token (JWT)
 * directamente en la respuesta, en vez del flujo de authorization code
 * (que requiere client secret, algo que nunca debe vivir en el cliente).
 * Los scopes minimos (`openid`, `.../userinfo.email`, `.../userinfo.profile`)
 * ya los agrega el provider de Google automaticamente.
 *
 * `redirectUri`: Google rechaza (Error 400: invalid_request) cualquier
 * redirect_uri que no sea https:// (o http://localhost) para un Client ID
 * tipo "Web application" -- y el default que arma expo-auth-session en Expo
 * Go es un esquema exp://<host>:8081/--/redirect, que Google ni siquiera
 * intenta procesar. Por eso pasamos una pagina "de rebote" HTTPS propia
 * (servida por identify-service, ver /oauth/mobile-callback) como
 * redirectUri: Google vuelve ahi, y esa pagina -- ya del lado del navegador
 * del celular, no de Google -- rearma el salto final al exp://... real. El
 * exp:// real se calcula en runtime con `makeRedirectUri`, asi que sigue
 * funcionando aunque cambie la IP publica de la VM de mobile mas adelante.
 */
export function useGoogleAuthRequest(): [
  ReturnType<typeof Google.useAuthRequest>[0],
  AuthSessionResult | null,
  () => Promise<AuthSessionResult>,
] {
  const expoRedirect = AuthSession.makeRedirectUri({ path: "redirect" });
  const redirectUri =
    "https://discordia-g1.duckdns.org/oauth/mobile-callback?app_redirect=" +
    encodeURIComponent(expoRedirect);

  return Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    clientId: GOOGLE_WEB_CLIENT_ID,
    responseType: "id_token",
    redirectUri,
  });
}

/**
 * Extrae el ID token de la respuesta de `promptAsync()`/`response`.
 *
 * En expo-auth-session ~57, con `responseType: "id_token"`, Google
 * devuelve el JWT en `response.params.id_token` (asi lo documenta el propio
 * codigo fuente de `expo-auth-session/providers/google`: "The id token can
 * be retrieved with `response.params.id_token`"). El campo
 * `response.authentication` (tipo `TokenResponse | null`) solo se completa
 * cuando la respuesta trae un `access_token` (flujo de code exchange), que
 * no es nuestro caso, asi que queda `null` y no lo usamos.
 */
export function extractGoogleIdToken(
  response: AuthSessionResult | null,
): string | null {
  if (!response || response.type !== "success") return null;
  return response.params?.id_token ?? null;
}
