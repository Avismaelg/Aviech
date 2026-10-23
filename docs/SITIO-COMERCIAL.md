# Sitio comercial

Portada pública de AviTech Solutions Group para presentar y vender servicios de
digitalización empresarial. Vive en la **raíz `/`**; el panel interno se movió a
**`/panel`** y los enlaces antiguos (`/#crm`, `/#talento`…) redirigen solos.

| Ruta | Qué es |
|---|---|
| `/` | Sitio comercial (esta guía) |
| `/panel` | Panel interno con login |
| `/solicitud` | Formulario público detallado de solicitudes |
| `/talento` | Portal público de talento |
| `/privacidad` | Política de privacidad |
| `/terminos` | Términos del servicio |

Cualquier otra ruta devuelve `404.html` con **estado HTTP 404** y `noindex`; `_redirects`
sirve la portada con 200 solo para las rutas conocidas. El formulario acepta el
presupuesto en formato dominicano (`1.500,50`, `40,000` o `40000`) y lo envía como
número; el máximo es RD$999,999,999.99.

## Estructura

1. **Portada:** mensaje principal, subtítulo, botones y una composición visual de
   producto (navegador, panel y aviso de solicitud).
2. **Soluciones:** cuatro servicios con problema, descripción, entregables, cliente
   ideal y botón que preselecciona el servicio en el formulario.
3. **Por necesidad:** seis situaciones frecuentes que llevan al formulario con el
   servicio ya elegido.
4. **Proceso:** diagnóstico, propuesta, desarrollo/pruebas y entrega/capacitación.
5. **Portafolio:** tres demostraciones funcionales construidas por AviTech (panel,
   portal de talento y formulario con IA). Están marcadas como demostraciones y el
   texto aclara que no son clientes, testimonios ni resultados comerciales.
6. **Sobre AviTech:** equipo multidisciplinario en desarrollo, sin certificaciones ni
   clientes inventados.
7. **Paquetes:** Presencia Digital, Empresa Digital, Automatización Empresarial y
   Mantenimiento, con rangos en RD$, entregables y nota de que no son cotizaciones
   vinculantes. Hosting, dominio, licencias y APIs se cotizan aparte.
8. **Preguntas frecuentes:** ocho respuestas sobre precios, plazos, pagos, trabajo
   remoto, datos y soporte.
9. **Contacto:** formulario con nombre, empresa, correo, teléfono, servicio,
   descripción, plazo, presupuesto orientativo y consentimiento. El botón de WhatsApp
   solo aparece si hay número configurado. Incluye enlace a la política de privacidad.
10. **Pie:** enlaces, accesos al panel/portal, aviso de precios de referencia y enlaces
    a privacidad y términos.
11. **Páginas legales:** `/privacidad` y `/terminos`, con el detalle del tratamiento de
    datos y las condiciones generales del servicio.

## Contenido editable

Todo el texto repetido vive en **`src/lib/sitio.ts`**:

- `SERVICIOS`: nombre, problema, descripción, entregables, cliente ideal, tipo interno
  y número.
- `NECESIDADES`: etiqueta y servicio al que apunta.
- `PROCESO`: cuatro pasos.
- `DEMOS`: nombre, descripción, etiquetas, enlace y tipo de miniatura.
- `PAQUETES`: nombre, rango, sufijo opcional (`por mes`), resumen, incluye, cliente
  ideal, servicio y si va destacado.
- `PLAZOS_CONTACTO`: etiqueta y urgencia interna.
- `ROLES`: perfiles del equipo.
- `CONTACTO` y `SITIO`: canales y datos generales.

Los componentes están en `src/components/sitio/` (`SitioPublico.tsx`,
`Secciones.tsx`, `Contacto.tsx` y `estilos.ts`). No se editan precios ni servicios en
los componentes.

## Formulario y persistencia

El formulario envía a **`POST /api/solicitudes`**, el mismo endpoint del formulario
público existente. No se creó una tabla ni un backend nuevo. El Worker valida,
aplica el límite por IP, ejecuta la IA en segundo plano y devuelve un folio real; la
confirmación solo aparece si la API responde `ok: true`.

Mapeo al modelo actual:

| Formulario comercial | Campo interno |
|---|---|
| Servicio de interés | `tipo` (`implementacion` para web/portales/automatización; `consultoria` para soporte) |
| Nombre + empresa | `titulo` (`Servicio — Empresa`) |
| Descripción + servicio + plazo + presupuesto | `descripcion` |
| Servicio, plazo y presupuesto | `objetivos` |
| Plazo | `urgencia` (`alta`, `media` o `baja`) |
| Presupuesto orientativo | `presupuesto` (número en RD$) |
| Consentimiento | `consentimiento: true` |
| Campo oculto `website` | honeypot anti-spam |

Estados del brief y equivalencia con los existentes: **Nueva** → `nueva`; **En
revisión / IA trabajando** → `analizando`; **Requiere información** → `error` (con
nota del equipo); **Propuesta enviada / Aceptada / Cerrada** → `completada`;
**Rechazada** → `rechazada`. No se agregaron estados nuevos para no modificar la base
en esta fase.

### Aviso interno por Telegram (opcional y gratis)

Para que el equipo se entere de una solicitud sin tener que revisar el panel, el
Worker puede enviar un resumen a un chat privado de Telegram. Solo se activa si existen
los secretos `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`; si faltan, no pasa nada y el
formulario funciona igual. La alerta incluye folio, nombre, empresa, servicio,
presupuesto, contacto, un resumen del problema y el enlace directo a
`/panel#solicitudes`. Se envía en segundo plano (`waitUntil`), así que no retrasa la
respuesta al visitante ni bloquea el guardado.

Los pasos para crear el bot y configurar los secretos están en
**`docs/LANZAMIENTO.md`**. El token **nunca** se guarda en el repositorio.

## Canales de contacto configurables

Los datos reales no están en el repositorio. Se configuran con variables públicas
(nombre solamente; los valores quedan fuera de Git):

| Variable | Uso |
|---|---|
| `VITE_WHATSAPP` | Número con código de país y solo dígitos (`18095551234`). Muestra el botón flotante y el enlace del formulario |
| `VITE_CONTACTO_CORREO` | Correo comercial |
| `VITE_CONTACTO_TELEFONO` | Teléfono comercial |
| `VITE_SITIO_URL` | Dominio público para canonical/JSON-LD (sin barra final) |
| `VITE_SUPABASE_URL` | Proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave publicable (pública por diseño) |

Si un canal está vacío, **no se muestra**; el formulario sigue siendo el canal
principal. `EMPRESA.correo` y `EMPRESA.telefono` en `src/lib/empresa.ts` también
sirven como respaldo. No inventar números ni correos.

## Diseño y accesibilidad

- Paleta: marino `#003B72`, azul eléctrico `#007BFF`, blanco, gris grafito `#1A1A1A`
  y verde `#21C063` con moderación.
- Los textos pequeños usan `electrico-texto` (`#005FCC`) para superar el contraste AA
  sobre blanco; el azul brillante queda para iconos, bordes y el titular grande.
- Tipografía Sofia Sans (la misma del panel). Formas redondeadas, cuadrícula técnica
  sutil en el hero y animaciones discretas.
- Foco visible azul, enlaces con `:focus-visible`, menú móvil con `aria-expanded` y
  cierre con `Escape`, formulario con etiquetas, `aria-invalid`, `aria-describedby` y
  resumen de error con `role="alert"`.
- `prefers-reduced-motion` desactiva el desplazamiento suave.
- Responsive probado a 390, 768, 1024 y 1440 px sin desbordes horizontales.

## Interactividad

- **Hero:** canvas de partículas y conexiones (24 en móvil/equipos ligeros, 52 en
  escritorio), bóveda 3D que gira con el puntero y fichas con profundidad, glows con parallax
  de scroll limitado y pulso al hacer clic. Sin Three.js: CSS 3D, canvas y
  `requestAnimationFrame`.
- **Tarjetas:** inclinación sutil, brillo radial que sigue al cursor y una línea de
  detalle en hover/foco. En pantallas táctiles el detalle queda visible y la
  inclinación se desactiva.
- **Scroll:** aparición moderada de secciones con `IntersectionObserver` (solo una vez).
- **Botones/navegación:** subrayado degradado en la nav, press visible y desplazamiento
  breve del icono.
- **Rendimiento y accesibilidad:** el canvas se pausa fuera de pantalla o con la
  pestaña oculta; con `prefers-reduced-motion`, puntero táctil o equipos de pocos
  recursos se reducen o desactivan los efectos; todos los listeners y frames se
  limpian al desmontar.
- **Validación:** `docs/pruebas/prueba-interaccion.js` y la prueba del sitio. El
  rediseño interactivo está en **local, pendiente de autorización para publicar**.

## SEO técnico

