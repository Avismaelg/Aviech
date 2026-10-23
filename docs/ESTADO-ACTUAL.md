# Estado actual — dónde nos quedamos

> Última actualización: 22-oct-2026 (14.ª sesión: rediseño de la portada, publicado en `062b7d0`)

## 📌 Punto de continuación

- **Rediseño de la portada (14.ª sesión, 22 oct, publicado en `062b7d0`):** `/` se rehízo con una composición inspirada en la plantilla **Vaultline** de motionsites.ai, tomando solo su estructura y su lenguaje visual (no se copiaron imágenes, textos ni la prueba social). Cabecera oscura; portada marina con una bóveda 3D (SVG + CSS) que sigue el cursor y cuatro fichas de garantía; franja «Garantías» con solo lo que el código cumple; servicios con filete de marca; botón magnético en la acción principal; línea de proceso que avanza con el scroll; y panel de contacto oscuro. El formulario, su consentimiento y el endpoint no cambiaron. Se quitaron los filtros SVG y el `drop-shadow` animados, y la bóveda queda estática en equipos ligeros (`hero-ligero`). Service worker `avitech-v2026-10-22-rediseno`. Validación local: `npm run build` y `npm run lint` sin avisos; sitio **9/9**; interacciones **9/9** (incluye bóveda, botón magnético, línea de proceso y filete); PWA **5/5**; sin desbordes a 390 y 1440 px; 0 errores de consola. Publicado el 22-oct con tu autorización (commit `062b7d0`): Cloudflare sirve `avitech-v2026-10-22-rediseno`. Verificado en producción: rutas 200 y 404 real, sitio **9/9**, interacciones **9/9**, PWA **5/5** y 0 errores de consola.
- **Auditoría y correcciones (13.ª sesión, 22 oct, publicada):** revisión completa de Worker,
  formularios, panel, facturación, PWA y textos legales. Se corrigieron los enlaces
  «Entrar al panel» que volvían a `/`, `/talento` ya no lleva `noindex` y tiene canónica
  propia, el presupuesto vacío en Telegram, el subtotal de facturas con líneas inválidas,
  el NCF duplicado (comprobación en el panel + trigger/índice 013), las fechas imposibles,
  las URLs privadas o con credenciales, los topes de lectura de páginas, las descargas que
  revocaban el objeto demasiado pronto y la sesión que podía quedarse cargando. Se añadieron
  iconos PNG 192/512 y `apple-touch-icon`, cabeceras de seguridad y caché (`_headers`),
  página 404 real (`404.html` + `_redirects`, estado HTTP 404) y `noindex`, formato
  dominicano de presupuesto (`1.500,50`) y validación de `sitio_web`. Validación local:
  `npm run build`, `npm run lint`, `node --check`, `wrangler deploy --dry-run`, sitio
  **9/9**, interacciones **6/6**, PWA **5/5**, `wrangler dev` con 200 en las rutas
  conocidas y 404 real en las desconocidas, y verificación específica sin errores de
  consola. **Publicado el 22-oct-2026 (commit `6961fa1`):** Cloudflare ya sirve el
  build nuevo y el service worker `avitech-v2026-10-22-auditoria`; verificado en
  producción (rutas 200, 404 real, canónicas, PWA y API). La migración 013 se aplicó
  el 22-oct a las 14:29 UTC y actualizó `supabase/verificacion-ultima.txt`; la prueba
  de inserciones y las comprobaciones de RLS terminaron sin errores (run de GitHub
  Actions completado con éxito). El panel además bloquea NCF duplicados antes de
  guardar.
- **Interactividad y modelo IA (12.ª sesión, 21 oct, local):** hero con red de
  partículas, parallax 3D y pulso al clic; tarjetas de servicio con inclinación,
  brillo y detalle; aparición de secciones al hacer scroll; microinteracciones en
  botones y navegación. Todo respeta `prefers-reduced-motion`, táctil y equipos
  ligeros, y limpia listeners/frames. El modelo de Workers AI queda configurable con
  `IA_MODELO` y overrides `IA_MODELO_ASISTENTE`, `IA_MODELO_SOLICITUDES` e
  `IA_MODELO_TALENTO`. Validación: hero, interacciones y **sitio 9/9**, 0 errores de
  consola. En esa sesión quedó en local, pendiente de autorización; el service worker
  local era `avitech-v2026-10-21-interactivo`.
- **Sitio comercial (11.ª sesión, 21 oct):** nueva portada pública en `/` con la paleta
  azul del brief (marino, eléctrico y verde), hero, cuatro servicios, seis
  necesidades, proceso, tres demostraciones funcionales, equipo, cuatro paquetes en
  RD$ y formulario de contacto. El panel se movió a **`/panel`** (los enlaces
  `/#seccion` redirigen), la PWA abre en `/panel` y el sitio tiene canonical,
  JSON-LD, `robots.txt` y `sitemap.xml`. El formulario reutiliza
  `POST /api/solicitudes` (sin tablas nuevas) y mapea el servicio a los tipos
  internos. Se sumaron **preguntas frecuentes**, **privacidad/términos** y **alertas
  opcionales por Telegram** para cada solicitud nueva. Prueba nueva:
  `docs/pruebas/prueba-sitio.js` (**9 pasos, 0 errores**).
  **Publicado y verificado en producción** el 21-oct (commits `353e4da` y `643e686`): `/` y
  `/panel` responden `200`, `/solicitud` y `/talento` siguen operativos, el service
  worker es `avitech-v2026-10-21-lanzamiento` y la revisión no encontró errores
  de consola.
