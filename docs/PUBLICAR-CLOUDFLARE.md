# Publicar el panel en Cloudflare Pages (guía paso a paso)

> Requisito: cuenta gratuita de Cloudflare. No hace falta tarjeta de crédito ni dominio propio.
> Coste: $0. El plan gratuito de Cloudflare permite uso comercial.

## 1. Crear cuenta

- Abre: https://dash.cloudflare.com/sign-up
- Correo + contraseña → **Create Account** → verifica el correo si te lo pide.

## 2. Conectar el repositorio de GitHub

- En el panel: menú lateral **Workers & Pages** → **Create / Crear** → pestaña **Pages**
  → **Connect to Git**.
- Autoriza a Cloudflare en GitHub y dale acceso al repositorio **Avismaelg/Aviech**.
- Selecciónalo → **Begin setup**.

## 3. Configuración del proyecto (valores exactos)

| Campo | Valor |
|---|---|
| Project name | `avitech-panel` |
| Production branch | `main` |
| Framework preset | **Vite** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (vacío / por defecto) |

### Variables de entorno (sección "Environment variables (advanced)")

| Nombre | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://ktvyhtbmokmrzeuibznv.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_UFmcdmDc2j75X8vBcYhWww_G6DGneAl` |
| `NODE_VERSION` | `24` |

(Marca Production y Preview si la interfaz lo permite.)

## 4. Publicar

- Botón **Save and Deploy** → esperar 1–3 minutos → estado **Success**.
- URL final: `https://avitech-panel.pages.dev` (o el nombre elegido).

## 5. Ajuste final en Supabase (después del primer deploy)

- Authentication → **URL Configuration** → **Site URL** = la URL de Cloudflare.
- (Opcional) **Redirect URLs** → añadir `https://<tu-proyecto>.pages.dev/**`.

## Notas

- Cada `git push` a `main` republica el sitio automáticamente.
- Las variables `VITE_*` son públicas por diseño (viajan dentro del sitio web);
  la seguridad de los datos la dan el login y las reglas RLS de Supabase.
- Si el build falla por versión de Node, cambiar `NODE_VERSION` a `22.12.0` y reintentar.
