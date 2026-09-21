const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// 1rem = 16px como en web, asi `p-4` mide lo mismo en las dos apps
// (NativeWind usa 14 por defecto).
module.exports = withNativewind(config, { inlineRem: 16 });