- **Seguridad y rendimiento de Talento (10.ª sesión, 21 oct):** perfil **protegido con
  token** (actualizar un correo ya registrado exige el token del navegador;
  `crear_postulacion_publica` se sustituye por `guardar_postulacion_publica` y queda
  eliminada), **límites en la propia base** (`talento_limites_publicos` +
  `talento_limitar_publico`, con SQLSTATE `PT429`/`PT409`), índices parciales de las
  listas públicas, caché de navegador de 60 s en `GET /api/talento/*`, **aviso de
  solicitudes de empresa** y **limpieza de CV sin candidato** en el Resumen, y
  **code-splitting** del panel y las páginas públicas. Migración **012 aplicada y
  verificada en producción** el 21-oct (reporte en verde: `guardar = t`,
  `vieja_eliminada = t`, `limites_anon = f`; Worker y frontend desplegados, caché de
  60 s activa). La prueba de Talento pasa a **12 pasos** y 0 errores de consola.
- **Postulación asistida con IA (9.ª sesión, 21 oct):** en `/talento` → «Busco
  empleo», el candidato puede autorizar que la IA revise hasta 20 vacantes públicas
  abiertas y postule su perfil a un máximo de 3. El alta devuelve un **token privado**
  que autoriza la operación; la IA no recibe correo, teléfono ni CV. Las postulaciones
  se guardan con `origen = 'ia'`, puntaje y motivo. Migración **011** con
  `perfil_para_ia_publico` y `postular_con_ia_publica`. La prueba de Talento pasa a
  **9 pasos** y 0 errores de consola.
- **Módulo Talento (8.ª sesión, 20–21 oct):** panel interno `#talento` con cinco
  pestañas (Resumen, Candidatos, Empresas, Vacantes y Procesos), portal público
  `/talento` con «Busco empleo» y «Busco talento», perfiles anónimos, shortlist,
  solicitud de entrevista/contratación, CV privado en PDF (≤ 5 MB), matching con
  Workers AI y kanban de seis etapas con cierre de colocación. Migración **010**,
  tablas separadas del CRM y RPC públicas con consentimiento y límites. Guía:
  **`docs/TALENTO.md`**; prueba: **`docs/pruebas/prueba-talento.js`** (9 pasos,
  0 errores de consola). Sin pagos ni cuentas públicas.
- **Todo guardado y desplegado:** la **postulación asistida con IA** está en `main`
  (`7388be2`) y en producción desde el 21-oct-2026. La migración **011** se aplicó y
  verificó: las RPC `perfil_para_ia_publico` y `postular_con_ia_publica` están
  disponibles para `anon`, los
  permisos directos de las tablas de Talento siguen en `false` y el reporte quedó en
  `supabase/verificacion-ultima.txt`. Cloudflare sirve el asset
  `index-JJNQJXRT.js` y el service worker `avitech-v2026-10-21-talento-ia`;
  **https://aviech.avismael-eg.workers.dev/talento** responde `200`, la tarjeta de
  autorización aparece y `POST /api/talento/ia-postular` responde `400` con un token
  inválido. Sin errores de consola en la revisión de producción. Al cierre,
  `main` = `origin/main`.
  (2.ª sesión: Auditor SEO en `438d3e5` y reporte de migración en `3dbbc51`;
  3.ª sesión: **Prospección** en `34a6459`; 4.ª sesión: **PWA sin conexión y
  optimizaciones** en `83860bb`, rediseño v2 en `88d9378` y **rediseño v3 claro**
  en el commit de cierre de esa sesión; 5.ª sesión: **asistente de IA** en
  `6344d13`; 6.ª sesión: **solicitudes con IA** en `98e1275` y reporte de migración
  en `78fa159`).
- **Rediseño v4 «Open Design · Mastercard» (7.ª sesión, 20-oct):** nueva identidad
  visual cálida y editorial en **todo el panel y el formulario público**: lienzo
  crema, tinta casi negra, naranja de señal, tipografía **Sofia Sans**, **barra
  lateral flotante** en escritorio y cabecera tipo píldora en móvil. Se mantuvieron
  intactas las funciones, validaciones, RLS, RPC, límites y lógica de IA. Guía:
  **`docs/DESIGN.md`**; binding en **`.open-design.json`**. Pruebas de humo y
  revisión visual en verde; ver la sección de pruebas.
- **Solicitudes con IA (6.ª sesión, 19-oct):** el cliente pide un servicio por el
  **formulario público** `https://aviech.avismael-eg.workers.dev/solicitud` o el
  personal lo registra en **Solicitudes**. La IA prepara diagnóstico, alcance,
  propuesta, correo e informe; crea/reutiliza cliente, empresa, contacto,
  oportunidad ganada y **servicio completado**. Queda en la bandeja para revisión.
  Migración **009**, endpoints públicos con token y límites; el correo es un
  **borrador** (no se envía solo). Guía: **`docs/SOLICITUDES.md`**. Prueba de
  humo en `docs/pruebas/prueba-solicitudes.js` (0 errores de consola).
