# Estado actual — dónde nos quedamos

> Última actualización: 18-oct-2026

## ✅ ¡El panel está PUBLICADO en internet!

- Publicado con **Cloudflare** (plan gratuito), como proyecto tipo **Worker** llamado **`aviech`**.
- **Dirección pública: `https://aviech.avismael-eg.workers.dev`** ✅ (verificada, responde bien).
- Publicar cambios a mano (2 comandos, desde este PC): `npm run build` y `npx wrangler deploy`
  (la herramienta quedó autorizada con tu cuenta de Cloudflare y guarda la sesión en este PC).
- Las llaves públicas de Supabase para la compilación se leen del archivo **`.env.production`**
  del repositorio — por eso no hay que configurar nada dentro de Cloudflare.
- ⚠️ La compilación automática de Cloudflare (Workers Builds) quedó enredada: nunca alcanzó
  a publicar. El repo ya incluye `wrangler.jsonc` (la configuración que faltaba); cuando se
  pueda revisar el panel (Workers & Pages → aviech → Deployments) se deja al 100%.

## ✅ La app funciona (local y en internet)

- Login (sin registro público), alta y borrado de clientes.
- App local: `npm run dev` → http://localhost:5173
- Supabase: tabla `clientes` con seguridad RLS; registro público cerrado
  (los usuarios solo se crean desde Supabase: Authentication → Users).

## ✅ Respaldos automáticos de la base de datos

- El panel genera **solo** una copia completa de la base **cada lunes ~8:00 AM (CDMX)**.
- Las copias viven en un repositorio privado: `https://github.com/Avismaelg/Aviech-backup`
  (carpeta `respaldos/`, formato `backup-AAAA-MM-DD_HHMM.sql.gz`).
- Se conservan los últimos ~120 días; los más viejos se borran solos.
- Respaldo manual: repo de respaldos → **Actions** → *Respaldo de la base de datos* → **Run workflow**.
- Cómo restaurar y más detalles: ver **`docs/RESPALDOS.md`**.

## ⚠️ Reglas de oro

1. Ningún limpiador de disco ni antivirus debe tocar `C:\Users\User\avitech`.
2. No borrar `node_modules` a mano: si algo se daña, se repara con `npm ci`.
3. El `.env` normal vive solo en este PC (Git lo ignora). El `.env.production` SÍ va
   en el repo y solo puede contener la clave "publishable" (pública por diseño);
   nunca poner ahí secretos reales (contraseñas, service keys).

## 📋 Próximos pasos

1. Ajuste en Supabase: Authentication → URL Configuration → Site URL =
   `https://aviech.avismael-eg.workers.dev`.
2. Revisar (cuando se pueda) los despliegues de Cloudflare para reactivar la publicación
   automática con cada `git push` (hoy se publica a mano con `npx wrangler deploy`).
3. Mejoras del panel: más campos/módulos y pulidos de interfaz.
