# Modelo de IA configurable

El panel usa **Cloudflare Workers AI** a través del binding `AI` (sin claves ni
SDK). El modelo ya no está fijo en el código: se elige con variables de entorno.

## Configuración

| Variable | Alcance | Valor actual |
|---|---|---|
| `IA_MODELO` | Global | `@cf/google/gemma-4-26b-a4b-it` |
| `IA_MODELO_ASISTENTE` | Chat del panel | Opcional; si falta, usa `IA_MODELO` |
| `IA_MODELO_SOLICITUDES` | Diagnóstico/propuesta de solicitudes | Opcional |
| `IA_MODELO_TALENTO` | Postulación y matching de Talento | Opcional |

La variable global vive en **`wrangler.jsonc` → `vars.IA_MODELO`**. Los overrides se
pueden agregar en el panel de Cloudflare:

**Workers & Pages → aviech → Settings → Variables and Secrets → Add variable**

o por CLI (como variable de texto, no es un secreto):

```powershell
cd C:\Users\User\avitech\avitech-panel
npx wrangler deploy
```

Para cambiar solo una función, agrega `IA_MODELO_ASISTENTE`,
`IA_MODELO_SOLICITUDES` o `IA_MODELO_TALENTO` en Cloudflare con el ID del modelo.
No hace falta tocar el código.

## Listar modelos disponibles

```powershell
npx wrangler ai models
```

El listado incluye modelos de texto, imagen, voz, visión y embeddings. Para este
proyecto solo aplican los de **Text Generation** (y opcionalmente visión si se
quisiera analizar una imagen, hoy no usado).

## Opciones recomendadas

| Modelo | Uso sugerido | Nota |
|---|---|---|
| `@cf/google/gemma-4-26b-a4b-it` | Actual, equilibrio calidad/costo | Buen español y respuestas estructuradas |
| `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Mejor redacción/propuestas | Más neuronas por respuesta |
| `@cf/qwen/qwen3-30b-a3b-fp8` | Alternativa multilingüe eficiente | Buen equilibrio |
| `@cf/mistralai/mistral-small-3.1-24b-instruct` | Multilingüe con visión | Más pesado |
| `@cf/deepseek-ai/deepseek-v4-flash-0731` | Razonamiento | Verificar disponibilidad y costo |
| `@cf/openai/gpt-oss-20b` | Razonamiento/agentes | Más neuronas |

El plan gratuito incluye **10,000 neuronas/día**. Un modelo más grande puede mejorar
la calidad pero consumir la cuota antes. No cambies el modelo global sin probar una
tarea real.

## Cómo probar un cambio

1. Cambia `IA_MODELO` (o el override) y despliega.
2. Abre el panel → **Asistente IA** y pide una tarea representativa (por ejemplo:
   «Redacta una propuesta de portal para una ferretería»).
3. Revisa la respuesta y la latencia. El endpoint del asistente devuelve
   `modelo` en el JSON; en las herramientas del navegador puedes confirmar cuál
   respondió.
4. Prueba una solicitud de ejemplo en **Solicitudes** (el plan debe ser JSON válido)
   y un **matching** en Talento.
5. Si la calidad o el consumo empeoran, vuelve al valor anterior y despliega.

## Notas

- El modelo se resuelve por petición con `modeloIA(env, especifico)` en
  `worker/index.js`; si la variable está vacía o mal escrita se usa el valor por
  defecto.
- No se necesita instalar el paquete `cloudflare` (ese es el SDK de la API, no el
  binding de Workers AI).
- Las variables de modelo son públicas; no pongas tokens ni claves en ellas.
- El asistente sigue sin ver la base de datos y sin guardar conversaciones.
