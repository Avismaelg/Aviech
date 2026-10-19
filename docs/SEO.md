# Auditor SEO (módulo del panel)

> Integrado en el panel el 19-oct-2026. Costo: **US$0** (sin claves ni suscripciones).

## Qué hace

Analiza una página como la ve un buscador y devuelve un informe con **puntaje 0–100** y
comprobaciones en tres grupos:

- **Contenido**: título, meta descripción, encabezado H1, cantidad de texto, imágenes con
  texto alternativo (`alt`), enlaces internos y datos estructurados (schema.org).
- **Técnico**: HTTPS, código HTTP, adaptación a móviles (viewport), URL canónica, meta robots
  (`noindex`), Open Graph e idioma declarado.
- **Archivos del sitio**: `robots.txt` y `sitemap.xml`.

Además, con el botón **Velocidad** mide la página con **PageSpeed Insights de Google** (móvil):
rendimiento, SEO, accesibilidad y buenas prácticas, con **LCP** y **CLS**. Es gratis y se
ejecuta desde el navegador.

Cada informe queda guardado en la tabla `seo_auditorias` (historial) y se puede ver, volver a
medir, reanalizar o eliminar. El historial conserva el JSON completo del informe (columna `datos`).

## Cómo se usa

1. Abre el panel → **Auditor SEO** (o directo: `https://aviech.avismael-eg.workers.dev/#seo`).
2. Escribe la dirección (`tusitio.com` o `https://tusitio.com/pagina`) y pulsa **Analizar sitio**
   (tarda unos segundos).
3. Revisa los hallazgos: verde = bien, ámbar = mejorable, rojo = corregir.
4. Pulsa **Velocidad** para medir PageSpeed (~20 s) y **Reanalizar** cuando hagas cambios en el sitio.

Consejos:

- El análisis es de **una página**, no rastrea el sitio completo; para varias páginas repite por URL.
- El puntaje es una guía interna de buenas prácticas, no el ranking real en Google.

## Cómo funciona por dentro

- **API**: `worker/index.js`, el mismo Worker de Cloudflare que publica el panel, atiende
  `/api/seo/auditar?url=...`: descarga la página en el servidor (sin problemas de CORS), con
  agente propio y límite de 15 segundos; analiza el HTML, `robots.txt` y `sitemap.xml`; y
  devuelve el informe en JSON.
- **Seguridad**: la API **exige el token de sesión de Supabase** (`Authorization: Bearer …`);
  sin él responde `401`. El historial vive en `seo_auditorias` con RLS (solo autenticados).
- **Puntaje**: cada comprobación aporta un peso; el puntaje es lo obtenido sobre el total
  (0–100). Insignias: verde ≥ 80, ámbar ≥ 50, rojo < 50.
- **PageSpeed**: se pide a `googleapis.com/pagespeedonline` desde el navegador (la API permite
  CORS) y **no requiere clave**. Si Google limita por uso (`429`), el panel lo avisa.
- **Límites del plan gratis**: el Worker analiza hasta **400 000 caracteres** de HTML (protege
  los 10 ms de CPU del plan gratuito de Cloudflare); en páginas enormes se analiza el inicio y
  se avisa en el informe. En `wrangler.jsonc` la ruta `/api/*` está declarada con
  `run_worker_first` para que la atienda el Worker y no el sitio estático.

## Costo

**US$0 adicionales.** No usa DataForSEO ni ninguna API de pago:

- La descarga y el análisis del HTML corren en el Worker (plan gratis de Cloudflare).
- PageSpeed Insights es gratis, sin clave (con uso muy intensivo, Google puede limitar
  temporalmente).
- Hosting y base de datos ya formaban parte del panel.

**Si algún día se quiere más** (palabras clave, backlinks, ranking, competidores), eso sí
requiere datos de pago: la vía natural sería contratar **OpenSEO hospedado** (US$10/mes) o una
clave **DataForSEO** (recarga mínima US$50) y mostrar sus resultados como fase 2. Decisión
actual: no pagar.

## Atribución

La idea del flujo «auditoría de sitio» sigue a **OpenSEO**
([`every-app/open-seo`](https://github.com/every-app/open-seo), licencia **MIT**), alternativa
open source a Semrush/Ahrefs. El código de este módulo (Worker, interfaz y tabla) es propio del
panel; no se copió código de OpenSEO.

## Prueba

- **Automática, con datos simulados**: `docs/pruebas/prueba-seo.js` (instrucciones en
  `docs/pruebas/README.md`). Verifica informe, velocidad, historial, borrado, validación,
  recarga y vista móvil; deja 6 capturas en `capturas-seo`.
- **Real (producción)**: abre el módulo y analiza un sitio conocido; por ejemplo, `example.com`
  da un puntaje bajo (página mínima) y un sitio cuidado sube a 80+.