- `index.html`: título, descripción, `og:title`, `og:description`, `og:locale` y
  `theme-color`.
- La portada agrega canonical y datos estructurados `Organization` al montar. La URL
  sale de `VITE_SITIO_URL` (con el dominio de `workers.dev` como respaldo).
- `public/robots.txt` permite el sitio y bloquea `/panel`.
- `public/sitemap.xml` declara `/`, `/talento`, `/privacidad` y `/terminos`.
- El panel agrega `noindex` y el formulario `/solicitud` ya lo hace.
- Pendiente: dominio propio (actualizar `VITE_SITIO_URL`, `robots.txt`, `sitemap.xml` y
  la canonical) y prerender/SSR si se quiere SEO de contenido a gran escala. La imagen
  Open Graph ya está lista: `public/og-image.png` (rasterizado de `og-image.svg` con Edge
  headless, 1200×630) porque WhatsApp/Facebook/LinkedIn no muestran SVG.

## PWA y rutas del panel

- El manifest abre en **`/panel`**; el service worker cachea `/`, `/panel` y el
  armazón. Versión: `avitech-v2026-10-21-interactivo`.
- `main.tsx` carga solo el paquete de la ruta (`SitioPublico`, `App`,
  `SolicitudPublica` o `TalentoPublico`).
- Enlaces antiguos del panel: si la ruta es `/` y el hash es una sección conocida
  (`#crm`, `#talento`, `#solicitudes`…), redirige a `/panel#seccion`. La portada usa
  `#portada`, `#soluciones`, `#necesidades`, `#proceso`, `#portafolio`, `#nosotros`,
  `#paquetes` y `#contacto`, que no chocan con las secciones del panel.

## Cómo ejecutar en Windows

```powershell
cd C:\Users\User\avitech\avitech-panel
npm install
npm run dev        # http://localhost:5173 (el formulario necesita el Worker o el mock de la prueba)
```

Para probar la compilación real:

```powershell
npm run build
npm run preview -- --port 5181 --strictPort
npm run lint
```

El formulario público solo guarda de verdad cuando el Worker está desplegado (o se
usa el mock de `docs/pruebas/prueba-sitio.js`); en `vite dev`/`preview` sin Worker la
API no existe.

## Pruebas

`docs/pruebas/prueba-sitio.js` recorre la portada, cuenta servicios/necesidades/
paquetes, comprueba que una necesidad preselecciona el servicio, valida el formulario
incompleto, envía una solicitud con el endpoint interceptado, verifica el mapeo
(`tipo`, `urgencia`, `presupuesto`, consentimiento y honeypot), comprueba la
confirmación con folio, el reinicio, el menú móvil sin desbordes, las páginas legales,
`/panel` y la redirección `/#crm` → `/panel#crm`. Resultado esperado: `ok: true`,
9 pasos, `errores: []`.

## Pendientes

1. Cargar teléfono, correo y WhatsApp reales (hoy los canales están ocultos).
2. Definir el dominio definitivo y actualizar `VITE_SITIO_URL`, `robots.txt` y
   `sitemap.xml`.
3. Revisar la política de privacidad y los términos con un abogado antes de usarlos con
   clientes reales; son un borrador operativo, no asesoría legal.
4. Sustituir o ampliar las demostraciones cuando existan casos comerciales reales
   (con autorización del cliente).
5. ~~Imagen Open Graph (1200×630) para compartir en redes.~~ Hecho el 21-oct: `og-image.svg` + `og-image.png` (PNG en las meta tags; el SVG no se renderiza en WhatsApp/Facebook/LinkedIn).
6. Revisar los rangos de precios y las condiciones de pago (50/50, garantía de 30 días)
   con el equipo antes de publicarlos.
7. **Publicado el 21-oct-2026 (commit `353e4da`)**: `git push` a `main` compila y
   publica; alternativa manual: `npm run build` + `npx wrangler deploy`.
8. Activar el aviso por Telegram si se quiere respuesta inmediata a cada solicitud
   (ver `docs/LANZAMIENTO.md`).
9. **Rediseño interactivo (12.ª sesión):** hero con partículas/parallax/clic, tarjetas
   3D, scroll reveal y microinteracciones. Está en local, **sin publicar**; requiere
   el visto bueno del usuario. La validación está en
   `docs/pruebas/prueba-interaccion.js`.
10. **Modelo de IA configurable:** `IA_MODELO` global y overrides por función; ver
    `docs/IA-MODELOS.md`.
