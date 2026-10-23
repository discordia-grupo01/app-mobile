const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// 1rem = 16px como en web, asi `p-4` mide lo mismo en las dos apps
// (NativeWind usa 14 por defecto).
const nativewindConfig = withNativewind(config, { inlineRem: 16 });

// react-native-css (lo usa NativeWind) redirige todo `import ... from "react-native"`
// a un shim con una lista fija de exports, y esa lista no incluye `AssetRegistry`,
// que aparecio en RN 0.88. expo-asset 58 lo importa de ahi, recibe `undefined` y
// rompe con "Cannot read property 'getAssetByID' of undefined" al cargar fuentes e
// imagenes. Estos paquetes no usan className, asi que les damos el react-native real.
// Sacar cuando react-native-css exporte AssetRegistry.
const PACKAGES_NEEDING_REAL_REACT_NATIVE = ["expo-asset"];

const isFromPackageNeedingRealReactNative = (originModulePath) =>
  PACKAGES_NEEDING_REAL_REACT_NATIVE.some((packageName) =>
    originModulePath.includes(
      `${path.sep}node_modules${path.sep}${packageName}${path.sep}`,
    ),
  );

// rn-emoji-keyboard usa InteractionManager, que RN 0.88 saco del core. Le damos un
// react-native con un polyfill (ver src/lib/react-native-with-interaction-manager.js).
const INTERACTION_MANAGER_SHIM = path.resolve(
  __dirname,
  "src/lib/react-native-with-interaction-manager.js",
);

const isFromEmojiKeyboard = (originModulePath) =>
  originModulePath.includes(
    `${path.sep}node_modules${path.sep}rn-emoji-keyboard${path.sep}`,
  );

const nativewindResolveRequest = nativewindConfig.resolver.resolveRequest;

module.exports = {
  ...nativewindConfig,
  resolver: {
    ...nativewindConfig.resolver,
    resolveRequest: (context, moduleName, platform) => {
      if (
        moduleName === "react-native" &&
        isFromEmojiKeyboard(context.originModulePath)
      ) {
        return { type: "sourceFile", filePath: INTERACTION_MANAGER_SHIM };
      }
      if (
        moduleName === "react-native" &&
        isFromPackageNeedingRealReactNative(context.originModulePath)
      ) {
        return context.resolveRequest(context, moduleName, platform);
      }
      return nativewindResolveRequest(context, moduleName, platform);
    },
  },
};