- **Publicado y verificado en producción (19-oct, 11:10 PM RD):** Cloudflare ya sirve
  la compilación nueva; `/solicitud` responde `200`, es `noindex` y carga sin errores en
  escritorio y móvil. El ejecutor sin sesión responde `401`, el preflight del formulario
  `204` y la migración **009** quedó aplicada. La prueba anónima de las RPC creó y cerró
  una solicitud dentro de una transacción revertida.
- **Asistente IA (5.ª sesión, 19-oct; acceso móvil actualizado en la v4):** chat dentro
  del panel; en escritorio se abre desde el botón **Asistente IA** de la barra de
  contexto y en móvil desde el icono de destellos de la cabecera fija (hoja inferior).
  Usa **Cloudflare Workers AI** con el
  modelo `@cf/google/gemma-4-26b-a4b-it`, binding `AI` en `wrangler.jsonc`, **sin
  claves ni costo** (10,000 neuronas gratis al día). Exige sesión de Supabase
  (`POST /api/ia/chat`), limita el tamaño de los mensajes y no guarda el historial.
  **No ve la base de datos**: si se necesitan datos, hay que pegarlos. Guía:
  **`docs/ASISTENTE.md`**. Verificado en producción: preflight `204`, sin sesión
  `401`, método incorrecto `405` y llamada directa al modelo `200` en español.
  Interfaz validada en escritorio y móvil, **0 errores de consola**.
- **PWA con service worker (4.ª sesión):** el panel guarda su armazón y **abre sin
  conexión**; las visitas repetidas cargan al instante. La API y Supabase **nunca** entran
  en la caché. Verificado en producción (`/sw.js` servido y el bundle lo registra) y con la
  prueba nueva `docs/pruebas/prueba-pwa.js`.
- **Pruebas completas (4.ª sesión):** las **4 pruebas de esa sesión** (CRM, Auditor SEO,
  Prospección y PWA) en verde, `npm run build` y `npm run lint` limpios, y el Worker
  re-probado contra sitios reales.
- **Rediseño v3 «Claro profesional» (4.ª sesión, 19-oct noche, histórico):** tema
  claro, navegación superior con grupos y píldora azul, menú desplegable en
  móvil/tablet, titulares Sora + cuerpo Inter y auto-actualización de la PWA. Quedó
  **sustituido por el rediseño v4** del 20-oct. Guía vigente: **`docs/DESIGN.md`**.
- **Pruebas del rediseño v4:** las **5 pruebas de humo** (Solicitudes, CRM, Auditor
  SEO, Prospección y PWA) pasaron en verde con la nueva identidad, `npm run build` y
  `npm run lint` limpios, **0 errores de consola**. Se revisaron además Login, Inicio,
  bandeja/detalle de Solicitudes, Asistente IA y `/solicitud` en escritorio y móvil.
  Capturas nuevas en `capturas-solicitudes/open-design-*.png` (y las capturas de CRM,
  SEO, Prospección y PWA regeneradas con el tema v4).
- **Prospección integrada y en vivo:** busca **correos, teléfonos y redes sociales** de una web
  (página principal + hasta 2 páginas de contacto) y con un clic los guarda como **empresa y
  contacto en el CRM**, avisando si la empresa ya existe. **Gratis y sin claves**; no necesitó
  migración. Verificado en producción: el bundle sirve el módulo y `/api/scraper/contactos`
  responde `401` sin sesión. Guía: **`docs/PROSPECCION.md`**.
- **Auditor SEO integrado y en vivo:** analiza cualquier página con puntaje **0–100**
  (contenido, técnico y archivos del sitio), guarda historial y mide la **velocidad con
  PageSpeed**; **gratis y sin claves**. Migración **008** aplicada por el workflow «Migrar
  base de datos» **#9 (en verde)**. Guía: **`docs/SEO.md`**.
- **CRM integrado y en vivo** (commit `3dc111d`): pipeline kanban, empresas, contactos y
  actividades, con conversión de empresa en cliente. Migración **007** aplicada por el
  workflow «Migrar base de datos» **#8 (en verde)** y verificada con RLS.
- **Sitio:** https://aviech.avismael-eg.workers.dev — sirve la compilación con el CRM, el
  Auditor SEO, Prospección y Solicitudes.
- **Respaldo manual al cerrar** (19-oct, 6:25 PM UTC): `backup-2026-10-19_1825.sql.gz`
  verificado; ver la sección de respaldos (las sesiones 3.ª y 4.ª no cambiaron la base
  de datos).
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
7. Lee **`docs/CRM.md`**, **`docs/TALENTO.md`**, **`docs/SEO.md`**,
   **`docs/PROSPECCION.md`**, **`docs/ASISTENTE.md`** y **`docs/SOLICITUDES.md`**
   para usar esos módulos, **`docs/pruebas/README.md`** para las 6 pruebas de humo y
   este archivo para el estado general.
