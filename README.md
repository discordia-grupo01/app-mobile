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
| EXPO_PUBLIC_API_URL | http://localhost:8000 | URL base del Gateway (Kong) al que le pega la app. Debe empezar con `EXPO_PUBLIC_` para que Expo la incluya en el bundle del cliente. |

`.env.example` solo trae la estructura (sin valores sensibles). Los valores reales van en tu propio `.env`, que nunca se sube (ya esta en `.gitignore`).

## Estructura de carpetas

```
app-mobile/
├── App.tsx                    entrypoint: componente raiz de la app
├── index.ts                   registra App.tsx como root component (no editar)
├── app.json                   configuracion de Expo (nombre, icono, splash, etc.)
├── eslint.config.js           config de ESLint (eslint-config-expo)
├── src/
│   ├── components/
│   │   ├── auth/               componentes de UI especificos de autenticacion (LoginForm)
│   │   ├── icons/               iconos custom (ej. GoogleIcon)
│   │   └── ui/                   componentes de UI genericos y reutilizables (Button, TextField)
│   ├── features/
│   │   └── auth/                logica de negocio de autenticacion (archivos sueltos, sin subcarpetas)
│   │       ├── auth-context.tsx    contexto de React + hook useAuth (sesion, login, logout)
│   │       ├── service.ts           llamadas a la API de auth (login/logout)
│   │       ├── types.ts              tipos del dominio de auth
│   │       ├── validation.ts         validacion de formulario de login
│   │       └── validation.test.ts    tests de la validacion
│   ├── hooks/                  hooks de React reutilizables
│   ├── lib/
│   │   ├── api-client.ts      cliente HTTP hacia el Gateway (token via AsyncStorage, ApiError tipado)
│   │   ├── constants.ts       constantes de la app (ej. APP_NAME)
│   │   ├── env.ts              lectura centralizada de variables de entorno
│   │   └── storage.ts          helper unico de AsyncStorage para la sesion (token + usuario)
│   ├── screens/
│   │   ├── LoginScreen.tsx    pantalla de login
│   │   └── HomeScreen.tsx     pantalla post-login
│   └── theme/
│       ├── colors.ts           paleta de colores (alineada a web-client)
│       ├── spacing.ts          escala de espaciado y radios
│       ├── typography.ts       tamaños y pesos de fuente
│       └── index.ts             barrel de theme/
├── assets/                    iconos, splash screen y logos de Discordia
├── .github/
│   └── workflows/
│       └── ci.yml             format:check, lint, typecheck y test en cada PR/push a main
├── .githooks/
│   └── pre-commit             hook de prettier local
└── .env.example                estructura de variables de entorno (sin valores sensibles)
```

La carpeta `src/hooks/` viene vacia (`.gitkeep`) porque todavia no hay hooks custom. La estructura de `src/` sigue la misma convencion que `web-client` (feature-based: `features/<feature>/` con archivos sueltos, sin subcarpetas anidadas por tipo) para que el codigo se lea igual entre ambos clientes. Las carpetas `ios/` y `android/` no existen (son generadas por Expo solo si se hace un build nativo/prebuild) y estan en `.gitignore`.

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

- Las requests siempre van al Gateway (Kong), nunca directo a un microservicio (ADR-006).
- `EXPO_PUBLIC_API_URL` apunta a `http://localhost:8000` por default. Funciona tal cual solo en simulador iOS, que comparte la red del host. En emulador Android hay que usar `http://10.0.2.2:8000`, y en celular fisico con Expo Go, la IP de LAN de la compu (ej. `http://192.168.x.x:8000`).
- El cliente HTTP (`src/lib/api-client.ts`) sigue el mismo patron que `web-client` (fetch wrapper + `ApiError` tipado), pero usa `AsyncStorage` en vez de `localStorage` para guardar la sesion (React Native no tiene `localStorage`).
