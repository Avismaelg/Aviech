# Estado actual — dónde nos quedamos

> Última actualización: 19-oct-2026 (cierre de la segunda sesión)

## 📌 Punto de continuación

- **Todo guardado en GitHub:** `main` = `origin/main`, sin cambios pendientes (el **Auditor SEO**
  entró en `438d3e5` y el reporte de migración en `3dbbc51`).
- **Auditor SEO integrado y en vivo:** analiza cualquier página con puntaje **0–100**
  (contenido, técnico y archivos del sitio), guarda historial y mide la **velocidad con
  PageSpeed**; **gratis y sin claves**. Migración **008** aplicada por el workflow «Migrar
  base de datos» **#9 (en verde)**. Verificado en producción: el panel sirve el módulo y
  `/api/seo/auditar` responde `401` sin sesión. Guía: **`docs/SEO.md`**.
- **CRM integrado y en vivo** (commit `3dc111d`): pipeline kanban, empresas, contactos y
  actividades, con conversión de empresa en cliente. Migración **007** aplicada por el
  workflow «Migrar base de datos» **#8 (en verde)** y verificada con RLS.
- **Sitio:** https://aviech.avismael-eg.workers.dev — sirve la compilación con el CRM y el Auditor SEO.
- **Respaldo manual al cerrar** (19-oct, 6:25 PM UTC): `backup-2026-10-19_1825.sql.gz`
  verificado; ver la sección de respaldos.
- **Para retomar:** sigue los pasos de abajo (2 minutos).

## 🔄 Cómo retomar al encender la laptop

1. Abre PowerShell y entra al proyecto:
   `cd C:\Users\User\avitech\avitech-panel`
2. Trae lo último: `git pull --ff-only`.
3. Si no existe `node_modules`, instala: `npm ci`. Si ya existe, sáltalo.
4. Prueba local: `npm run dev` → http://localhost:5173
5. Verificación rápida: `npm run build` y `npm run lint` (deben pasar limpios).
6. Revisa los workflows:
   - `Avismaelg/Aviech` → **Actions** → «Migrar base de datos».
   - `Avismaelg/Aviech-backup` → **Actions** → «Respaldo de la base de datos».
7. Lee **`docs/CRM.md`** y **`docs/SEO.md`** para usar esos módulos y este archivo para el estado general.
8. Para publicar cambios: `git push` a `main`; Cloudflare despliega solo.
9. Si agregas una migración, créala como `supabase/sql/009_....sql`; el push la aplica.

**Prueba del CRM guardada:** `docs/pruebas/prueba-crm.js` (instrucciones en
`docs/pruebas/README.md`). No usa la base real: simula Supabase y no contiene secretos.

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
- El mismo Worker atiende la **API interna** del panel: `/api/seo/*` (Auditor SEO) exige la
  sesión de Supabase (`Authorization: Bearer …`); sin ella responde `401`. Declarado en
  `wrangler.jsonc` (`main` + `assets.run_worker_first`). ✅
- ⚠️ Cuidado con direcciones parecidas: `avitech.workers.dev` **no** es de este proyecto
  (es de otra empresa; da `error code: 1042`). La nuestra termina en `avismael-eg.workers.dev`.

## ✅ La app está completa (local y en internet)

- Módulos: **Inicio** (tablero), **Clientes** (con RNC), **CRM** (pipeline, empresas, contactos y actividades), **Auditor SEO** (informe de páginas y velocidad), **Servicios**, **Igualas**
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
  marca + ver/ocultar contraseña), **enlaces profundos por sección** (`#igualas`…),
  estados vacíos con acción y contraste reforzado del texto tenue.
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
- **CRM** (nuevo): pipeline kanban con 7 etapas (prospecto → ganado/perdido), empresas,
  contactos y actividades (llamadas, correos, reuniones, tareas y notas). Incluye búsqueda,
  métricas de pipeline abierto / ponderado / ganado, alertas de actividades atrasadas,
  arrastre de tarjetas y conversión de una empresa en cliente con un clic. Guía:
  **`docs/CRM.md`**.
- **Auditor SEO** (nuevo, 2ª sesión): escribe una dirección y devuelve un informe con
  **puntaje 0–100**: contenido (título, meta descripción, H1, imágenes con `alt`, enlaces
  internos, datos estructurados), técnico (HTTPS, viewport, canonical, `noindex`, Open Graph,
  idioma) y archivos del sitio (`robots.txt` y `sitemap.xml`); además mide la **velocidad con
  PageSpeed** (móvil) y guarda **historial** por URL. Gratis, sin claves y con el mismo login.
  Guía: **`docs/SEO.md`**.
- Login solo para personal (sin registro público). Los usuarios se crean en
  Supabase → Authentication → Users.
- App local: `npm run dev` → http://localhost:5173

## ✅ Base de datos al día (migraciones automáticas)

- Tablas: `clientes` (con **empresa**, **estado** y **RNC**), `servicios`, `igualas`
  (categoría, monto mensual y día de cobro), `pagos`, `gastos`, `facturas`, `factura_items`
  (líneas de factura), las cuatro del CRM (`crm_empresas`, `crm_contactos`,
  `crm_oportunidades`, `crm_actividades`) y `seo_auditorias` (informes del Auditor SEO).
  Todas con RLS: solo usuarios autenticados; un visitante anónimo no ve nada.
