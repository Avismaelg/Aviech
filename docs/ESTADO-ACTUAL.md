# Estado actual — dónde nos quedamos

> Última actualización: 19-oct-2026

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

## ✅ La app está completa (local y en internet)

- Módulos: **Inicio** (tablero), **Clientes** (con RNC), **Servicios**, **Igualas**
  (contratos mensuales de contabilidad, software y asesoría legal con ingreso recurrente),
  **Pagos**, **Facturación**, **Gastos** y **Reportes**.
- **Pensado para Santo Domingo / República Dominicana**: montos en **RD$** (pesos dominicanos),
  campo **RNC** para facturación formal (DGII) y teléfonos con formato local (809 / 829 / 849).
- **Toque tecnológico**: contadores que se animan, gráfica de ingresos de los últimos 6 meses,
  anillo de estado de cobro, transiciones suaves y app instalable (PWA: se puede «Añadir a
  pantalla de inicio» desde el teléfono).
- **Interfaz oscura premium** (19-oct): fondo con auroras y rejilla sutil, barra lateral de
  cristal, botones con gradiente, tarjetas elevadas e insignias translúcidas. La impresión y
  las facturas se mantienen en claro (las hojas salen perfectas).
- **Mejora de interfaz integral** (19-oct, con el skill UI UX Pro Max): tipografía **Inter**
  autoalojada, foco visible en todo lo interactivo, acciones de tabla con etiqueta accesible
  (`BotonIcono`), modales con bloqueo del fondo y auto-foco, **login rediseñado** (panel de
  marca + ver/ocultar contraseña) y contraste reforzado del texto tenue.
- **Gastos** con la regla del dinero ×3: cada gasto se cubre con ingresos reales;
  el tablero muestra **Gastos del mes** y **Balance del mes** (cobrado − gastos).
- **Facturación**: facturas con **NCF/e-NCF** (B01, B02, B14, B15 y e-CF E31/E32/E44/E45),
  **ITBIS 18%** opcional, líneas de detalle, estados borrador → emitida → pagada/anulada y
  **impresión/PDF** con formato de la empresa. Al marcar una factura como pagada, el ingreso
  se registra solo en Pagos. ⚠️ El **envío real a DGII (e-CF)** se conecta cuando estén el
  certificado digital y la certificación; antes de entregar facturas a clientes, completar
  los datos fiscales en `src/lib/empresa.ts`. Detalles: **`docs/FACTURACION.md`**.
- **Vencimientos**: los pagos pendientes con fecha pasada se marcan en rojo («Vencido») en
  Pagos, en el tablero y en los reportes; hay tarjeta de «Vencidos» con el monto total.
- **Reportes** listos para el cliente: **estado de cuenta por cliente** (servicios, pagos,
  contratado / cobrado / por cobrar) y **resumen mensual** (12 meses: cobrado, por cobrar,
  gastos y balance). Botones **Imprimir / PDF** (limpia la pantalla: sin menús, con encabezado
  de AviTech) y **CSV** para Excel.
- Login solo para personal (sin registro público). Los usuarios se crean en
  Supabase → Authentication → Users.
- App local: `npm run dev` → http://localhost:5173

## ✅ Base de datos al día (migraciones automáticas)

- Tablas: `clientes` (con **empresa**, **estado** y **RNC**), `servicios`, `igualas`
  (categoría, monto mensual y día de cobro), `pagos`, `gastos`, `facturas` y `factura_items`
  (líneas de factura). Todas con RLS: solo usuarios autenticados; un visitante anónimo no ve nada.
- Las migraciones viven en **`supabase/sql/`** (001…006) y se aplican solas con el
  workflow **«Migrar base de datos»** en cada push que cambie esa carpeta.
- Cada ejecución deja un reporte en **`supabase/verificacion-ultima.txt`**
  (tablas, columnas, conteos, prueba de inserciones que se revierte y prueba de RLS).
- Detalles: **`docs/MIGRACIONES.md`**.
- **Contraseña de la base rotada el 19-oct-2026** con la API de administración de
  Supabase: la contraseña vieja quedó invalidada al instante, los secretos de los dos
  repos se actualizaron y el **respaldo + las migraciones quedaron verificados en
  verde** con la clave nueva. Procedimiento: **`docs/ROTAR-CLAVE-BD.md`**.
- **Prueba completa 19-oct-2026** (con datos simulados, sin tocar la base real): las 8
  secciones (incluida **Igualas**), factura (con NCF, RNC e ITBIS), impresión siempre en
  claro, vista móvil, login y navegación — **0 errores de consola**. Capturas en la
  carpeta `capturas-mejora` (14 pantallas).

## ✅ Respaldos automáticos de la base de datos

- El panel genera **solo** una copia completa de la base **cada lunes ~10:00 AM (hora de República Dominicana)**.
- Las copias viven en un repositorio privado: `https://github.com/Avismaelg/Aviech-backup`
  (carpeta `respaldos/`, formato `backup-AAAA-MM-DD_HHMM.sql.gz`).
- Se conservan los últimos ~120 días; los más viejos se borran solos.
- Respaldo manual: repo de respaldos → **Actions** → *Respaldo de la base de datos* → **Run workflow**.
- Cómo restaurar y más detalles: ver **`docs/RESPALDOS.md`**.

## 🎨 Herramientas de diseño (UI UX Pro Max)

- El **sistema de diseño** del panel está documentado en **`docs/DESIGN.md`** (tokens,
  componentes, reglas de impresión y checklist). Cualquier cambio visual debe seguirlo.
- Quedó instalado el skill **UI UX Pro Max** (19-oct): motor de estilos, paletas por
  industria, tipografías, guías de UX y checklist de entrega.
  - **Global** (funciona en todo OpenCode): `C:\Users\User\.opencode\skills\`
  - **En el proyecto**: `avitech-panel\.opencode\skills\` (ignorado por Git; se reinstala
    con `npx ui-ux-pro-max-cli init --ai opencode`)
  - Requiere **Python 3.12** (instalado en `C:\Users\User\AppData\Local\Programs\Python\Python312`).
- Uso: pedir en OpenCode cualquier tarea de interfaz («revisa esta pantalla», «mejora este
  formulario», «haz este reporte más claro») y el skill se activa solo.

## ⚠️ Reglas de oro

1. Ningún limpiador de disco ni antivirus debe tocar `C:\Users\User\avitech`.
2. No borrar `node_modules` a mano: si algo se daña, se repara con `npm ci`.
3. El `.env` normal vive solo en este PC (Git lo ignora). El `.env.production` SÍ va
   en el repo y solo puede contener la clave "publishable" (pública por diseño);
   nunca poner ahí secretos reales (contraseñas, service keys).

## 📋 Próximos pasos

1. Verificar el primer respaldo programado (lunes 19-oct ~10:00 AM, hora de República Dominicana).
2. Revisar en Supabase → **Account → Access Tokens** y borrar el token
   `cli_User@ThinkBook-15IIL_1792390971` (se creó el 19-oct solo para rotar la
   contraseña; ya no hace falta). En este PC ya no queda copia.
3. Completar los datos fiscales de AviTech en `src/lib/empresa.ts` (razón social, RNC,
   dirección, teléfono y correo) y, cuando estén, conectar el **e-CF** con el certificado
   digital de DGII (ver `docs/FACTURACION.md`).
4. Ideas para después: portal de solo lectura para que cada cliente vea su estado de cuenta,
   recordatorios de vencimientos y más analítica del tablero.
