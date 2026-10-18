# Despliegue del panel en Cloudflare (estado real)

> Publicado el 18-oct-2026 con **Cloudflare Workers** (plan gratuito; permite uso comercial).
> Proyecto en Cloudflare: **`aviech`**, conectado al repo `Avismaelg/Aviech`, rama `main`.

## La dirección pública

**`https://aviech.avismael-eg.workers.dev`** ✅ (verificada: responde HTTP 200)

## Cómo se publica HOY (método confiable)

Desde este PC, en la carpeta del proyecto:

```powershell
npm run build
npx wrangler deploy
```

- La herramienta `wrangler` ya quedó autorizada con tu cuenta de Cloudflare
  (el permiso se guarda en este PC; no hay que volver a iniciar sesión).
- El archivo `wrangler.jsonc` (raíz del repo) le indica a Cloudflare qué publicar:
  la carpeta `dist/` como sitio estático con rutas de app (SPA).

## La compilación automática (pendiente de revisar)

- La idea original: cada `git push` a `main` dispara compilación en Cloudflare
  (Workers Builds). **Nunca alcanzó a publicar** (el sitio respondía error 1042).
- Ya se agregó al repo la pieza que faltaba (`wrangler.jsonc`); falta revisar en el
  panel → **Workers & Pages → aviech → pestaña Deployments** el estado y relanzar.
- Las llaves de Supabase para la compilación se leen del archivo **`.env.production`**
  del repositorio (solo contiene la clave *publishable*, pública por diseño).
  ⚠️ No hace falta ni conviene guardar secretos en Cloudflare ni en ese archivo.

## Problemas conocidos y solución

| Síntoma | Causa | Solución |
|---|---|---|
| El sitio carga pero dice "Falta conectar Supabase" | La compilación no incluyó las llaves | Verificar que `.env.production` esté en el repo y volver a publicar |
| El sitio muestra "error code: 1042" | No hay ningún Worker sirviendo esa dirección | Publicar con `npx wrangler deploy` (o relanzar el despliegue en el panel) |
| La compilación falla al instalar dependencias | Archivos dañados en el repo | Probar `npm ci && npm run build` en local y revisar el commit |
| Un despliegue no arranca solo | Trigger desactivado | Relanzar desde la pestaña Deployments, o hacer un push nuevo |
