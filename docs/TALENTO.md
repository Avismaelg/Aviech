# Talento — candidatos, empresas, vacantes y procesos

> Última actualización: 21-oct-2026.
>
> Estado: migración **010 aplicada** y portal **desplegado en producción** el
> 21-oct-2026. Página: https://aviech.avismael-eg.workers.dev/talento

## Qué es

**Talento** es un módulo separado del CRM para conectar empresas que buscan personal
con candidatos de República Dominicana. Tiene dos caras:

- **Panel interno** (`#talento`): el equipo da de alta candidatos y empresas, publica
  vacantes, revisa postulaciones, agenda entrevistas, mueve el proceso por etapas y
  cierra colocaciones.
- **Portal público** (`/talento`): cualquier persona puede crear su perfil y subir su
  CV; cualquier empresa puede explorar perfiles anónimos, armar una shortlist y pedir
  una entrevista o una contratación. No se crean cuentas y no hay pagos en línea.

No mezcla empresas empleadoras con `crm_empresas` ni con el pipeline comercial. Son
datos, pantallas y permisos independientes.

## Cómo se usa

### Candidato (`/talento` → «Busco empleo»)

1. Completa nombre, correo, puesto buscado, ubicación, modalidad, habilidades,
   disponibilidad y expectativa salarial (RD$).
2. Opcionalmente elige una vacante abierta para postularse en el mismo envío.
3. Opcionalmente activa **«Quiero que la IA busque y postule por mí»**. La IA
   revisa las vacantes públicas abiertas, elige hasta **3** donde el encaje sea
   real y crea las postulaciones. El portal muestra el resultado con puntaje y
   motivo. La autorización es explícita y se puede desactivar antes de enviar.
4. Adjunta el CV en **PDF de hasta 5 MB** o pega un enlace externo.
5. Autoriza el uso de sus datos y decide si su perfil se muestra a las empresas.
6. Si el correo ya existe, el perfil se **actualiza** en vez de duplicarse.

El portal muestra a las empresas un perfil **anonimizado**: nombre + inicial del
apellido, puesto, ubicación, habilidades, experiencia resumida y rango salarial.
**Nunca** muestra correo, teléfono, nombre completo ni el archivo del CV.

### Empresa (`/talento` → «Busco talento»)

1. Explora los perfiles visibles y filtra por texto, seniority o modalidad.
2. Añade candidatos a una **shortlist** local (vive en la memoria de la página).
3. Pide **entrevista** o **contratación** con un formulario breve.
4. El envío crea o actualiza la empresa empleadora y genera **una postulación por
   candidato** con `origen = 'empresa'`, `solicitud_tipo = 'entrevista' | 'contratacion'`
   y `etapa = 'recibida'`.
5. La empresa también puede **proponer una vacante**. Entra como `publica = false` y
   el equipo debe revisarla y activarla antes de que aparezca en el portal.

No hay checkout, cobro ni comisión automática. La colocación se cierra a mano en el
panel interno (fecha de inicio, salario final y comisión opcional).

### Equipo (`#talento`)

Cinco pestañas:

| Pestaña | Para qué sirve |
|---|---|
| **Resumen** | Candidatos activos, vacantes abiertas, procesos en marcha, próximas entrevistas y colocaciones; accesos rápidos y enlace al portal |
| **Candidatos** | Alta/edición, búsqueda, filtro por estado, perfil con CV firmado y notas internas |
| **Empresas** | Alta/edición, estado, contacto, sitio web y vacantes de cada empresa |
| **Vacantes** | CRUD, publicación en el portal, postulaciones asociadas y **matching con IA** |
| **Procesos** | Kanban por etapa, drag-and-drop, entrevistas, oferta, contratación y rechazo |

Estados de candidato: `nuevo`, `evaluando`, `entrevista`, `oferta`, `contratado`,
`descartado`.
Etapas del proceso: `recibida`, `preseleccion`, `entrevista`, `oferta`, `contratada`,
`rechazada`.

Al mover un proceso a **Contratada**, el candidato pasa automáticamente a
`contratado` y deja de aparecer en el portal público.

## Privacidad del CV

- Bucket **privado** `talento-cv` en Supabase Storage.
- Límite de **5 MB** y tipo `application/pdf` tanto en el bucket como en la interfaz.
- El visitante solo puede **insertar** archivos bajo `publico/%`; no puede listar,
  leer ni borrar CV.
- El personal autenticado puede leer y borrar, y abre el archivo con una **URL
  firmada de 1 hora**.
- El portal público solo indica `cv_disponible: true/false`; nunca devuelve la ruta.

## IA en Talento

