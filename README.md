# app-mobile

Aplicación móvil de Discordia.

## Tabla de contenidos

- [Introducción](#introducción)
- [Pre-requisitos](#pre-requisitos)
- [Cómo correr](#cómo-correr)
- [Variables de entorno](#variables-de-entorno)
- [Comandos Docker](#comandos-docker)
- [Tests](#tests)
- [Más documentación](#más-documentación)

## Introducción

`app-mobile` es el cliente móvil de Discordia, para Android e iOS: registro e inicio de sesión (con email, con Google, con PIN y con segundo factor), servidores, canales de texto y de voz, mensajes directos, notificaciones push, perfil y Premium. Cubre las historias de usuario final del catálogo para el celular.

Está hecha con React Native y Expo (SDK 58), en TypeScript, con NativeWind para los estilos y Jest para los tests. La lógica que comparte con la web (tipos, textos y funciones puras) vive en el paquete [`client-shared`](https://github.com/discordia-grupo01/client-shared); acá queda lo que es propio del celular: las pantallas, los hooks y el acceso a la API.

Todos los pedidos van al gateway (Kong), nunca directo a un servicio. La sesión se guarda en el almacenamiento del teléfono. La llamada de voz corre dentro de una página de la web (`/voice-embed`) cargada en un WebView, salvo compartir pantalla, que solo existe en el APK de Android y abre una segunda conexión nativa a la sala.

La app se puede probar de dos formas: con **Expo Go** (la app de Expo, sin instalar nada propio) o como un **APK** de Android que se genera con EAS Build.

## Pre-requisitos

- **Node.js 22.13 o más nuevo** y **npm**, si querés correrla en tu máquina. El SDK 58 no funciona con Node 20.
- **Docker** y **Docker Compose** v2.24 o más nuevo, si preferís levantar el servidor de la app en un contenedor.
- **Expo Go para SDK 58** en el celular (la versión actual de App Store y Play Store). Si muestra "Project is incompatible with this version of Expo Go", la versión de Expo Go y la del SDK no coinciden.
- **Una cuenta de Expo** (gratis), con la misma sesión iniciada en Expo Go y en tu computadora (`npx expo login`).
- **El backend**, para que la app tenga a quién hablarle. Por defecto apunta al de producción. Para uno propio, lo más simple es el repositorio [`infrastructure`](https://github.com/discordia-grupo01/infrastructure).

## Cómo correr

### Para desarrollar

Es la forma más cómoda: el servidor de Expo corre en tu máquina, con recarga en caliente, y mostrás la app en el celular:

```bash
cp .env.example .env
npm install
npm start
```

Expo muestra un código QR. Escanealo con la cámara (iOS) o con Expo Go (Android) y la app se abre en el celular. El celular y la computadora tienen que estar en la misma red.

Si querés probar contra un backend levantado en tu máquina, el celular no puede usar `localhost`: poné en `EXPO_PUBLIC_API_URL` la dirección de tu computadora en la red local (por ejemplo `http://192.168.0.10:8000`).

También podés abrir la app en un emulador de Android (`npm run android`) o en el simulador de iOS (`npm run ios`).

### Con Docker Compose

Levanta el servidor de Expo (Metro) dentro de un contenedor, sin instalar Node en tu máquina:

```bash
docker compose up
```

La primera vez tarda, porque instala las dependencias. Para que el celular encuentre el servidor, decile en qué dirección está tu computadora en la red local, creando un `.env` con esa variable:

```bash
echo "PACKAGER_HOST=192.168.0.10" >> .env
docker compose up
```

Cuando termine de arrancar, comprobá que esté vivo:

```bash
curl http://localhost:8081/status
```

Tiene que responder `packager-status:running`. Después abrí la app en el celular con la dirección `exp://<tu IP>:8081` desde Expo Go. Con un emulador o el simulador es más simple usar `npm start`. Este compose levanta solo el servidor de la app: el backend no está incluido.

### APK de Android

Para generar un APK con EAS Build:

```bash
eas build -p android --profile preview
```

Las variables `EXPO_PUBLIC_*` del APK salen de `eas.json`, no de `.env`, porque EAS no sube los archivos ignorados por git.

## Variables de entorno

Se leen de un archivo `.env`. El archivo [`.env.example`](.env.example) trae los valores por defecto. Las variables `EXPO_PUBLIC_` quedan incluidas en la app: no pongas secretos ahí.

| Variable | Default | Descripción |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `https://discordia-g1.duckdns.org` | URL del gateway (Kong). Desde un celular tiene que ser una dirección que el celular alcance. |
| `EXPO_PUBLIC_WEB_URL` | la web en Vercel | URL de `web-client`. Arma los links de invitación y carga la página de voz. Tiene que ser `https` (o `localhost`): sin eso el WebView no da acceso al micrófono. |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | vacío | Client ID de Google (tipo "Web application"). Es el mismo que usan `identify-service` y `web-client`. |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | vacío | Client ID de Android, solo para un build nativo con identificador propio. |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | vacío | Client ID de iOS, solo para un build nativo con identificador propio. |

Variables que usa solo `docker-compose.yml`:

| Variable | Default | Descripción |
|---|---|---|
| `PACKAGER_HOST` | `localhost` | Dirección de tu computadora en la red local, que el celular usa para encontrar el servidor de Expo. |
| `METRO_PORT` | `8081` | Puerto del servidor de Expo en tu máquina. |

## Comandos Docker

Todos desde la raíz del repositorio.

| Qué querés hacer | Comando |
|---|---|
| Levantar el servidor de Expo | `docker compose up` |
| Levantar en segundo plano | `docker compose up -d` |
| Ver los logs | `docker compose logs -f metro` |
| Ver si está listo | `curl http://localhost:8081/status` |
| Ver qué está corriendo | `docker compose ps` |
| Bajar todo | `docker compose down` |
| Bajar todo y borrar las dependencias instaladas | `docker compose down -v` |

## Tests

```bash
npm test
```

Corre los tests con Jest (`jest-expo`). Para revisar el resto del código:

| Qué | Comando |
|---|---|
| Linter (ESLint) | `npm run lint` |
| Tipos (TypeScript) | `npm run typecheck` |
| Formato | `npm run format:check` (y `npm run format` para arreglarlo) |

El CI corre todo eso en cada pull request. El repositorio se formatea con Prettier; activá el hook una vez por clon:

```bash
git config core.hooksPath .githooks
```

## Más documentación

- [`client-shared`](https://github.com/discordia-grupo01/client-shared): los tipos, textos y funciones que comparten la app, la web y el backoffice.
- [`infrastructure`](https://github.com/discordia-grupo01/infrastructure): cómo levantar todo el sistema para probar la app conectada de verdad.
