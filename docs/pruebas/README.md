# Pruebas de navegador

> Dos pruebas de humo con **datos simulados** (Playwright): no tocan la base real de Supabase
> ni Google, y no contienen secretos.

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

**Nota:** el script asume que el panel se sirve en `http://localhost:5181`. Si usas otro
puerto, cambia la constante `BASE`.

## Auditor SEO (`prueba-seo.js`)

Prueba de humo del **Auditor SEO** con datos simulados: intercepta `**/rest/v1/**`,
`**/auth/v1/**`, `**/api/seo/auditar**` (la API del Worker) y `**/pagespeedonline/**` (la
medición de velocidad de Google).

**Qué comprueba:** estado vacío, auditoría con informe completo (puntaje, comprobaciones y
sitemap), medición de PageSpeed y su guardado, segunda auditoría con hallazgos, eliminación
con confirmación, validación de direcciones inválidas, recarga con enlace profundo (`#seo`) y
vista móvil. Devuelve JSON con `ok`, los pasos y los errores de consola (debe ser `[]`).

**Cómo ejecutarla:** igual que la del CRM (arriba): compila, levanta la vista previa en el
puerto 5181 y pide en OpenCode `docs/pruebas/prueba-seo.js` con la herramienta de Playwright
(`browser_run_code_unsafe`, parámetro `filename`). Las capturas se guardan en
`C:\Users\User\avitech\capturas-seo` (6 imágenes).
