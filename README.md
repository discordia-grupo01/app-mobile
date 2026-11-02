# discordia-app-mobile

Cliente mobile de Discordia (React Native + Expo).

## Stack

- Lenguaje: TypeScript
- Framework: React Native 0.88 (Expo, SDK 58)
- Testing: Jest (`jest-expo`)

## Requisitos

- **Node.js 22.13 o más nuevo** (SDK 58 no funciona con Node 20). Con nvm alcanza con `nvm install && nvm use`: toma la versión de `.nvmrc`.
- **Expo Go para SDK 58** en el celular, que es la versión actual de App Store y Play Store. Si Expo Go muestra "Project is incompatible with this version of Expo Go", la versión de Expo Go y el SDK del proyecto no coinciden.

## Setup local

```bash
nvm use
cp .env.example .env
npm install
npm start
```

Si venías de SDK 57 o de Node 20, reinstalá las dependencias de cero: `rm -rf node_modules && npm install`.

Desde ahi, Expo CLI muestra un QR para abrir la app en el celular (con Expo Go) o las opciones para emulador Android / simulador iOS.

## Conectar con el backend real (Expo Go, Android y iOS)

Pasos para levantar todo el backend y probar app-mobile conectada de verdad, desde un celular con Expo Go.

**Requisito previo:** tener los repos `infrastructure`, `identify-service`, `servers` y `gateway` clonados. `infrastructure` levanta todo lo demás.

1. **Levantar el backend:**

   ```bash
   cd infrastructure
   cp .env.example .env
   docker compose up --build
   ```

   Esperar a que las migraciones corran y los servicios queden arriba (logs de `identity`, `servers` y `gateway` sin errores).

2. **Instalar Expo Go en el celular** (App Store en iOS, Play Store en Android; tiene que ser la versión para SDK 58) y crear o loguearse con una cuenta de Expo (gratis).

3. **Loguearse con esa misma cuenta en la compu**, dentro de `app-mobile`:

   ```bash
   npx expo login
   ```

   Expo Go pide estar logueado con la misma cuenta en ambos lados para poder conectar.

4. **Levantar app-mobile:**

   ```bash
   cd app-mobile
   cp .env.example .env
   npm install
   npm start
   ```

5. **Escanear el QR** que muestra la terminal (con la app Camara en iOS, o con el lector de Expo Go en Android). El celular tiene que estar conectado a la **misma red WiFi** que la compu donde corre Docker.

   - En iOS, la primera vez puede aparecer un permiso de "Red Local" (Local Network) — hay que aceptarlo, si no la app no va a poder llegar ni al bundler ni al backend.
   - Si la red tiene "client isolation" (comun en WiFi de facultades/eventos, que aisla dispositivos entre si) o hay un firewall bloqueando el puerto 8000 en la compu, la conexion va a fallar aunque esten en la misma red.

## Variables de entorno

| Variable            | Default | Descripcion                                                                                                                           |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| EXPO_PUBLIC_API_URL | (vacio) | URL base del Gateway (Kong) al que le pega la app. Debe empezar con `EXPO_PUBLIC_` para que Expo la incluya en el bundle del cliente. |

**Por qué `EXPO_PUBLIC_API_URL` queda vacía por default:** si tiene un valor, ese valor se usa tal cual (útil para apuntar a un backend hosteado más adelante). Si está vacía, `src/lib/env.ts` detecta sola la IP correcta usando `Constants.expoConfig.hostUri` de Expo — la misma IP que Expo Go ya usó para conectarse al bundler al escanear el QR — y arma la URL del backend a partir de esa IP en el puerto 8000. Esto evita tener que hardcodear y actualizar la IP a mano cada vez que alguien del equipo prueba desde otra red (localhost no sirve desde un celular; en emulador Android hace falta `10.0.2.2`; en celular fisico hace falta la IP de LAN de la compu; con auto-deteccion, ninguno de esos casos requiere tocar el `.env`).

Este mecanismo solo funciona corriendo `expo start` en modo LAN (el default, sin `--tunnel`). Si mas adelante se hostea el backend, ahí sí conviene setear `EXPO_PUBLIC_API_URL` explicitamente a esa URL publica.

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
│   │   ├── ui/                   componentes de UI genericos y reutilizables (Button, TextField)
│   │   ├── icons/                iconos custom (ej. GoogleIcon)
│   │   └── <feature>/            componentes propios de una feature (ej. auth: LoginForm)
│   ├── features/                 codigo agrupado por dominio (auth, ...)
│   │   └── <feature>/            types, validacion, service y contexto/hooks de esa feature (archivos sueltos, sin subcarpetas)
│   ├── hooks/                  hooks de React reutilizables entre features
│   ├── lib/
│   │   ├── api-client.ts      cliente HTTP hacia el Gateway (token via AsyncStorage, ApiError tipado)
│   │   ├── constants.ts       constantes de la app (ej. APP_NAME)
│   │   ├── env.ts              lectura centralizada de variables de entorno (incluye auto-deteccion de IP)
│   │   └── storage.ts          helper unico de AsyncStorage para la sesion (token + usuario)
│   ├── screens/                pantallas de la app (una por flujo)
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

`components/` y `features/` crecen con cada feature: una carpeta bajo `features/<feature>/` y sus componentes bajo `components/<feature>/`.

La carpeta `src/hooks/` viene vacia (`.gitkeep`) porque todavia no hay hooks custom. Las carpetas `ios/` y `android/` no existen (son generadas por Expo solo si se hace un build nativo/prebuild) y estan en `.gitignore`.

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

## APK de Android (EAS Build) y compartir pantalla

La app corre en Expo Go (la VM) y tambien como APK generado con EAS Build:

```bash
eas build -p android --profile preview
```

Las `EXPO_PUBLIC_*` del APK salen de `eas.json`, no de `.env` (EAS no sube archivos ignorados por git).

Compartir pantalla solo existe en el APK de Android: la llamada corre en un WebView que no puede capturar la pantalla, asi que el APK abre una segunda conexion nativa a la sala con `@livekit/react-native`, con la identidad `<id>:screen`, que solo publica la pantalla (ver `src/features/voice/screen-share/`). En Expo Go esos modulos nativos no existen: el boton no aparece y la llamada anda igual que siempre. Por eso LiveKit nativo nunca se importa arriba de un archivo, se carga con `loadLiveKitNative()` recien al compartir. Cualquier cambio en dependencias nativas o en los plugins de `app.json` necesita un build nuevo del APK.

## Notas

- Las requests siempre van al Gateway (Kong), nunca directo a un microservicio (ADR-006).
- Ver la seccion "Conectar con el backend real" para el paso a paso completo de como levantar el backend y probar app-mobile con Expo Go. La deteccion de la URL del backend es automatica.
- `metro.config.js` hace que `expo-asset` importe el `react-native` original en vez del shim de NativeWind (`react-native-css`), porque ese shim no exporta `AssetRegistry` en RN 0.88. Sin esa excepción la app falla con `Cannot read property 'getAssetByID' of undefined`. Se puede sacar cuando `react-native-css` lo exporte.
- El cliente HTTP (`src/lib/api-client.ts`) sigue el mismo patron que `web-client` (fetch wrapper + `ApiError` tipado), pero usa `AsyncStorage` en vez de `localStorage` para guardar la sesion (React Native no tiene `localStorage`).
