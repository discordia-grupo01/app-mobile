import { requireOptionalNativeModule } from "expo";

type CallServiceModule = {
  start(title: string, text: string): boolean;
  stop(): void;
};

/**
 * Servicio en primer plano de la llamada (solo en el APK de Android). En Expo
 * Go y en iOS el modulo no existe y las funciones no hacen nada.
 */
const nativeModule =
  requireOptionalNativeModule<CallServiceModule>("CallService");

export const startCallService = (title: string, text: string): boolean =>
  nativeModule?.start(title, text) ?? false;

export const stopCallService = (): void => nativeModule?.stop();