8. Para publicar cambios: `git push` a `main`; Cloudflare despliega solo.
9. Si agregas una migración, créala como `supabase/sql/011_....sql`; el push la aplica.

**Pruebas guardadas:** ocho pruebas de humo en `docs/pruebas/` (CRM, Talento,
Auditor SEO, Prospección, PWA, Solicitudes, Sitio comercial e Interacciones), con
instrucciones en `docs/pruebas/README.md`. No usan la base real (datos simulados)
ni contienen secretos.

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
- El mismo Worker atiende la **API interna** del panel: `/api/seo/*` (Auditor SEO),
  `/api/scraper/*` (Prospección), `/api/ia/chat` (Asistente IA),
  `/api/solicitudes/ejecutar` (cierre con IA) y `/api/talento/match` (matching).
  Todas exigen la sesión de Supabase (`Authorization: Bearer …`) y sin ella responden
  `401`. Los formularios públicos usan `POST /api/solicitudes` y las rutas públicas de
  Talento (`GET /api/talento/vacantes`, `GET /api/talento/candidatos`,
  `POST /api/talento/postulaciones`, `POST /api/talento/ia-postular`,
  `POST /api/talento/solicitudes` y `POST /api/talento/vacantes/publicar`), que solo
  crean registros y devuelven un folio; la postulación con IA exige el token privado
  que devolvió el alta del perfil.
  Declarado en `wrangler.jsonc` (`main`, `assets.run_worker_first` y binding `ai`). ✅
- ⚠️ Cuidado con direcciones parecidas: `avitech.workers.dev` **no** es de este proyecto
  (es de otra empresa; da `error code: 1042`). La nuestra termina en `avismael-eg.workers.dev`.

## ✅ La app está completa (local y en internet)

- Módulos: **Inicio** (tablero), **Clientes** (con RNC), **CRM** (pipeline, empresas, contactos y actividades), **Talento** (candidatos, empresas empleadoras, vacantes y procesos + portal público), **Solicitudes** (formulario público + bandeja y cierre con IA), **Auditor SEO** (informe de páginas y velocidad), **Prospección** (contactos de una web → CRM), **Servicios**, **Igualas**
  (contratos mensuales de contabilidad, software y asesoría legal con ingreso recurrente),
  **Pagos**, **Facturación**, **Gastos**, **Reportes** y **Asistente IA** (chat interno).
- **Pensado para Santo Domingo / República Dominicana**: montos en **RD$** (pesos dominicanos),
  campo **RNC** para facturación formal (DGII) y teléfonos con formato local (809 / 829 / 849).
- **Toque tecnológico**: contadores que se animan, gráfica de ingresos de los últimos 6 meses,
  anillo de estado de cobro, transiciones suaves y app instalable (PWA con **service worker**:
  se puede «Añadir a pantalla de inicio» y **abrir sin conexión**; las visitas repetidas
  cargan al instante).
- **Interfaz v4 «Open Design · Mastercard»** (20-oct): lienzo crema, tinta casi negra,
  naranja de señal, tipografía **Sofia Sans** autoalojada, tarjetas `rounded-[28px]`,
  botones en píldora y cifras tabulares. **Barra lateral flotante** con grupos
  (Operación / Herramientas / Finanzas) en escritorio y **cabecera tipo píldora** con
  menú desplegable en móvil/tablet. Login y `/solicitud` tienen panel de marca oscuro;
  la impresión y las facturas se mantienen en claro (las hojas salen perfectas).
- **Mejora de interfaz integral** (con UI UX Pro Max y Open Design): foco naranja visible
  en todo lo interactivo, acciones de tabla con etiqueta accesible (`BotonIcono`), modales
  con bloqueo del fondo y auto-foco, **login rediseñado** (panel de marca + ver/ocultar
  contraseña), **enlaces profundos por sección** (`#igualas`…), estados vacíos con acción
  y contraste reforzado del texto tenue.
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
- **Talento** (8.ª y 9.ª sesión): módulo independiente del CRM para conectar
  candidatos y empresas empleadoras. Panel interno con candidatos, empresas, vacantes,
  postulaciones y kanban de seis etapas; portal público `/talento` con perfiles
  anónimos, shortlist, solicitud de entrevista/contratación sin pago, CV privado en PDF
  (≤ 5 MB), matching con Workers AI bajo demanda y **postulación asistida con IA**
  autorizada por el candidato (máximo 3 vacantes). Sin cuentas públicas; tablas solo
  para personal autenticado. Guía: **`docs/TALENTO.md`**.
- **Auditor SEO** (nuevo, 2ª sesión): escribe una dirección y devuelve un informe con
  **puntaje 0–100**: contenido (título, meta descripción, H1, imágenes con `alt`, enlaces
  internos, datos estructurados), técnico (HTTPS, viewport, canonical, `noindex`, Open Graph,
  idioma) y archivos del sitio (`robots.txt` y `sitemap.xml`); además mide la **velocidad con
  PageSpeed** (móvil) y guarda **historial** por URL. Gratis, sin claves y con el mismo login.
  Guía: **`docs/SEO.md`**.
