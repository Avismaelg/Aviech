# Pruebas de navegador

> Nueve pruebas de humo con **datos simulados** (Playwright): no tocan la base real de Supabase
> ni Google, y no contienen secretos.

## Sitio comercial (`prueba-sitio.js`)

Prueba de humo de la portada pública con **datos simulados**: intercepta
`**/api/solicitudes` para no escribir en la base real. No necesita sesión ni secretos.

**Qué comprueba:** portada y secciones (4 servicios, 6 necesidades, 4 paquetes, 8
preguntas frecuentes y 3 demostraciones), páginas legales (`/privacidad` y
`/terminos`), preselección del servicio al pulsar una necesidad, validación del
formulario incompleto, envío con el mapeo interno (`tipo`, `urgencia`, presupuesto,
consentimiento y honeypot), confirmación con folio real, reinicio del formulario, menú
móvil sin desbordes a 390 px, panel en `/panel` y redirección de `/#crm` a
`/panel#crm`. Devuelve JSON con `ok`, 9 pasos y los errores de consola (debe ser `[]`).

**Cómo ejecutarla:** compila, levanta la vista previa en el puerto 5181 y ejecuta el
archivo con un runner de Playwright que lo evalúe como `async (page)`. Capturas en
`C:\Users\User\avitech\capturas-sitio`.

> La vista previa de Vite no aplica `_redirects`: ahí las rutas desconocidas muestran el
> componente React de respaldo con `noindex`. El **404 HTTP real** se comprueba con
> `wrangler dev` (por ejemplo, `curl -I http://127.0.0.1:8787/ruta-que-no-existe`).

## Página de ejemplo (`prueba-ejemplo.js`)

Prueba de humo de la demo aislada **`/ejemplo/securify`** (plantilla de referencia con
datos ficticios). No toca la base ni la API.

**Qué comprueba:** título e idioma propios, `noindex`, los tres titulares, el video de
fondo (autoplay, loop, muted y playsInline) reproduciéndose, la navegación en píldoras,
las tres estadísticas, el ocultado de enlaces en móvil, cero desbordes a 1440 y 390 px y
la pausa del video con `prefers-reduced-motion`. Devuelve JSON con `ok`, los pasos y los
errores de consola (debe ser `[]`). Capturas en `C:\Users\User\avitech\capturas-ejemplo`
(2 imágenes).

**Cómo ejecutarla:** igual que las anteriores: compila, levanta la vista previa en el
puerto 5181 y ejecútala con el runner de Playwright.

## Interactividad (`prueba-interaccion.js`)

Prueba de humo del rediseño interactivo del sitio: hero con partículas, bóveda 3D, botón magnético, línea de proceso y parallax,
tarjetas 3D, navegación, botones, aparición al scroll, móvil y movimiento reducido.
No necesita datos ni credenciales.

**Qué comprueba:** el canvas de partículas tiene tamaño y no bloquea clics; el parallax
cambia `--px`/`--py` al mover el ratón; el clic activa `data-reaccion`; la tarjeta se
inclina y muestra brillo/detalle con hover y con foco de teclado; la bóveda gira con el puntero, las fichas responden a su profundidad, el botón magnético se desplaza y vuelve, la línea de proceso avanza con el scroll, el filete de la tarjeta se revela; la navegación muestra
su subrayado; el botón desplaza su icono; la sección de paquetes no se revela hasta
entrar en pantalla y luego queda visible; móvil a 390 px sin desbordes; con
`prefers-reduced-motion` todo el contenido está visible, la bóveda y el botón quedan sin movimiento, la línea de proceso aparece completa y los transforms quedan en
`none`. Devuelve JSON con `ok`, los pasos y los errores de consola (debe ser `[]`).

**Cómo ejecutarla:** igual que las anteriores: compila, levanta la vista previa en el
puerto 5181 y pide en OpenCode `docs/pruebas/prueba-interaccion.js` con la herramienta
de Playwright (`browser_run_code_unsafe`, parámetro `filename`). Capturas en
`C:\Users\User\avitech\capturas-sitio` (`21` a `24`).

## CRM (`prueba-crm.js`)

Prueba de humo del módulo CRM con **datos simulados**. No toca la base real de Supabase
ni necesita credenciales: intercepta `**/rest/v1/**` y `**/auth/v1/**` y usa una sesión
falsa. No contiene secretos reales.

**Qué comprueba:** carga del pipeline, métricas, creación de oportunidad, cambio de etapa,
creación de empresa, conversión a cliente, creación de contacto, creación/completado de
actividades, búsquedas y estado vacío. Al final devuelve un JSON con `ok`, los pasos y
los errores de consola (debe ser `[]`).

**Cómo ejecutarla:**

1. Compila y levanta una vista previa en un puerto libre:

   ```powershell
   cd C:\Users\User\avitech\avitech-panel
   npm run build
   npm run preview -- --port 5181 --strictPort
   ```

2. En OpenCode, pide ejecutar `docs/pruebas/prueba-crm.js` con la herramienta de Playwright
   (`browser_run_code_unsafe`, parámetro `filename`).

3. Las capturas se guardan en `C:\Users\User\avitech\capturas-crm` (5 imágenes). Si usas
   otra ruta, ajusta la constante `CAPTURAS` al inicio del script.

**Nota:** el script asume que la app se sirve en `http://localhost:5181` (sitio en `/`,
panel en `/panel`). Si usas otro puerto, cambia la constante `BASE`.

## Auditor SEO (`prueba-seo.js`)

Prueba de humo del **Auditor SEO** con datos simulados: intercepta `**/rest/v1/**`,
`**/auth/v1/**`, `**/api/seo/auditar**` (la API del Worker) y `**/pagespeedonline/**` (la
medición de velocidad de Google).

