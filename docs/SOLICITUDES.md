# Solicitudes de servicio — del pedido al servicio cerrado

> Última actualización: 19-oct-2026 (6.ª sesión).

## Qué hace

El módulo **Solicitudes** recibe un pedido de servicio y deja que la IA prepare el
diagnóstico, el alcance, la propuesta, el correo y el informe. Después crea o reutiliza
el cliente y el CRM, registra el servicio como **completado** y guarda todo para que
el personal lo revise.

La solicitud puede entrar por **dos canales**:

| Canal | Dónde | Qué pasa |
|---|---|---|
| **Formulario público** | `https://aviech.avismael-eg.workers.dev/solicitud` | No requiere cuenta. El cliente recibe un **folio** y la IA procesa la solicitud en segundo plano. |
| **Panel interno** | **Solicitudes → Nueva solicitud** | El personal la registra con el canal real (WhatsApp, correo, llamada, presencial u otro) y decide si ejecuta la IA al guardar. |

El correo que redacta la IA es un **borrador**: el panel **no envía correos automáticamente**.
El equipo revisa y contacta al cliente.

## Flujo completo

1. **Entra la solicitud.** El formulario público la guarda como `analizando`; el panel
   interno la guarda como `nueva` (o pasa a `analizando` si se marca «Ejecutar con IA al guardar»).
2. **Validación y límites.** El Worker revisa nombre, descripción (mínimo 20 caracteres),
   correo o teléfono y consentimiento. El formulario público incluye un campo trampa
   invisible y un límite de 3 envíos por IP cada hora.
3. **Auditoría SEO opcional.** Si el tipo es **Auditoría SEO** y hay sitio web, el Worker
   ejecuta una auditoría técnica real y la usa como fuente principal del informe.
4. **La IA prepara el trabajo.** Devuelve un JSON con resumen, alcance, entregables,
   tareas, cronograma, precio sugerido, propuesta, correo, informe, nivel de confianza
   y datos pendientes.
5. **Cierre transaccional.** Una función SQL crea o reutiliza:
   - el **cliente** (por correo o teléfono),
   - la **empresa** del CRM (por nombre o dominio),
   - el **contacto**,
   - la **oportunidad ganada**,
   - el **servicio completado**,
   - una **actividad** de CRM,
   - la **auditoría SEO**, si se hizo.
6. **La solicitud queda completada** con los enlaces al servicio y al CRM, el precio y el
   informe. El panel muestra la insignia **Completada**.
7. **Revisión humana.** El equipo abre el detalle, lee el plan y el informe, revisa la
   confianza y los datos pendientes, y usa **Ir a Servicios** para continuar la gestión.

## Cómo se usa

### Formulario público (para compartir con clientes)

1. En **Solicitudes**, pulsa **Enlace público**. Se copia la dirección `/solicitud`.
2. Compártela por WhatsApp, correo o redes. No requiere registro.
3. El cliente completa nombre, empresa, contacto, tipo de servicio y descripción.
4. Al enviar, ve un **folio** y el mensaje de que la IA está preparando el análisis.
5. El equipo ve la solicitud en la bandeja; cuando termina, aparece **Completada**.

### Alta interna (paso a paso)

1. Entra al panel y abre **Solicitudes**.
2. Pulsa **Nueva solicitud**.
3. Completa **Nombre del solicitante**, empresa, correo o teléfono y el **Título**.
4. Describe **qué necesita** con el mayor detalle posible (mínimo 20 caracteres).
5. Elige **tipo**, **canal**, **urgencia**, presupuesto y fecha deseada si los tienes.
6. Deja marcado **Ejecutar con IA al guardar** si quieres que el flujo se cierre solo;
   desmárcalo si prefieres guardar primero y ejecutar después.
7. Pulsa **Guardar y ejecutar** (o **Guardar solicitud**).
8. En la fila, usa **Ejecutar IA** si la guardaste sin ejecutar.
9. Abre **Ver detalle** para leer el plan, la propuesta, el correo y el informe.
10. Pulsa **Ir a Servicios** para ver el servicio creado.

### Revisión recomendada

- **Nivel de confianza:** si es `bajo`, revisa especialmente el alcance y el precio.
- **Datos pendientes:** son supuestos o documentos que faltan; confírmalos con el cliente.
- **Precio sugerido:** es una estimación, no una cotización aprobada.
- **Informe:** si la solicitud no traía suficiente información, la IA lo indicará; no
  inventes hallazgos que no estén en el informe o en la auditoría.
- **Correo:** es un borrador editable; cópialo y envíalo desde tu correo habitual.
- **Servicio:** en **Servicios** puedes ajustar tipo, estado, monto y notas. El informe
  generado queda guardado como registro de la ejecución.

## Estados de una solicitud

| Estado | Significado |
|---|---|
| `nueva` | Entró y espera ejecución de la IA. |
| `analizando` | La IA está trabajando o quedó a medias por un corte. |
| `completada` | El servicio se creó y se cerró. |
| `error` | Falló la IA o el cierre; el detalle muestra el motivo y se puede **Reintentar**. |
| `rechazada` | Reservado para descartes manuales; hoy no hay botón de rechazo en la interfaz. |

Las solicitudes completadas no se vuelven a ejecutar: el endpoint devuelve el servicio
existente. Para rehacer un trabajo, crea una solicitud nueva.

## Privacidad y seguridad

