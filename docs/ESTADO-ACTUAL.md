# Estado actual — dónde nos quedamos

> Última actualización: 18-oct-2026

## ✅ ¡El panel está PUBLICADO en internet!

- Publicado con **Cloudflare** (plan gratuito), como proyecto tipo **Worker** llamado **`aviech`**.
- **Dirección pública: `https://aviech.avismael-eg.workers.dev`** ✅ (verificada, responde bien).
- **La publicación es automática**: cada `git push` a `main` se compila y publica solo,
  en menos de 1 minuto (verificado el 18-oct: 5 pushes → 5 publicaciones automáticas). ✅
- Alternativa manual (respaldo): `npm run build` + `npx wrangler deploy` — la herramienta
  quedó autorizada en este PC (guarda la sesión de Cloudflare).
- Las llaves públicas de Supabase para la compilación se leen del archivo **`.env.production`**
  del repositorio — no hay que configurar nada dentro de Cloudflare.
- ⚠️ Cuidado con direcciones parecidas: `avitech.workers.dev` **no** es de este proyecto
  (es de otra empresa; da `error code: 1042`). La nuestra termina en `avismael-eg.workers.dev`.

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
2. Abrir el panel publicado y entrar con tu usuario (verificación visual).
3. Mejoras del panel: más campos/módulos y pulidos de interfaz.
