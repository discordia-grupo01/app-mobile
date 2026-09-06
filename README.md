# discordia-app-mobile

Cliente mobile de Discordia (React Native + Expo).

## Stack

- Lenguaje: TypeScript
- Framework: React Native (Expo, SDK 57)
- Testing: Jest (`jest-expo`)

## Setup local

```bash
cp .env.example .env
npm install
npm start
```

Desde ahí, Expo CLI muestra un QR para abrir la app en el celular (con Expo Go) o las opciones para emulador Android / simulador iOS.

## Variables de entorno

| Variable            | Default               | Descripcion                                                                                                                    |
| ------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| EXPO_PUBLIC_API_URL | http://localhost:3000 | URL base del Gateway al que le pega la app. Debe empezar con `EXPO_PUBLIC_` para que Expo la incluya en el bundle del cliente. |

`.env.example` solo trae la estructura (sin valores sensibles). Los valores reales van en tu propio `.env`, que nunca se sube (ya esta en `.gitignore`).

## Estructura de carpetas

```
app-mobile/
├── App.tsx                    entrypoint: componente raiz de la app
├── index.ts                   registra App.tsx como root component (no editar)
├── app.json                   configuracion de Expo (nombre, icono, splash, etc.)
├── eslint.config.js           config de ESLint (eslint-config-expo)
├── src/
│   ├── components/             componentes de UI reutilizables
│   ├── hooks/                  hooks de React reutilizables
│   └── lib/
│       ├── api-client.ts      cliente HTTP hacia el Gateway (token via AsyncStorage)
│       ├── constants.ts       constantes de la app (ej. APP_NAME)
│       └── env.ts              lectura centralizada de variables de entorno
├── assets/                    iconos y splash screen
├── .github/
│   └── workflows/
│       └── ci.yml             format:check, lint, typecheck y test en cada PR/push a main
├── .githooks/
│   └── pre-commit             hook de prettier local
└── .env.example                estructura de variables de entorno (sin valores sensibles)
```

Las carpetas `src/components/` y `src/hooks/` vienen vacias (`.gitkeep`) porque el codigo de negocio todavia no existe en el template. Las carpetas `ios/` y `android/` no existen (son generadas por Expo solo si se hace un build nativo/prebuild) y estan en `.gitignore`.

## Comandos

- `npm start` - levanta el bundler de Expo (dev server).
- `npm run android` / `npm run ios` / `npm run web` - abre la app en esa plataforma.
- `npm run lint` - corre ESLint (`eslint-config-expo`).
- `npm run format` / `npm run format:check` - formatea o chequea el formato con Prettier.
- `npm run typecheck` - chequea tipos con `tsc --noEmit`.
- `npm run test` - corre los tests con Jest.

## Tests

```bash
npm run test
```

## Formateo automatico

Este repo se autoformatea con Prettier en cada commit. Activalo una vez por clone:

```bash
git config core.hooksPath .githooks
```

Si usan VS Code con la extension oficial de Prettier, tambien formatea al guardar (ya configurado en .vscode/settings.json).

El CI corre `npm run format:check` como red de seguridad (falla si encuentra archivos sin formatear), por si alguien clono sin activar el hook.

## Notas

- Usa Expo (no React Native CLI bare) para que el CI no dependa de Xcode/Android SDK y para poder buildear en la nube con EAS mas adelante.
- El cliente HTTP (`src/lib/api-client.ts`) sigue el mismo patron que `front-template`, pero usa `AsyncStorage` en vez de `localStorage` para guardar el token (React Native no tiene `localStorage`).
