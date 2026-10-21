# Aviech

Startup de auditoría y consultoría.

---

## AviTech Panel — producto interno

Panel de gestión de AviTech Solutions Group: clientes, CRM, talento, prospección de contactos, auditoría SEO, solicitudes de servicio con IA, servicios, pagos, facturación, gastos, reportes y un asistente de IA, con tablero de resumen. Pensado para **República Dominicana**: montos en **RD$**
(pesos dominicanos), **RNC** de clientes, **NCF/e-NCF con ITBIS 18%** y teléfonos con
formato local (809/829/849).
Stack: **Vite + React + TypeScript + Tailwind CSS + Supabase**.
Interfaz **v4 «Open Design · Mastercard»**: lienzo crema, tinta casi negra y naranja de señal; tipografía **Sofia Sans** autoalojada, **barra lateral flotante** con grupos en escritorio y cabecera tipo píldora con menú desplegable en móvil. Las facturas y la impresión siguen en claro.

- Dirección pública: **https://aviech.avismael-eg.workers.dev**
- Formulario público de solicitudes: **https://aviech.avismael-eg.workers.dev/solicitud**
- Portal público de talento: **https://aviech.avismael-eg.workers.dev/talento**
- Cada `git push` a `main` compila y publica solo (Cloudflare, en menos de 1 minuto).

### Módulos

| Módulo | Qué hace |
|---|---|
| **Inicio** | Tablero: contadores animados, gráfica de ingresos (últimos 6 meses), anillo de estado de cobro, gastos y balance del mes, últimos clientes y pagos pendientes |
| **Clientes** | Alta, edición y borrado; búsqueda y filtro por estado (activo / prospecto / pausado); **RNC** para facturación formal |
| **CRM** | Pipeline kanban en 7 etapas, empresas, contactos y actividades de seguimiento; métricas de pipeline/ponderado/ganado y conversión de empresa en cliente con un clic |
| **Talento** | Módulo separado del CRM: candidatos, empresas empleadoras, vacantes, postulaciones y entrevistas. Portal público `/talento` con perfiles anónimos, shortlist, CV privado (PDF ≤ 5 MB), matching con IA y **postulación asistida con IA** autorizada por el candidato (máximo 3 vacantes). Sin cuentas públicas ni pagos. Ver **`docs/TALENTO.md`** |
| **Auditor SEO** | Analiza cualquier página como la ve Google (título, meta, encabezados, imágenes, enlaces, HTTPS, canonical, Open Graph, `robots.txt` y `sitemap.xml`) con puntaje 0–100 e historial; **velocidad** gratis con PageSpeed Insights. Sin claves ni costo |
| **Prospección** | Busca los **correos, teléfonos y redes sociales** de una web (página principal + contacto) y con un clic los guarda como empresa/contacto en el **CRM**; avisa si la empresa ya existe. Sin claves ni costo |
| **Solicitudes** | Bandeja de pedidos con **formulario público** (`/solicitud`) y alta interna. La IA prepara plan, propuesta, correo e informe; crea cliente/CRM/servicio y lo cierra. El equipo revisa. Sin correos automáticos. Ver **`docs/SOLICITUDES.md`** |
| **Servicios** | Trabajos por cliente con tipo, estado, monto (RD$) y fechas; incluye el informe y el plan de la IA |
| **Pagos** | Ingresos por cliente; cobrado vs. pendiente, **vencidos** y «marcar como pagado» en un clic |
| **Facturación** | Facturas con **NCF / e-NCF** e **ITBIS 18%**; líneas de detalle, estados borrador → emitida → pagada, **anulación**, impresión/PDF y pago registrado automáticamente al cobrar |
| **Gastos** | Salidas por categoría (regla del dinero ×3); total del mes e histórico |
| **Reportes** | Estado de cuenta por cliente y resumen mensual (12 meses) con **Imprimir / PDF** y exportación **CSV** |
| **Asistente IA** | Chat para redactar correos, propuestas y resúmenes, y para pensar ideas. En escritorio se abre desde la barra de contexto; en móvil, desde el icono de destellos de la cabecera fija. Usa **Cloudflare Workers AI** (plan gratis, sin claves) y **no ve los datos del panel**; las conversaciones no se guardan. Ver **`docs/ASISTENTE.md`** |

