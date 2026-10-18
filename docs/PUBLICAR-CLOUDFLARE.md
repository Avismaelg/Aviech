# Despliegue del panel en Cloudflare (estado real)

> Publicado el 18-oct-2026 con **Cloudflare Workers** (plan gratuito; permite uso comercial).
> Proyecto en Cloudflare: **`aviech`**, conectado al repo `Avismaelg/Aviech`, rama `main`.

## La dirección pública

**`https://aviech.avismael-eg.workers.dev`** ✅ (verificada: responde HTTP 200)

- El subdominio de la cuenta en Cloudflare es **`avismael-eg`**.
- ⚠️ `avitech.workers.dev` **no** es de este proyecto: es de otra empresa y cualquier
  dirección bajo ella responde `error code: 1042`. No confundirlas.

## La publicación es automática (verificado)

- Cada `git push` a `main` dispara compilación **y publicación automática** (Workers Builds).
- Verificado el 18-oct-2026: 5 pushes → 5 publicaciones automáticas, cada una en menos de 1 minuto.
- Historial visible en: panel de Cloudflare → **Workers & Pages → aviech → pestaña Deployments**.
- Las llaves de Supabase para la compilación se leen del archivo **`.env.production`**
  del repositorio (solo contiene la clave *publishable*, pública por diseño).
  ⚠️ No hace falta ni conviene guardar secretos en Cloudflare ni en ese archivo.

## Publicación manual (respaldo)

Por si algún día hace falta publicar sin esperar la compilación:

```powershell
npm run build
npx wrangler deploy
```

- `wrangler` quedó autorizado con tu cuenta de Cloudflare en este PC (la sesión se guarda).
- El archivo `wrangler.jsonc` (raíz del repo) indica qué publicar: la carpeta `dist/` como sitio SPA.

## Problemas conocidos y solución

| Síntoma | Causa | Solución |
|---|---|---|
| El sitio carga pero dice "Falta conectar Supabase" | La compilación no incluyó las llaves | Verificar que `.env.production` esté en el repo y volver a publicar |
| Un push no aparece publicado tras varios minutos | Compilación fallida | Ver logs en la pestaña Deployments; o publicar a mano con `npx wrangler deploy` |
| Aparece "error code: 1042" | Se está abriendo `avitech.workers.dev`, que es ajena | Usar siempre `aviech.avismael-eg.workers.dev` |
| La compilación falla al instalar dependencias | Archivos dañados en el repo | Probar `npm ci && npm run build` en local y revisar el commit |
