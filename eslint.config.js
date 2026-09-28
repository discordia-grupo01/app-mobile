// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Los colores salen del tema (NativeWind o useThemeColors), nunca de un
    // objeto estatico: eso rompe el cambio de tema.
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/theme/colors", "./src/theme/colors"],
              message:
                "Usar clases de NativeWind (bg-surface, text-content...) o useThemeColors().",
            },
          ],
        },
      ],
    },
  },
]);