- **Prospección** (nuevo, 3.ª sesión): escribe la web de una empresa y extrae sus **correos,
  teléfonos y redes sociales** (página principal + hasta 2 páginas de contacto del mismo
  dominio); cada hallazgo indica su página de origen y las redes de empresa van primero.
  Con un clic crea la **empresa y el contacto en el CRM** (o añade el contacto si la empresa
  ya existe; avisa antes). Gratis, sin claves, con el mismo login. Guía:
  **`docs/PROSPECCION.md`**.
- **Solicitudes con IA** (nuevo, 6.ª sesión): el cliente pide un servicio desde el
  **formulario público** (`/solicitud`, sin cuenta, con consentimiento y folio) o el
  personal lo registra en **Solicitudes**. La IA prepara diagnóstico, alcance, propuesta,
  correo e informe; crea o reutiliza cliente, empresa, contacto, oportunidad ganada y
  **servicio completado**; el equipo revisa confianza, datos pendientes y precio. El
  correo queda como borrador y **no se envía automáticamente**. Guía:
  **`docs/SOLICITUDES.md`**.
- **Asistente IA** (nuevo, 5.ª sesión): chat de trabajo para redactar correos y
  propuestas, resumir, revisar textos y pensar ideas comerciales. En escritorio se abre
  desde la barra de contexto; en móvil, desde el icono de destellos de la cabecera fija.
  Usa
  **Workers AI** con el modelo Gemma 4, **sin claves ni costo** dentro del plan gratis;
  las conversaciones **no se guardan** y el asistente **no ve los datos del panel**. En
  móvil se abre como hoja inferior. Guía: **`docs/ASISTENTE.md`**.
- **Sin conexión y optimización (nuevo, 4.ª sesión):** service worker propio — el armazón
  queda en caché, la app **abre sin internet** y repetir visita carga al instante; la API y
  Supabase **nunca** se guardan. Además el Worker analiza enlaces y metadatos en **una sola
  pasada** por página (menos CPU del plan gratis).
- Login solo para personal (sin registro público). Los usuarios se crean en
  Supabase → Authentication → Users.
- App local: `npm run dev` → http://localhost:5173

## ✅ Base de datos al día (migraciones automáticas)

- Tablas: `clientes` (con **empresa**, **estado** y **RNC**), `servicios` (con plan,
  informe y ejecución de IA), `igualas` (categoría, monto mensual y día de cobro), `pagos`,
  `gastos`, `facturas`, `factura_items` (líneas de factura), las cuatro del CRM
  (`crm_empresas`, `crm_contactos`, `crm_oportunidades`, `crm_actividades`),
  `seo_auditorias` (informes del Auditor SEO), `solicitudes_servicio` (bandeja y
  automatización), las cuatro de **Talento** (`talento_candidatos`,
  `talento_empresas`, `talento_vacantes`, `talento_postulaciones`) y
  `talento_limites_publicos` (contadores antiabuso, sin acceso para `anon`). Todas con
  RLS: solo usuarios autenticados; un visitante anónimo no ve nada. Bucket privado
  `talento-cv`.
- Las migraciones viven en **`supabase/sql/`** (001…013) y se aplican solas con el
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
- **Migración 009 (Solicitudes) aplicada y verificada el 19-oct-2026 23:10 RD / 20-oct 03:10 UTC:**
  crea `solicitudes_servicio`, agrega plan/informe a `servicios`, RLS y las RPC
  `crear_solicitud_publica`, `finalizar_solicitud` y `marcar_solicitud_error`. Workflow
  «Migrar base de datos» **#10 (en verde)**; RLS anónimo en 0 y prueba anónima de creación +
  cierre con token correcta (revertida). Reporte: `supabase/verificacion-ultima.txt`.
- **Migración 010 (Talento), 21-oct-2026:** aplicada con éxito por el workflow «Migrar
  base de datos». Crea las cuatro tablas de Talento, el bucket privado `talento-cv`,
  las políticas RLS y las RPC públicas. El reporte incluye columnas, conteos, inserts
  revertidos, lectura autenticada, comprobación de que `anon` no tiene privilegios
  directos y prueba pública de las tres RPC (candidato, empresa y vacante).
  Reporte: `supabase/verificacion-ultima.txt`.
- **Migración 011 (Talento IA), 21-oct-2026:** agrega `token_publico` a
  `talento_candidatos` (único y fuera del listado público) y las RPC
  `perfil_para_ia_publico` y `postular_con_ia_publica`. El workflow verifica la
  postulación asistida con una vacante de prueba, el token privado y los permisos de
  `anon`. Reporte: `supabase/verificacion-ultima.txt`.
- **Migración 012 (seguridad de Talento), 21-oct-2026:** `guardar_postulacion_publica`
  exige el token del navegador para actualizar un perfil existente (sin token:
  `PT409`), elimina `crear_postulacion_publica`, añade `talento_limites_publicos` +
  `talento_limitar_publico` con topes en la base (`PT429`), y crea los índices
  parciales de las listas públicas. El workflow verifica la RPC nueva, la ausencia de
  la vieja, la tabla de límites y el comportamiento del token en una transacción
  revertida. Reporte: `supabase/verificacion-ultima.txt`.
