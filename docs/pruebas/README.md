# Pruebas de navegador

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
