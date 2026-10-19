# Estado actual — dónde nos quedamos

> Última actualización: 18-oct-2026

## ✅ El panel está PUBLICADO y en uso

- Publicado con **Cloudflare** (plan gratuito), como proyecto tipo **Worker** llamado **`aviech`**.
- **Dirección pública: `https://aviech.avismael-eg.workers.dev`** ✅ (verificada, responde bien).
- **La publicación es automática**: cada `git push` a `main` se compila y publica solo,
  en menos de 1 minuto. ✅
- El usuario ya entró con su cuenta y probó los módulos. ✅
- Alternativa manual (respaldo): `npm run build` + `npx wrangler deploy` — la herramienta
  quedó autorizada en este PC (guarda la sesión de Cloudflare).
- Las llaves públicas de Supabase para la compilación se leen del archivo **`.env.production`**
  del repositorio — no hay que configurar nada dentro de Cloudflare.
- ⚠️ Cuidado con direcciones parecidas: `avitech.workers.dev` **no** es de este proyecto
  (es de otra empresa; da `error code: 1042`). La nuestra termina en `avismael-eg.workers.dev`.

## ✅ La app funciona (local y en internet)

- Módulos: **Inicio** (tablero), **Clientes** (búsqueda, filtros por estado, edición y borrado),
  **Servicios** y **Pagos** (con «marcar como pagado» en un clic).
- Diseño renovado: menú lateral con brillo, versión móvil, avisos flotantes y ventanas de edición.
- **Pensado para Santo Domingo / República Dominicana**: montos en **RD$** (pesos dominicanos),
  campo **RNC** en clientes para facturación formal y teléfonos con formato local (809 / 829 / 849).
- **Toque tecnológico**: contadores que se animan, gráfica de ingresos de los últimos 6 meses,
  anillo de estado de cobro (pagado vs. pendiente) y transiciones suaves entre pantallas.
- Login solo para personal (sin registro público). Los usuarios se crean en
  Supabase → Authentication → Users.
- App local: `npm run dev` → http://localhost:5173

## ✅ Base de datos al día (migraciones automáticas)

- Tablas: `clientes` (con **empresa**, **estado** y **RNC**), `servicios` y `pagos`.
  Todas con RLS: solo usuarios autenticados; un visitante anónimo no ve nada.
- Las migraciones viven en **`supabase/sql/`** (001, 002, 003) y se aplican solas con el
  workflow **«Migrar base de datos»** en cada push que cambie esa carpeta.
- Cada ejecución deja un reporte en **`supabase/verificacion-ultima.txt`**
  (tablas, columnas, conteos, prueba de inserciones que se revierte y prueba de RLS).
- Detalles: **`docs/MIGRACIONES.md`**.

## ✅ Respaldos automáticos de la base de datos

- El panel genera **solo** una copia completa de la base **cada lunes ~8:00 AM (hora del Este)**.
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

1. Verificar el primer respaldo programado (lunes 19-oct ~8:00 AM hora del Este).
2. Cuando se pueda: rotar la contraseña de la base de datos (se pegó en el chat una vez).
3. Ideas para después: módulo de gastos (regla del dinero ×3), reportes para clientes,
   control de vencimientos de pagos y más analítica del tablero.