- **Migración 013 (NCF/e-NCF único), 22-oct-2026:** crea el trigger
  `facturas_ncf_unico` y, si no hay duplicados históricos, el índice único
  `facturas_numero_unico`. El panel ya comprueba el número antes de guardar; la base
  lo refuerza para evitar carreras entre dos pestañas. **Aplicada el 22-oct a las
  14:29 UTC** por el workflow «Migrar base de datos», con prueba de inserciones y RLS
  en verde. Si existieran NCF duplicados de antes, la migración avisa y no crea el
  índice, pero el trigger sigue bloqueando los nuevos.
- Detalles: **`docs/MIGRACIONES.md`**.
- **Contraseña de la base rotada el 19-oct-2026** con la API de administración de
  Supabase: la contraseña vieja quedó invalidada al instante, los secretos de los dos
  repos se actualizaron y el **respaldo + las migraciones quedaron verificados en
  verde** con la clave nueva. Procedimiento: **`docs/ROTAR-CLAVE-BD.md`**.
- **Pruebas completas 19-oct-2026** (con datos simulados, sin tocar la base real): las 12
  secciones del panel (incluidas **Igualas**, **CRM** y **Solicitudes**), factura (con NCF,
  RNC e ITBIS), impresión siempre en claro, vista móvil, login y navegación — **0 errores de consola**.
  Capturas en `capturas-mejora` (14 pantallas), `capturas-crm` (5 pantallas) y
  `capturas-solicitudes` (3 pantallas).
- **Prueba del Auditor SEO** (19-oct, 2ª sesión): 9 pasos con datos simulados — informe,
  velocidad con PageSpeed, historial, borrado, validación, recarga y vista móvil —
  **0 errores de consola**. Script: `docs/pruebas/prueba-seo.js`; capturas en `capturas-seo`
  (6 pantallas).
- **Prueba de Prospección** (19-oct, 3.ª sesión): 9 pasos con datos simulados — búsqueda de
  contactos, guardado como empresa nueva, guardado cuando la empresa ya existe (sin
  duplicarla), salto al CRM, validación, recarga y vista móvil — **0 errores de consola**.
  Script: `docs/pruebas/prueba-prospeccion.js`; capturas en `capturas-prospeccion`
  (7 pantallas).
- **Prueba de la PWA** (19-oct, 4.ª sesión): 5 pasos con datos simulados — service worker
  activo con alcance raíz, recarga bajo su control y **apertura sin conexión** — **0 errores
  de consola**. Script: `docs/pruebas/prueba-pwa.js`; capturas en `capturas-pwa` (2 pantallas).
- **Prueba del Asistente IA** (19-oct, 5.ª sesión): interfaz validada con respuesta simulada
  en escritorio (1440 px) y móvil (390 px), sin desbordes y con **0 errores de consola**.
  Además se probó el modelo real en Cloudflare: respondió en español (`200`). Capturas en
  `capturas-ia` (5 pantallas). El endpoint exige sesión: `401` sin token.
- **Prueba de Solicitudes** (19-oct, 6.ª sesión): 5 pasos con Supabase y Worker simulados —
  bandeja con solicitud pública y completada, alta interna, ejecución de IA, detalle con
  plan/informe/precio y vista móvil — **0 errores de consola**. Script:
  `docs/pruebas/prueba-solicitudes.js`; capturas en `capturas-solicitudes` (3 pantallas).
  El formulario público también se validó en escritorio (1440 px) y móvil (390 px).
- **Prueba del sitio comercial** (21-oct, 11.ª sesión): 9 pasos con el endpoint de
  solicitudes interceptado — portada y secciones, FAQ, páginas legales, preselección
  por necesidad, validación del formulario incompleto, envío con mapeo (`tipo`,
  `urgencia`, presupuesto y consentimiento), confirmación con folio, reinicio, menú
  móvil sin desbordes, `/panel` y redirección `/#crm` → `/panel#crm` — **0 errores de
  consola**. Script: `docs/pruebas/prueba-sitio.js`; capturas en `capturas-sitio`.
- **Prueba de interacción** (21-oct, 12.ª sesión): parallax del hero, canvas de
  partículas sin bloquear clics, pulso al clic, inclinación/brillo/detalle de tarjetas,
  foco de teclado, subrayado de navegación, desplazamiento del icono del botón,
  aparición al scroll, móvil sin desbordes y movimiento reducido (transform `none`,
  contenido visible) — **0 errores de consola**. Script:
  `docs/pruebas/prueba-interaccion.js`; capturas en `capturas-sitio`.
- **Prueba de Talento** (20–21 oct, 8.ª a 10.ª sesión): 12 pasos con Supabase, Storage y
  Worker simulados — panel interno (métricas, candidato, empresa, matching con IA,
  kanban, entrevista, contratación y **mantenimiento de CV**) y portal público (perfil
  anónimo sin correo/teléfono, shortlist, solicitud de entrevista, alta con CV PDF,
  **postulación asistida con IA con token privado**, **actualización con el token del
  navegador** y **rechazo del perfil ajeno sin token**) — **0 errores de consola** y
  vista móvil sin desbordes. Script: `docs/pruebas/prueba-talento.js`; capturas en
  `capturas-talento` (10 pantallas).
