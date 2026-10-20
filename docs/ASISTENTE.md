# Asistente de IA — chat interno

> Última actualización: 19-oct-2026.

## Qué es

Un chat flotante dentro del panel (`Asistente IA`, abajo a la derecha). Ayuda a
redactar correos y propuestas, resumir textos, revisar redacciones y pensar ideas
comerciales. Responde en español y conoce las secciones del panel.

**Importante:** no tiene acceso a la base de datos. No ve clientes, facturas,
pagos, montos ni conversaciones anteriores. Si necesitas analizar datos, hay que
pegarlos en el chat.

## Costo y privacidad

- Usa **Cloudflare Workers AI** con el modelo `@cf/google/gemma-4-26b-a4b-it`.
- **Sin claves externas y sin tarjeta:** incluido en el plan gratis de Workers,
  con **10,000 neuronas al día** (cientos de mensajes). Se reinicia a las
  00:00 UTC (8:00 PM en RD).
- Si se agota la cuota, el asistente avisa y no genera cargos: no hay modelo de
  pago configurado.
- Las conversaciones viven **solo en memoria** mientras el panel está abierto.
  No se guardan en Supabase, localStorage ni archivos. Al recargar se pierden.
- No compartas contraseñas, tokens ni datos sensibles. El panel no los pide y el
  asistente está instruido para no solicitarlos.
- Cloudflare procesa los mensajes para generar la respuesta, igual que cualquier
  proveedor de IA. No envíes información que no quieras sacar de la empresa.

## Cómo se usa

1. Entra al panel con tu cuenta.
2. Pulsa el botón azul **Asistente IA** (abajo a la derecha).
3. Escribe y pulsa **Enter**; usa **Shift + Enter** para un salto de línea.
4. Los botones de sugerencia del inicio sirven para empezar rápido.
5. `Nueva conversación` (flecha circular) borra el chat actual de la pantalla.
6. `Esc` o la X cierran la ventana; la conversación sigue ahí al volver a abrirla.

En móvil se abre como hoja inferior; en escritorio, como panel de 400 px.

## Cómo funciona por dentro

- **Ruta:** `POST /api/ia/chat` en el mismo Worker del panel (`worker/index.js`).
- **Seguridad:** exige la sesión de Supabase (`Authorization: Bearer …`); sin
  sesión responde `401`.
- **Binding:** `"ai": { "binding": "AI" }` en `wrangler.jsonc`. No hay API key.
- **Límites del servidor:** 12 mensajes por petición, 3,000 caracteres por
  mensaje, 12,000 de historial y 900 tokens de salida. Además, un límite suave
  de 20 consultas cada 10 minutos por usuario (en memoria, para frenar ráfagas).
- **Modelo:** si se cambia, edita `MODELO_IA` en `worker/index.js` y verifica que
  siga incluido en el plan gratis antes de publicar.
- **Respuesta:** acepta tanto `{ response }` como el formato OpenAI
  `choices[0].message.content`; el cliente solo recibe `{ respuesta, modelo }`.
- **Interfaz:** `src/components/AsistenteIA.tsx`; cliente HTTP en `src/lib/ia.ts`.
  Se monta una sola vez en `Layout.tsx`, por lo que sobrevive al cambio de sección.

## Verificación rápida

```powershell
# Sin sesión debe dar 401 (no ejecuta la IA)
Invoke-WebRequest -Method POST -Uri https://aviech.avismael-eg.workers.dev/api/ia/chat `
  -ContentType 'application/json' -Body '{"mensajes":[]}'

# Preflight correcto para el navegador
Invoke-WebRequest -Method OPTIONS -Uri https://aviech.avismael-eg.workers.dev/api/ia/chat `
  -Headers @{ Origin = 'https://aviech.avismael-eg.workers.dev'; 'Access-Control-Request-Method' = 'POST' }
```

Probado el 19-oct-2026: preflight `204`, sin sesión `401`, método incorrecto
`405`, y una llamada directa al modelo devolvió `200` con respuesta en español.
Capturas de la interfaz en `C:\Users\User\avitech\capturas-ia`.

## Si falla

| Síntoma | Qué revisar |
|---|---|
| «Tu sesión no es válida» | Cierra sesión y vuelve a entrar; el token expiró. |
| «Alcanzó su límite gratuito por hoy» | Se agotaron las 10,000 neuronas del día; vuelve después de las 8:00 PM (RD). |
| «No está activado en este entorno» | Falta el binding `AI` en `wrangler.jsonc` o no se publicó el Worker. |
| «No pudo responder» | Error temporal de Workers AI; pulsa `Reintentar` o espera unos segundos. |
| Se queda «escribiendo» | Revisa la conexión; el error aparece con botón `Reintentar`. |

## Próximos pasos posibles

- dAR contexto automático de una sección (por ejemplo, un cliente) con permiso
  explícito del usuario.
- Historial por usuario en Supabase, con RLS y borrado.
- Respuestas en streaming para que aparezcan palabra por palabra.
- Voz (Whisper / MeloTTS) si se justifica el costo y la privacidad.