- Las migraciones viven en **`supabase/sql/`** (001…008) y se aplican solas con el
  workflow **«Migrar base de datos»** en cada push que cambie esa carpeta.
- Cada ejecución deja un reporte en **`supabase/verificacion-ultima.txt`**
  (tablas, columnas, conteos, prueba de inserciones que se revierte y prueba de RLS).
- **Migración 007 (CRM) aplicada y verificada el 19-oct-2026 17:35 UTC:** las 4 tablas
  existen con sus columnas e índices, las inserciones de prueba pasan y el RLS deja al
  anónimo en 0. Reporte: `supabase/verificacion-ultima.txt`.
- **Migración 008 (Auditor SEO) aplicada y verificada el 19-oct-2026 18:24 UTC:** la tabla
  `seo_auditorias` existe con sus columnas, las inserciones de prueba pasan y el RLS deja al
  anónimo en 0. Workflow «Migrar base de datos» **#9 (en verde)**. Reporte:
  `supabase/verificacion-ultima.txt`.
- Detalles: **`docs/MIGRACIONES.md`**.
- **Contraseña de la base rotada el 19-oct-2026** con la API de administración de
  Supabase: la contraseña vieja quedó invalidada al instante, los secretos de los dos
  repos se actualizaron y el **respaldo + las migraciones quedaron verificados en
  verde** con la clave nueva. Procedimiento: **`docs/ROTAR-CLAVE-BD.md`**.
- **Pruebas completas 19-oct-2026** (con datos simulados, sin tocar la base real): las 9
  secciones del panel (incluidas **Igualas** y **CRM**), factura (con NCF, RNC e ITBIS),
  impresión siempre en claro, vista móvil, login y navegación — **0 errores de consola**.
  Capturas en `capturas-mejora` (14 pantallas) y `capturas-crm` (5 pantallas).
- **Prueba del Auditor SEO** (19-oct, 2ª sesión): 9 pasos con datos simulados — informe,
  velocidad con PageSpeed, historial, borrado, validación, recarga y vista móvil —
  **0 errores de consola**. Script: `docs/pruebas/prueba-seo.js`; capturas en `capturas-seo`
  (6 pantallas).

## ✅ Respaldos automáticos de la base de datos

- El panel genera **solo** una copia completa de la base **cada lunes ~1:00 PM (hora de República Dominicana = 17:00 UTC)**.
- Las copias viven en un repositorio privado: `https://github.com/Avismaelg/Aviech-backup`
  (carpeta `respaldos/`, formato `backup-AAAA-MM-DD_HHMM.sql.gz`).
- Se conservan los últimos ~120 días; los más viejos se borran solos.
- Respaldo manual: repo de respaldos → **Actions** → *Respaldo de la base de datos* → **Run workflow**.
- Nota 19-oct: el respaldo automático de ese día no corrió por un incidente de GitHub
  Actions; se ejecutó uno manual a la 1:04 PM y se verificó (gzip válido, 7,402 líneas SQL,
  con la tabla `igualas`).
- **Respaldo manual adicional al cerrar la sesión (19-oct, 1:42 PM RD):**
  `backup-2026-10-19_1742.sql.gz` verificado (gzip válido, 269.1 KB descomprimido,
  7,738 líneas) e incluye ya las 4 tablas del CRM. Run #8 en verde.
- **Respaldo manual adicional al cerrar la segunda sesión (19-oct, 6:25 PM UTC):**
  `backup-2026-10-19_1825.sql.gz` verificado (gzip válido, 277,330 bytes descomprimidos,
  7,796 líneas) e incluye las 12 tablas, entre ellas **`seo_auditorias`**. Run #9 en verde.
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

1. Confirmar el respaldo automático del lunes 26-oct (~1:00 PM, hora de República
   Dominicana = 17:00 UTC). Los del 19-oct se hicieron manuales (1:04 PM, 1:42 PM y
   2:25 PM) y quedaron verificados.
2. Revisar en Supabase → **Account → Access Tokens** y borrar el token
   `cli_User@ThinkBook-15IIL_1792390971` (se creó el 19-oct solo para rotar la
   contraseña; ya no hace falta). En este PC ya no queda copia.
3. Completar los datos fiscales de AviTech en `src/lib/empresa.ts` (razón social, RNC,
   dirección, teléfono y correo) y, cuando estén, conectar el **e-CF** con el certificado
   digital de DGII (ver `docs/FACTURACION.md`).
4. CRM fase 2: recordatorios de actividades atrasadas (correo o notificación), sincronización
   de correo/WhatsApp y resúmenes con IA (evaluar costo antes de activar).
5. Auditor SEO fase 2 (solo si algún día se decide pagar): palabras clave, backlinks y
   seguimiento de posiciones con OpenSEO hospedado (US$10/mes) o DataForSEO (recarga mínima
   US$50). Hoy: no pagar.
6. Ideas para después: portal de solo lectura para que cada cliente vea su estado de cuenta,
   recordatorios de vencimientos y más analítica del tablero.
