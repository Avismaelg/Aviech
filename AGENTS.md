# AGENTS.md — AviTech (avitech-panel)

Repositorio git: `avitech-panel/` (la carpeta padre `avitech/` no es git). Interfaz, textos y documentación en español (salvo la portada Orbit, que es en inglés); montos en **RD$**.

## Reglas que el usuario fijó
- No publicar, hacer push ni desplegar sin autorización explícita. **El push a `main` despliega solo en Cloudflare** (`docs/PUBLICAR-CLOUDFLARE.md`).
- No `force push`. El README conserva el título «Aviech — Startup de auditoría y consultoría».
- Presupuesto ≤ US$10/mes. Sin Docker, VM, base de datos local ni servicios de pago.
- El panel interno no tiene registro público. Los formularios públicos solo crean registros, nunca cuentas.
- No imprimir ni copiar secretos (`SUPABASE_DBURL`, `TELEGRAM_*`, claves de servicio). La clave publicable de `.env.production` y de `wrangler.jsonc` es pública por diseño.

## Comandos
- `npm install` y `npm run dev`.
- Para ver la portada **Orbit** en local usa `npx wrangler dev` (o abre `/orbit/` en la vista previa): `npm run dev` mantiene la entrada React de Vite para desarrollar el panel.
- `npm run build` = `tsc -b && vite build`. Debe pasar antes de cualquier entrega.
- `npm run lint` = `oxlint` (`.oxlintrc.json`; `docs/**` está ignorado).
- Vista previa para pruebas: `npm run preview -- --port 5181 --strictPort`. Reinícialo después de cada build: un servidor que ya ocupa ese puerto puede seguir sirviendo el build anterior.
- Worker local: `npx wrangler dev`. Es la única forma de probar `_redirects` y el 404 real; la vista previa de Vite no los aplica.
- Despliegue manual (solo con autorización): `npm run build` y luego `npx wrangler deploy`.
- Migraciones: `supabase/sql/NNN_nombre.sql`, en orden numérico. Un push que cambie `supabase/sql/**` ejecuta «Migrar base de datos» con el secreto `SUPABASE_DBURL`, que escribe `supabase/verificacion-ultima.txt` con commit `[skip ci]`. No edites ese reporte a mano.

## Mapa del código
- `src/main.tsx`: rutas con `lazy`. `/` ya no se sirve desde React: la portada es `public/orbit/index.html` (HTML estático servido por el Worker). `/panel` panel (requiere sesión), `/solicitud`, `/talento`, `/privacidad`, `/terminos` y `/ejemplo/securify` (demo aislada). Los enlaces antiguos `/#seccion` se redirigen a `/panel#seccion` desde el script de compatibilidad de Orbit.
- `public/orbit/index.html`: landing estática **Orbit** servida en `/`; no comparte estilos ni tokens con React. `app.html` es el armazón React que sirve las rutas de la SPA (Vite lo emite como `dist/app.html`; `_redirects` lo sirve en `/app`).
- `src/components/sitio/`: sitio comercial AviTech. `SitioPublico` (cabecera, pie y WhatsApp), `Hero` + `Boveda` (portada), `Secciones`, `Contacto`, `Legales`, `Particulas`, `useInteraccion` (hooks de puntero y scroll) y `estilos.ts`. El componente se conserva, pero **ya no se sirve en `/`**.
- `src/components/ejemplo/`: demo `Securify` (video de fondo, Readex Pro y estilos propios). Vive en `/ejemplo/securify`, se carga con `lazy` y no comparte tokens con el sitio ni con el panel.
- El contenido comercial está en `src/lib/sitio.ts` (servicios, garantías, paquetes en RD$, preguntas). Los canales de contacto salen de `VITE_WHATSAPP`, `VITE_CONTACTO_CORREO` y `VITE_CONTACTO_TELEFONO`: si están vacíos, no se muestran.
- Panel: `src/components/` (Inicio, Clientes, crm/, talento/, Facturacion, Gastos, Pagos, Igualas, Reportes, Servicios, Solicitudes, Seo, Prospeccion, AsistenteIA). Tipos en `src/types/`.
- `worker/index.js`: API del Worker (`/api/seo/*`, `/api/scraper/*`, `/api/solicitudes`, `/api/talento/*` e IA) y la portada `/` desde `/orbit/`. `wrangler.jsonc`: assets desde `dist/`, `not_found_handling: "404-page"`, `run_worker_first: ["/api/*", "/"]`, binding `AI` y variable `IA_MODELO`.
- `public/`: `orbit/index.html` (portada), `_redirects`, `_headers`, `404.html`, `sw.js` (PWA), `manifest.webmanifest`, `robots.txt` y `sitemap.xml`.
- Variables de `.env.example`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y las de contacto. `.env` nunca se sube (Git lo ignora).

