import Constants, { ExecutionEnvironment } from "expo-constants";
import { NativeModules, Platform } from "react-native";

/**
 * Compartir pantalla necesita el SDK nativo de LiveKit, que solo viene en el
 * APK (EAS Build). En Expo Go (la VM) esos modulos no existen: ahi el boton no
 * se muestra y la llamada sigue andando igual, por el WebView.
 *
 * iOS queda afuera: necesita una Broadcast Upload Extension y cuenta paga de
 * Apple Developer.
 */
export const isNativeScreenShareAvailable =
  Platform.OS === "android" &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient &&
  NativeModules.WebRTCModule != null &&
  NativeModules.LivekitReactNativeModule != null;

type LiveKitClient = typeof import("livekit-client");

let liveKit: LiveKitClient | null = null;

/**
 * Carga LiveKit nativo recien cuando se va a usar. No puede ser un `import`
 * arriba del archivo: en Expo Go cargar el modulo ya rompe la app.
 */
export function loadLiveKitNative(): LiveKitClient {
  if (liveKit) return liveKit;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { registerGlobals } = require("@livekit/react-native");
  registerGlobals();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  liveKit = require("livekit-client") as LiveKitClient;
  return liveKit;
}
