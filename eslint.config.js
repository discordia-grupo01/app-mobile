// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Migracion a NativeWind: cada warning es un archivo pendiente.
    // Pasar a "error" (y borrar theme/colors.ts) cuando no quede ninguno.
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["**/theme/colors"],
              message:
                "Usar clases de NativeWind (bg-surface, text-content...) o useThemeColors().",
            },
          ],
        },
      ],
    },
  },
]);