- **Verificación de producción de Talento** (21-oct, 8.ª y 9.ª sesión): `/talento`
  responde 200, título «Talento · AviTech Solutions Group»,
  `GET /api/talento/vacantes` y `GET /api/talento/candidatos` devuelven `ok:true`
  (hoy sin registros públicos), el honeypot no crea registros y una ruta de CV inválida
  responde 400. En móvil real (390 px) el documento mide 390 px sin desbordes. En la
  9.ª sesión se confirmaron el asset y el service worker nuevos, la tarjeta
  **Postulación inteligente** visible y deshabilitada porque no hay vacantes
  publicadas, y `POST /api/talento/ia-postular` con `400` ante un token inválido.
  Las dos RPC también se invocaron desde producción con UUID inválidos:
  `perfil_para_ia_publico` devuelve `null` y `postular_con_ia_publica` responde `400`
  con código `22023` («No encontramos tu perfil o la autorización venció»). No se creó
  ningún perfil sintético. Capturas:
  `capturas-talento/08-produccion-escritorio.png`,
  `09-produccion-movil.png` y `10-produccion-ia.png`.
- **Límite de la verificación:** no se ejecutó una postulación real con IA en producción
  porque no hay vacantes públicas abiertas. Las RPC se probaron en una transacción
  revertida durante la migración y el recorrido completo de la interfaz se probó con
  Supabase y Worker simulados; la primera vacante publicada debe probarse con un perfil
  real antes de abrir el portal de forma masiva.
- **QA del rediseño v4** (20-oct, 7.ª sesión): `npm run build` y `npm run lint` limpios;
  las 5 pruebas de humo repitieron en verde y se revisaron visualmente **Login, Inicio,
  Solicitudes (bandeja y detalle), Asistente IA y `/solicitud`** en escritorio (1440 px)
  y móvil (390 px), con **0 errores de consola**. Se corrigió el desborde horizontal de
  Inicio, se movió el acceso móvil del asistente a la cabecera fija, se añadieron
  márgenes de área segura, se destrabaron los subtítulos de pagos y se verificó la
  impresión de factura (sin barra de contexto, sin tarjeta redondeada y a todo el ancho
  imprimible). Capturas en `capturas-solicitudes`: `open-design-login.png` (+ `-movil`),
  `open-design-inicio.png` (+ `-movil`), `open-design-asistente.png`,
  `open-design-solicitud.png` (+ `-movil`), `open-design-factura-impresion.png`,
  `01-bandeja.png`, `02-detalle.png` y `03-movil.png`.

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
- **3.ª y 4.ª sesión (Prospección, PWA y optimizaciones):** sin cambios de base de datos
  (ninguna tocó la base), así que el respaldo de las 6:25 PM UTC sigue siendo el más reciente.
- Cómo restaurar y más detalles: ver **`docs/RESPALDOS.md`**.

## 🎨 Herramientas de diseño (Open Design + UI UX Pro Max)

- El **sistema de diseño** del panel está documentado en **`docs/DESIGN.md`** (tokens,
  componentes, reglas de impresión y checklist). Cualquier cambio visual debe seguirlo.
- **Open Design** es la referencia visual vigente: el proyecto está vinculado al sistema
  **Mastercard** («fintech cálido») y a la plantilla **`dashboard`** mediante
  **`.open-design.json`**. El rediseño v4 se implementó con esa guía.