Hay dos usos distintos. Ninguno se ejecuta solo: siempre requieren una acción
explícita de una persona.

### Matching interno (personal)

- Se ejecuta **solo cuando el personal pulsa «Buscar candidatos»** dentro de una
  vacante. No crea postulaciones automáticamente.
- Usa **Cloudflare Workers AI** con `@cf/google/gemma-4-26b-a4b-it` (binding `AI`,
  plan gratis, sin claves).
- Envía únicamente la vacante y un resumen de hasta **28 candidatos activos** que
  hayan dado consentimiento y sean visibles a empresas.
- Devuelve puntaje 0–100 y un motivo corto. El personal decide si agrega la sugerencia
  al pipeline; al hacerlo se crea la postulación con `origen = 'ia'`.
- Límite: 10 análisis cada 10 minutos por usuario y 1,400 tokens de salida.

### Postulación asistida (candidato)

- El candidato la activa con una casilla propia en `/talento` → «Busco empleo».
  No hay postulación automática sin esa autorización.
- El alta del perfil devuelve un **token privado** (UUID). El portal lo usa
  para pedir la búsqueda; la IA no recibe nombre, correo, teléfono ni CV.
- El Worker toma un resumen del perfil, hasta **20 vacantes públicas abiertas** a
  las que el candidato aún no se haya postulado y pide a la IA hasta **3**
  coincidencias con puntaje mínimo **65**.
- Solo postula a vacantes con `estado = 'abierta'` y `publica = true`. Las
  postulaciones se guardan con `origen = 'ia'`, `match_score`, `match_motivo` y una
  nota que deja constancia de la autorización.
- No es recurrente: si el candidato quiere otra búsqueda, debe volver a solicitarla.
- Límite: 4 búsquedas por IP cada hora y 900 tokens de salida.

## Modelo de datos

Migraciones: **`supabase/sql/010_talento.sql`** y **`supabase/sql/011_talento_ia.sql`**.

| Tabla | Contenido |
|---|---|
| `talento_candidatos` | Perfil, habilidades (`text[]`), expectativa, estado, visibilidad, consentimiento, CV y `token_publico` |
| `talento_empresas` | Empresa empleadora, sector, contacto, estado y consentimiento |
| `talento_vacantes` | Puesto, descripción, requisitos, salario, modalidad y `publica` |
| `talento_postulaciones` | Candidato ↔ empresa ↔ vacante, etapa, origen, entrevista y cierre |

Reglas principales:

- `talento_candidatos.email` es único sin distinguir mayúsculas.
- `talento_candidatos.token_publico` es único y **no** se devuelve en las RPC de
  listado público; solo se entrega al crear o actualizar el perfil.
- `talento_empresas.nombre` es único sin distinguir mayúsculas.
- Un candidato no puede tener dos postulaciones a la **misma vacante**.
- `vacante_id` puede ser `null` para solicitudes directas de una empresa.
- Si se elimina una vacante, sus procesos se conservan **sin vacante**.
- La postulación asistida acepta entre 1 y 3 vacantes por llamada y vuelve a validar
  el token, el consentimiento, la vacante abierta y los duplicados en la base.
- Todas las tablas tienen **RLS**: solo `authenticated`. `anon` no tiene privilegios
  directos de tabla.

## Funciones públicas (RPC)

Ejecutables por `anon` y `authenticated`, con `security definer` y
`search_path = public`:

| Función | Devuelve |
|---|---|
| `listar_vacantes_publicas()` | Hasta 60 vacantes abiertas y públicas, con empresa y sector |
| `listar_candidatos_publicos()` | Hasta 100 perfiles visibles, consentidos y no cerrados, ya anonimizados |
| `crear_postulacion_publica(...)` | Crea/actualiza candidato, devuelve su `token_publico` y, si se indica, su postulación |
| `perfil_para_ia_publico(candidato_id, token)` | Devuelve un resumen sin datos de contacto y las vacantes ya postuladas |
| `postular_con_ia_publica(candidato_id, token, ids, puntajes, motivos)` | Valida el token y crea hasta 3 postulaciones `origen = 'ia'` sin duplicar |
| `crear_empresa_y_solicitud(...)` | Crea/actualiza empresa y una postulación por candidato (máx. 12) |
| `crear_vacante_publica(...)` | Crea/actualiza empresa y una vacante **no publicada** para revisión |

Validaciones del servidor: nombre, correo, puesto, consentimiento, longitudes,
enumeraciones, salario coherente, URL `http(s)`, ruta de CV `publico/*.pdf`, token
del candidato, vacante abierta/pública y máximo de 3 postulaciones por búsqueda.

