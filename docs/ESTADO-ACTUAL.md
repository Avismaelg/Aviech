# Estado actual — dónde nos quedamos

> Última actualización: 18-oct-2026

## ✅ ¡El panel está PUBLICADO en internet!

- Publicado con **Cloudflare** (plan gratuito), como proyecto tipo **Worker** llamado **`aviech`**.
- Dirección: `https://aviech.<algo>.workers.dev` — el "algo" es tu subdominio personal.
  Ver la dirección exacta: panel de Cloudflare → **Workers & Pages** → **aviech** → botón **"Visit"**.
- **Se recompila y publica solo** con cada `git push` a `main`.
- Las llaves públicas de Supabase para la compilación se leen del archivo **`.env.production`**
  del repositorio — por eso no hay que configurar nada dentro de Cloudflare.

## ✅ La app funciona (local y en internet)

- Login, alta y borrado de clientes.
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

1. Ajuste en Supabase: Authentication → URL Configuration → Site URL = dirección del Worker.
2. Mejoras del panel: más campos/módulos y pulidos de interfaz
   (login ya sin pestaña de registro: solo el administrador crea usuarios en Supabase).