**Qué comprueba:** estado vacío, auditoría con informe completo (puntaje, comprobaciones y
sitemap), medición de PageSpeed y su guardado, segunda auditoría con hallazgos, eliminación
con confirmación, validación de direcciones inválidas, recarga con enlace profundo
(`/panel#seo`) y vista móvil. Devuelve JSON con `ok`, los pasos y los errores de consola (debe ser `[]`).

**Cómo ejecutarla:** igual que la del CRM (arriba): compila, levanta la vista previa en el
puerto 5181 y pide en OpenCode `docs/pruebas/prueba-seo.js` con la herramienta de Playwright
(`browser_run_code_unsafe`, parámetro `filename`). Las capturas se guardan en
`C:\Users\User\avitech\capturas-seo` (6 imágenes).

## Prospección (`prueba-prospeccion.js`)

Prueba de humo de **Prospección** (contactos de una web → CRM) con datos simulados:
intercepta `**/rest/v1/**`, `**/auth/v1/**` y `**/api/scraper/contactos**` (la API del Worker).

**Qué comprueba:** estado vacío, búsqueda de contactos (correos, teléfonos y redes con sus
páginas de origen), guardado en el CRM como **empresa nueva** (verifica el payload enviado a
Supabase), salto al CRM con «Ver en el CRM», guardado cuando la **empresa ya existe** (no
duplica la empresa y avisa con «Ya tienes …»), validación de direcciones inválidas sin llamar
a la API, recarga con enlace profundo (`/panel#prospeccion`) y vista móvil. Devuelve JSON con `ok`,
los pasos y los errores de consola (debe ser `[]`).

**Cómo ejecutarla:** igual que las anteriores: compila, levanta la vista previa en el puerto
5181 y pide en OpenCode `docs/pruebas/prueba-prospeccion.js` con la herramienta de Playwright
(`browser_run_code_unsafe`, parámetro `filename`). Las capturas se guardan en
`C:\Users\User\avitech\capturas-prospeccion` (7 imágenes).

## Talento (`prueba-talento.js`)

Prueba de humo del módulo **Talento** con datos simulados: intercepta `**/rest/v1/**`,
`**/auth/v1/**`, `**/storage/v1/**` y `**/api/talento/**`. No usa la base real, no llama a
Workers AI y no contiene secretos.

**Qué comprueba:** panel interno (métricas, alta de candidato, alta de empresa, matching
con IA y alta al pipeline, cambio de etapa a entrevista, cierre como contratado y
**mantenimiento de CV huérfanos**), portal público (perfiles anónimos sin correo ni teléfono,
shortlist, solicitud de entrevista de una empresa, alta de candidato con CV PDF y
consentimiento, **postulación asistida con IA con token privado y máximo de 3**,
**actualización del propio perfil con el token del navegador** y **rechazo del perfil ajeno
sin token** con el aviso «Ese correo ya tiene un perfil») y vista móvil a 390 px. Al final
devuelve un JSON con `ok`, los pasos y los errores de consola (debe ser `[]`).

**Cómo ejecutarla:** igual que las anteriores: compila, levanta la vista previa en el puerto
5181 y pide en OpenCode `docs/pruebas/prueba-talento.js` con la herramienta de Playwright
(`browser_run_code_unsafe`, parámetro `filename`). Las capturas se guardan en
`C:\Users\User\avitech\capturas-talento` (10 imágenes; `08-portal-ia.png` muestra el
resultado de la IA, `09-perfil-protegido.png` el aviso del token y `10-mantenimiento-cv.png`
la limpieza de CV).

## PWA sin conexión (`prueba-pwa.js`)

Prueba de humo del **service worker** (PWA) con la app compilada; no usa Supabase ni datos
reales. Desactiva la red del navegador un momento (la vuelve a activar al terminar).

**Qué comprueba:** que el service worker se registre con alcance raíz, que la recarga quede
bajo su control y que, **sin conexión**, el panel siga abriendo (se ve el acceso) sin errores
de consola. Devuelve JSON con `ok`, los pasos y los errores (debe ser `[]`).

**Cómo ejecutarla:** igual que las anteriores: compila, levanta la vista previa en el puerto
5181 y pide en OpenCode `docs/pruebas/prueba-pwa.js` con la herramienta de Playwright
(`browser_run_code_unsafe`, parámetro `filename`). Las capturas se guardan en
`C:\Users\User\avitech\capturas-pwa` (2 imágenes).

## Solicitudes (`prueba-solicitudes.js`)

Prueba de humo de **Solicitudes** con datos simulados: intercepta `**/rest/v1/**`,
`**/auth/v1/**` y `**/api/solicitudes/ejecutar**`. No usa la base real, no llama a
Workers AI y no contiene secretos.

**Qué comprueba:** carga de la bandeja con una solicitud pública y una completada,
creación de una solicitud interna, ejecución simulada de la IA (la fila pasa a
**Completada**), apertura del detalle con plan, informe y precio sugerido, y vista móvil
a 390 px. Al final devuelve un JSON con `ok`, los pasos y los errores de consola
(debe ser `[]`).

**Cómo ejecutarla:**

1. Compila y levanta la vista previa en el puerto **5182**:

   ```powershell
   cd C:\Users\User\avitech\avitech-panel
   npm run build
   npm run preview -- --port 5182 --strictPort
   ```

2. Pide en OpenCode `docs/pruebas/prueba-solicitudes.js` con la herramienta de Playwright
   (`browser_run_code_unsafe`, parámetro `filename`).

3. Las capturas se guardan en `C:\Users\User\avitech\capturas-solicitudes` (3 imágenes:
   bandeja, detalle y móvil). Si usas otro puerto, cambia `BASE` al inicio del script.