### Requisitos

- Node.js LTS (probado con v24)
- npm (incluido con Node.js)

### Comandos

```powershell
npm install        # instalar dependencias (primera vez o al actualizar)
npm run dev        # servidor de desarrollo → http://localhost:5173
npm run build      # compilación de producción (genera dist/)
npm run preview    # previsualizar la compilación local
npm run lint       # revisión de código (oxlint)
```

> Regla del equipo: **un solo servidor de desarrollo a la vez**. Al terminar, `Ctrl+C`.

### Base de datos y migraciones

- El esquema vive en **`supabase/sql/`** como archivos numerados e idempotentes (001, 002, 003, 004, …).
- Se aplican solos con el workflow **«Migrar base de datos»** cada vez que cambia
  `supabase/sql/` (o a mano: GitHub → Actions → Run workflow).
- Cada ejecución deja un reporte en `supabase/verificacion-ultima.txt`
  (tablas, columnas, conteos, prueba de inserciones y simulación de permisos RLS).
- Detalles y alternativa manual: **`docs/MIGRACIONES.md`**.

### Seguridad (recordatorio permanente)

- La clave «publishable» es pública por diseño; la seguridad real vive en **RLS** en cada tabla.
- RLS activado en `clientes`, `servicios`, `pagos`, CRM, SEO, `solicitudes_servicio` y las cuatro tablas de **Talento**: solo usuarios autenticados del panel.
- El **formulario público** no crea cuentas ni lee la tabla: crea y cierra solicitudes con funciones SQL y un token aleatorio por solicitud.
- El **portal de talento** tampoco crea cuentas: los candidatos y las empresas entran por RPC públicas con consentimiento y límites; los perfiles se muestran anónimos, los CV viven en un bucket privado y la postulación con IA exige un token privado que solo se entrega al crear o actualizar el perfil. Ver **`docs/TALENTO.md`**.
- El registro público está cerrado; los usuarios se crean desde Supabase → Authentication → Users.
- La clave `service_role` **nunca** va en el frontend ni en Git.
- `.env` está excluido de Git; el repositorio solo contiene `.env.production` con valores públicos.
- El **Asistente IA** usa Cloudflare Workers AI con el binding `AI` (sin claves), no guarda conversaciones y no tiene acceso a la base de datos. Ver **`docs/ASISTENTE.md`**.
- La **IA de solicitudes** solo recibe el pedido y la auditoría SEO de ese pedido; tampoco consulta la base de datos. Ver **`docs/SOLICITUDES.md`**.

### Despliegue

Automático con Cloudflare Workers al hacer `git push` a `main`.
Alternativa manual: `npm run build` + `npx wrangler deploy`.
Detalles y solución de problemas: **`docs/PUBLICAR-CLOUDFLARE.md`**.

### Respaldos

Copia semanal automática de la base (lunes ~1:00 PM, hora de República Dominicana) en el repositorio privado
`Avismaelg/Aviech-backup`. Ver **`docs/RESPALDOS.md`**.

### Estructura