## API del Worker

| Ruta | Método | Acceso |
|---|---|---|
| `/api/talento/vacantes` | `GET` | Público, límite por IP |
| `/api/talento/candidatos` | `GET` | Público, límite por IP |
| `/api/talento/postulaciones` | `POST` | Público, límite por IP |
| `/api/talento/ia-postular` | `POST` | Público, token del candidato y límite por IP |
| `/api/talento/solicitudes` | `POST` | Público, límite por IP |
| `/api/talento/vacantes/publicar` | `POST` | Público, límite por IP |
| `/api/talento/match` | `POST` | **Solo personal** con sesión de Supabase |

Límites en memoria del Worker:

- 8 envíos públicos por IP cada hora.
- 4 búsquedas de postulación con IA por IP cada hora.
- 80 lecturas públicas por IP cada 10 minutos.
- 10 análisis de matching por usuario cada 10 minutos.
- Cuerpos máximos de 40–60 KB; la petición de postulación con IA, 4 KB.

Los formularios públicos incluyen **consentimiento explícito** y un **honeypot**
(`website`) invisible. Si se rellena, el Worker responde como si hubiera funcionado
pero no guarda nada.

## Cómo probar

1. Compila y abre la vista previa:

   ```powershell
   cd C:\Users\User\avitech\avitech-panel
   npm run build
   npm run preview -- --port 5181 --strictPort
   ```

2. En OpenCode pide ejecutar `docs/pruebas/prueba-talento.js` con la herramienta de
   Playwright (`browser_run_code_unsafe`, parámetro `filename`).

La prueba simula Supabase y el Worker, recorre el panel interno (métricas, candidato,
empresa, matching, kanban y colocación) y el portal público (perfil anónimo,
shortlist, solicitud de entrevista, alta con CV, postulación asistida con IA y móvil).
Debe devolver `ok: true`, nueve pasos y `errores: []`. Capturas en
`C:\Users\User\avitech\capturas-talento`.

## Puesta en marcha

> Las migraciones 010 y 011 y el despliegue ya están hechos en producción (cierre del
> 21-oct-2026, commit funcional `7388be2`). Estos pasos sirven para reproducir el módulo
> en un entorno nuevo o revisar que todo siga en su sitio.
>
> Verificación de producción: `/talento` responde `200`, el service worker
> `avitech-v2026-10-21-talento-ia` está activo y la tarjeta **Postulación inteligente**
> aparece (deshabilitada si no hay vacantes). `POST /api/talento/ia-postular` responde
> `400` con un token inválido. Como aún no hay vacantes públicas, la postulación real con
> IA no se ejecutó en producción; las RPC se validaron en una transacción revertida y el
> recorrido completo se probó con datos simulados.

1. Subir `010_talento.sql` y `011_talento_ia.sql` a `main`; el workflow **«Migrar base
   de datos»** los aplica junto con los anteriores y escribe el reporte en
   `supabase/verificacion-ultima.txt`.
2. Verificar que el bucket `talento-cv` existe y es **privado**.
3. Publicar el Worker (lo hace Cloudflare con el push) y confirmar que el binding `AI`
   sigue declarado en `wrangler.jsonc`.
4. Abrir `/talento` en producción y hacer un envío de prueba; revisar que el registro
   aparezca en `#talento`, que la IA devuelva una postulación si hay una vacante
   compatible y que el CV se abra con URL firmada.

## Pendientes y límites conocidos

- **Turnstile o secreto compartido:** hoy los formularios dependen del límite por IP
  del Worker, pero las RPC son ejecutables directamente con la clave pública de
  Supabase. Para producción abierta conviene añadir Cloudflare Turnstile o un secreto
  de servidor.
- El bucket permite inserciones anónimas de PDF bajo `publico/%`; sin Turnstile hay
  riesgo de spam de archivos.
- Las solicitudes de empresa no verifican el dominio del correo. El equipo debe
  confirmar al contacto antes de compartir datos.
- Un correo de candidato ya registrado actualiza su perfil sin verificación adicional;
  cualquier persona que conozca ese correo podría cambiar los datos públicos y obtener
  el token para pedir postulaciones con IA. El token reduce el abuso casual, pero no
  sustituye la verificación del correo. Para una apertura masiva conviene añadir un
  código de un solo uso antes de permitir la edición.
- El nombre de una empresa existente se puede actualizar desde el formulario público
  (con el mismo riesgo de suplantación). El equipo debe validar el contacto antes de
  activar sus vacantes.
- No hay pagos, facturación ni comisión automática dentro de Talento.
- No hay historial de versiones del CV ni borrado automático de archivos huérfanos.