- Quedó instalado el skill **UI UX Pro Max** (19-oct): motor de estilos, paletas por
  industria, tipografías, guías de UX y checklist de entrega.
  - **Global** (funciona en todo OpenCode): `C:\Users\User\.opencode\skills\`
  - **En el proyecto**: `avitech-panel\.opencode\skills\` (ignorado por Git; se reinstala
    con `npx ui-ux-pro-max-cli init --ai opencode`)
  - Requiere **Python 3.12**; en esta sesión Python no estuvo disponible en el PATH, así
    que se usó la guía de respaldo y Open Design.
- Uso: pedir en OpenCode cualquier tarea de interfaz («revisa esta pantalla», «mejora este
  formulario», «haz este reporte más claro») y el skill se activa solo.

## ⚠️ Reglas de oro

1. Ningún limpiador de disco ni antivirus debe tocar `C:\Users\User\avitech`.
2. No borrar `node_modules` a mano: si algo se daña, se repara con `npm ci`.
3. El `.env` normal vive solo en este PC (Git lo ignora). El `.env.production` SÍ va
   en el repo y solo puede contener la clave "publishable" (pública por diseño);
   nunca poner ahí secretos reales (contraseñas, service keys).

## 📋 Próximos pasos

- **Publicado (14.ª sesión, `062b7d0`):** la portada rediseñada ya está en producción. Siguen pendientes los datos de contacto, el dominio propio y Telegram.

1. **Solicitudes con IA (hecho, 6.ª sesión):** formulario público `/solicitud`, bandeja
   interna y cierre automático con IA. Migración 009 y endpoints verificados en producción.
   Pendiente: probar una solicitud real desde el panel y decidir si se agrega **Turnstile**
   o aprobación humana antes del cierre.
2. **Rediseño de la interfaz (hecho, 20-oct):** se mantuvo el panel actual (React), sin
   migrar a Flutter. Entregado el tema **v4 «Open Design · Mastercard»** (ver
   `docs/DESIGN.md`) y las pruebas en verde. Pendiente: tu visto bueno y ajustes finos de
   gusto (intensidad del naranja, densidad, tamaños).
3. Confirmar el respaldo automático del lunes 26-oct (~1:00 PM, hora de República
   Dominicana = 17:00 UTC). Los del 19-oct se hicieron manuales (1:04 PM, 1:42 PM y
   2:25 PM) y quedaron verificados.
4. Revisar en Supabase → **Account → Access Tokens** y borrar el token
   `cli_User@ThinkBook-15IIL_1792390971` (se creó el 19-oct solo para rotar la
   contraseña; ya no hace falta). En este PC ya no queda copia.
5. Completar los datos fiscales de AviTech en `src/lib/empresa.ts` (razón social, RNC,
   dirección, teléfono y correo) y, cuando estén, conectar el **e-CF** con el certificado
   digital de DGII (ver `docs/FACTURACION.md`).
6. CRM fase 2: recordatorios de actividades atrasadas (correo o notificación), sincronización
   de correo/WhatsApp y resúmenes con IA (evaluar costo antes de activar).
7. Auditor SEO fase 2 (solo si algún día se decide pagar): palabras clave, backlinks y
   seguimiento de posiciones con OpenSEO hospedado (US$10/mes) o DataForSEO (recarga mínima
   US$50). Hoy: no pagar.
8. Prospección fase 2 (solo si se pide): rastrear más páginas por sitio, exportar los
   hallazgos a CSV y marcar empresas ya descartadas.
9. **Solicitudes fase 2:** editar el informe dentro del panel, adjuntos, envío de correo
   desde el panel (si hay proveedor gratuito) y aprobación humana opcional.
10. Ideas para después: portal de solo lectura para que cada cliente vea su estado de cuenta,
    recordatorios de vencimientos y más analítica del tablero.
11. **Asistente IA fase 2 (opcional):** contexto automático de la sección o del cliente con
    permiso explícito, historial por usuario con RLS, respuestas en streaming y voz. Evaluar
    privacidad y consumo antes de activar.
12. **Talento fase 2:** lo hecho en la 10.ª sesión (token obligatorio para editar,
    límites en base, limpieza de CV huérfanos y aviso de solicitudes de empresa en el
    Resumen) cubre buena parte de esta lista. Sigue pendiente: añadir **Turnstile** o
    un secreto de servidor a los formularios públicos y a la subida de CV (requiere
    claves de Cloudflare), verificar el correo con un código de un solo uso antes de
    permitir la edición desde otro dispositivo (requiere proveedor de correo) y
    permitir que la empresa dé seguimiento a su propia solicitud sin crear cuentas.
    Ideas para superar al mercado: ver la lista de ventajas competitivas en
    **`docs/TALENTO.md`** (sección «Ideas para diferenciarse»).
13. **Sitio comercial (hecho y publicado, 11.ª sesión):** portada en `/`, panel en
    `/panel`, formulario conectado al flujo de solicitudes, SEO técnico, FAQ,
    privacidad/términos, alertas opcionales por Telegram y prueba en verde (publicado
    en `353e4da` y ampliado después). Pendiente: cargar **teléfono, correo y WhatsApp
    reales** (`VITE_*`), definir el **dominio** (canonical, `robots.txt`,
    `sitemap.xml`), revisar los rangos de precios. Imagen Open Graph hecha: `og-image.svg`
    rasterizada a `og-image.png` (1200×630) porque WhatsApp/Facebook/LinkedIn no muestran
    SVG; `index.html` apunta al PNG.
    Guía de lanzamiento: **`docs/LANZAMIENTO.md`**; manual comercial:
    **`docs/COMERCIAL.md`**.
14. **Rediseño interactivo (12.ª sesión, 21-oct):** hero con partículas/parallax/
    clic, tarjetas 3D, scroll reveal y microinteracciones. **Publicado el 22-oct** con
    la compilación `avitech-v2026-10-22-auditoria`. El modelo de IA se cambia con
    `IA_MODELO` (ver **`docs/IA-MODELOS.md`**).
15. **Correcciones de auditoría (13.ª sesión, 22-oct):** publicadas en el commit
    `6961fa1`: enlaces al panel, canónica de Talento, 404 real, presupuesto
    dominicano, NCF único (013), fechas/URLs, descargas, sesión, iconos PWA y
    cabeceras `_headers`. Verificado en producción: portada, `/panel`, `/talento`,
    legales, PWA y 404. La migración 013 quedó aplicada y el reporte
    `supabase/verificacion-ultima.txt` se actualizó con la prueba de inserciones y RLS
    sin errores; el workflow terminó con éxito.