```
src/
  App.tsx                 # sesión de Supabase → Login o panel
  components/
    Layout.tsx            # barra lateral flotante + cabecera móvil y navegación
    AsistenteIA.tsx       # chat interno del asistente (Workers AI)
    Inicio.tsx            # tablero: contadores, gráfica, anillo de cobro y balance
    Clientes.tsx          # CRUD de clientes (con RNC)
    crm/
      Crm.tsx             # sección CRM: pestañas, métricas y carga de datos
      Pipeline.tsx        # tablero kanban de oportunidades
      Empresas.tsx        # CRUD de empresas + conversión a cliente
      Contactos.tsx       # CRUD de contactos
      Actividades.tsx     # llamadas, correos, reuniones, tareas y notas
    talento/
      Talento.tsx         # contenedor interno: métricas y pestañas
      Candidatos.tsx      # perfiles, CV privado y notas
      Empresas.tsx        # empresas empleadoras
      Vacantes.tsx        # vacantes, publicación y matching con IA
      Procesos.tsx        # kanban de postulaciones, entrevistas y colocación
    TalentoPublico.tsx    # portal público /talento (candidatos y empresas)
    seo/
      Seo.tsx             # Auditor SEO: formulario, informe, velocidad e historial
    prospeccion/
      Prospeccion.tsx     # Prospección: búsqueda de contactos y guardado en el CRM
    Solicitudes.tsx       # bandeja, alta interna, detalle y ejecución con IA
    SolicitudPublica.tsx  # formulario público /solicitud (sin sesión)
    Servicios.tsx         # CRUD de servicios + detalle del informe de la IA
    Pagos.tsx             # CRUD de pagos (con vencidos)
    Facturacion.tsx       # facturas con NCF/e-NCF, ITBIS y PDF
    Gastos.tsx            # CRUD de gastos (regla ×3)
    Reportes.tsx          # estado de cuenta y resumen mensual (imprimir / CSV)
    Login.tsx             # acceso del personal
    ui.tsx / toast.tsx    # piezas de interfaz compartidas
  lib/
    supabase.ts           # cliente compartido de Supabase
    useTabla.ts           # carga/guardado genérico por tabla
    crm.ts                # convierte una empresa del CRM en cliente
    talento.ts            # CV privado, URLs firmadas, etiquetas y datos del portal
    seo.ts                # auditoría SEO (Worker) y PageSpeed
    prospeccion.ts        # prospección: Worker + guardado en el CRM
    ia.ts                 # chat del asistente (Worker /api/ia/chat)
    descargas.ts          # descarga de informes en texto
    urls.ts               # normalizar direcciones (compartido)
    formato.ts            # moneda (RD$), fechas e iniciales
    etiquetas.ts          # estados, tipos y colores
    useContador.ts        # animación de números del tablero
    csv.ts                # exportar tablas a Excel (CSV)
    empresa.ts            # datos fiscales de la empresa (encabezado de facturas)
  types/                  # tipos Cliente, Servicio, Pago, Gasto, Factura, Iguala, CRM, SEO, Solicitud, Prospección y Talento
worker/
  index.js                # API del panel en Cloudflare (SEO, prospección, asistente, solicitudes y talento)
public/
  sw.js                   # service worker: abre sin conexión y repite visitas al instante
  manifest.webmanifest    # datos de la app instalable (PWA)
supabase/sql/             # migraciones (001…011)
docs/                     # plan, estado, despliegue, respaldos, migraciones
```

### Documentación

- `docs/PLAN-TECNOLOGICO.md` — plan completo: stack, costos, fases y reglas
- `docs/ESTADO-ACTUAL.md` — dónde nos quedamos y próximos pasos
- `docs/CRM.md` — guía del módulo CRM (pipeline, empresas, contactos y actividades)
- `docs/TALENTO.md` — candidatos, empresas empleadoras, vacantes, portal público, CV privado, matching y postulación asistida con IA
- `docs/SEO.md` — guía del Auditor SEO (gratis, sin claves; Worker + PageSpeed)
- `docs/PROSPECCION.md` — guía de Prospección (contactos de una web → CRM; gratis)
- `docs/SOLICITUDES.md` — formulario público, bandeja interna y cierre automático con IA
- `docs/pruebas/README.md` — pruebas de humo del CRM, Talento, Auditor SEO, Prospección, PWA y Solicitudes con datos simulados
- `docs/MIGRACIONES.md` — cómo cambia la base de datos
- `docs/PUBLICAR-CLOUDFLARE.md` — despliegue automático y manual
- `docs/RESPALDOS.md` — respaldos y restauración
