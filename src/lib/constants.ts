export const APP_NAME = "Discordia";

/**
 * El tema claro solo se ofrece en desarrollo mientras dure la migracion a
 * NativeWind: las pantallas sin migrar siguen oscuras y la app quedaria
 * mezclada. Pasar a `true` cuando no quede ningun import de `theme/colors`.
 */
export const LIGHT_THEME_ENABLED = __DEV__;