## Diseño (fuente: `docs/DESIGN.md`)
- Tres superficies deliberadas. **Panel:** crema, tinta y naranja de señal, con tokens cálidos en `src/index.css` (`@theme`). **Sitio comercial AviTech:** azul de marca dentro de `.sitio-comercial` (código conservado, ya no se sirve en `/`). **Portada Orbit:** HTML estático aislado en `public/orbit/index.html`, negro/espacio, con su propia escala `--u`; no reutilizar sus estilos en el panel ni en el sitio. La demo `/ejemplo/securify` es otra excepción aislada (negro/blanco y Readex Pro). No mezclar esos sistemas.
- Tailwind v4 sin `tailwind.config`: los tokens viven en `src/index.css`. Sin hex crudos para superficies o texto.
- Interacción: CSS 3D, canvas y `requestAnimationFrame`. **No usar Three.js.** Los efectos de puntero se desactivan con `prefers-reduced-motion`, puntero táctil o equipo ligero (`equipoLigero()`), y limpian sus listeners al desmontar. Evita filtros SVG y `drop-shadow` animados.
- Cada interacción nueva necesita una comprobación en `docs/pruebas/prueba-interaccion.js`. La portada Orbit se comprueba con `docs/pruebas/prueba-orbit.js` (requiere `npx wrangler dev --port 8792`).

## Reglas de código
- `tsconfig.app.json` es estricto: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (imports de tipos con `import type` o `type`) y `erasableSyntaxOnly` (sin `enum`).
- Montos y fechas con `src/lib/formato.ts` (es-DO). Íconos con `lucide-react`.
- Service worker: sube `VERSION` en `public/sw.js` cuando cambie el armazón cacheado. La API y Supabase nunca se cachean.
- Sitio comercial sin datos inventados: nada de clientes, testimonios ni casos. Los precios son referencias en RD$.
- Formularios públicos: consentimiento obligatorio, campo honeypot `website` y límites en la base de datos.
- Talento es un módulo separado del CRM. Las tablas no son legibles por `anon`; los flujos públicos entran por RPC con token. Códigos `PT409` (perfil ajeno sin token) y `PT429` (límite). El frontend usa la firma de `guardar_postulacion_publica` (19 argumentos); cámbiala solo con migración y prueba.
- Facturas: NCF único (migración 013). Impresión: `.documento-factura` y `@media print` fijan tokens de papel; nunca se imprime la barra lateral.

## Pruebas
- `docs/pruebas/*.js` son scripts de Playwright con datos simulados. Cada uno es `async (page) => {...}` y espera la vista previa en `http://localhost:5181` (salvo `prueba-orbit.js`, que usa el Worker en `http://127.0.0.1:8792` porque `/` la sirve el Worker). Sus capturas van a `C:/Users/User/avitech/capturas-*`; ajusta `CAPTURAS` si cambia el equipo.
- Ejecútalos **de uno en uno**. En paralelo, las comprobaciones de tiempo y las capturas fallan por carga, no por el código.
- Antes de entregar: `npm run build`, `npm run lint` y las pruebas del módulo tocado (sitio, interacción, PWA, CRM, Talento, SEO, Solicitudes o Prospección).

## Documentación
- `docs/ESTADO-ACTUAL.md` es el registro de sesiones y pendientes: actualízalo al terminar cada trabajo.
- `docs/DESIGN.md` debe reflejar cualquier cambio visual. `docs/SITIO-COMERCIAL.md` describe el sitio Vaultline (ya no servido en `/`, conservado como referencia).
- `.open-design.json` vincula el diseño al sistema Mastercard y a la plantilla `dashboard`.