- La tabla `solicitudes_servicio` tiene **RLS**: solo el personal autenticado puede leerla.
- El formulario público **no crea cuentas** ni recibe acceso a la tabla. La creación y el
  cierre pasan por funciones SQL `SECURITY DEFINER` con un **token aleatorio por solicitud**.
- El navegador del cliente **nunca recibe** el token; solo el folio.
- La IA de solicitudes recibe únicamente los datos del pedido y, si aplica, el resumen de
  la auditoría SEO. **No consulta la base de datos** ni ve otros clientes.
- No se envían correos automáticos; el correo es un borrador.
- No se deben incluir contraseñas, claves ni documentos sensibles en la descripción.
- El formulario público es `noindex` y tiene consentimiento explícito.

### Límites actuales

- **3 solicitudes públicas por IP cada hora** (límite en memoria del Worker).
- **12 ejecuciones por usuario cada 10 minutos** (límite en memoria).
- **Una llamada de IA por solicitud**, con **1,800 tokens** de salida como máximo.
- Rate limits en memoria: se reinician si Cloudflare recicla la instancia. Para un ataque
  coordinado, la defensa pendiente es **Turnstile** o un secreto compartido.
- Si el Worker se corta después de crear la solicitud, queda en `analizando`; el personal
  puede abrirla y pulsar **Ejecutar IA**.

## Costo

- Usa **Cloudflare Workers AI** con el modelo `@cf/google/gemma-4-26b-a4b-it`, binding
  `AI`, **sin claves ni tarjeta**.
- Consume la cuota gratuita de **10,000 neuronas al día**, compartida con el Asistente IA.
- Una solicitud hace **una** llamada. Si el límite se agota, la solicitud queda en `error`
  y se puede reintentar después de las 8:00 PM (hora de RD), cuando se reinicia la cuota.
- Las auditorías SEO son propias y **no** usan PageSpeed en este flujo; no agregan costo.

## Cómo funciona por dentro

| Pieza | Archivo |
|---|---|
| Migración 009 | `supabase/sql/009_solicitudes.sql` |
| Endpoints | `worker/index.js` → `POST /api/solicitudes` y `POST /api/solicitudes/ejecutar` |
| Bandeja y alta interna | `src/components/Solicitudes.tsx` |
| Formulario público | `src/components/SolicitudPublica.tsx` (ruta `/solicitud`) |
| Tipos | `src/types/solicitud.ts`; el servicio amplía `src/types/servicio.ts` |
| Etiquetas | `src/lib/etiquetas.ts` |
| Descarga de informes | `src/lib/descargas.ts` |
| Prueba de humo | `docs/pruebas/prueba-solicitudes.js` |

### Funciones SQL

- `crear_solicitud_publica(...)` → inserta y devuelve `{ id, token }` al Worker.
- `finalizar_solicitud(...)` → cierra todo en **una transacción**; si algo falla, no deja
  clientes, servicios u oportunidades a medias.
- `marcar_solicitud_error(id, token, error)` → deja la solicitud en `error` para reintentar.

El Worker llama estas funciones con la clave pública (`anon`). El token es la autorización
de esa solicitud; no se expone al navegador.

### Verificación rápida

```powershell
# El formulario público debe existir y ser noindex
Invoke-WebRequest -Uri https://aviech.avismael-eg.workers.dev/solicitud -UseBasicParsing

# Sin sesión, el ejecutor debe dar 401
Invoke-WebRequest -Method POST -Uri https://aviech.avismael-eg.workers.dev/api/solicitudes/ejecutar `
  -ContentType 'application/json' -Body '{"id":"00000000-0000-0000-0000-000000000000"}'

# Preflight del formulario público
Invoke-WebRequest -Method OPTIONS -Uri https://aviech.avismael-eg.workers.dev/api/solicitudes `
  -Headers @{ Origin = 'https://aviech.avismael-eg.workers.dev'; 'Access-Control-Request-Method' = 'POST' }
```

La prueba de navegador con Supabase y Worker simulados está en
**`docs/pruebas/prueba-solicitudes.js`**; capturas en `capturas-solicitudes`.

## Si algo falla

| Síntoma | Qué revisar |
|---|---|
| «La IA alcanzó su límite gratuito por hoy» | Cuota diaria de Workers AI; reintentar después de las 8:00 PM (RD). |
| «La IA no pudo preparar la solicitud» | Error temporal del modelo; pulsa **Reintentar**. |
| La solicitud sigue en «IA trabajando» | El Worker pudo cortarse; abre el detalle y pulsa **Ejecutar con IA y cerrar**. |
| «El motor de IA no está activado» | Falta el binding `AI` en `wrangler.jsonc` o no se publicó el Worker. |
| «No se pudo guardar en la base» | Revisa que la migración 009 se haya aplicado y que el workflow esté en verde. |
| El enlace público da 404 | Publica el Worker y verifica que `assets` sirva la ruta `/solicitud`. |
| El correo no se envió | Es correcto: el panel solo genera un borrador. |

## Pendientes y mejoras posibles

- **Turnstile** o un secreto compartido para endurecer el formulario público.
- **Aprobación humana** antes de crear el servicio (hoy se puede desmarcar la ejecución
  automática desde el alta interna, pero el formulario público siempre ejecuta).
- Editar el informe dentro del panel y adjuntar archivos.
- Enviar el correo desde el panel cuando exista un proveedor gratuito o incluido.
- Reintento automático de solicitudes en `error`.
- Panel público de seguimiento por folio (sin exponer datos de otros clientes).
