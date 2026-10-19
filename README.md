# Aviech

Startup de auditoría y consultoría.

---

## AviTech Panel — producto interno

Panel de gestión de AviTech Solutions Group: clientes, servicios, pagos, facturación, gastos
y reportes, con tablero de resumen. Pensado para **República Dominicana**: montos en **RD$**
(pesos dominicanos), **RNC** de clientes, **NCF/e-NCF con ITBIS 18%** y teléfonos con
formato local (809/829/849).
Stack: **Vite + React + TypeScript + Tailwind CSS + Supabase**.
Interfaz **oscura premium**: tokens de diseño, cristal, gradientes índigo→violeta y fondo con auroras.

- Dirección pública: **https://aviech.avismael-eg.workers.dev**
- Cada `git push` a `main` compila y publica solo (Cloudflare, en menos de 1 minuto).

### Módulos

| Módulo | Qué hace |
|---|---|
| **Inicio** | Tablero: contadores animados, gráfica de ingresos (últimos 6 meses), anillo de estado de cobro, gastos y balance del mes, últimos clientes y pagos pendientes |
| **Clientes** | Alta, edición y borrado; búsqueda y filtro por estado (activo / prospecto / pausado); **RNC** para facturación formal |
| **Servicios** | Trabajos por cliente con tipo, estado, monto (RD$) y fechas |
| **Pagos** | Ingresos por cliente; cobrado vs. pendiente, **vencidos** y «marcar como pagado» en un clic |
| **Facturación** | Facturas con **NCF / e-NCF** e **ITBIS 18%**; líneas de detalle, estados borrador → emitida → pagada, **anulación**, impresión/PDF y pago registrado automáticamente al cobrar |
| **Gastos** | Salidas por categoría (regla del dinero ×3); total del mes e histórico |
| **Reportes** | Estado de cuenta por cliente y resumen mensual (12 meses) con **Imprimir / PDF** y exportación **CSV** |

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
- RLS activado en `clientes`, `servicios` y `pagos`: solo usuarios autenticados del panel.
- El registro público está cerrado; los usuarios se crean desde Supabase → Authentication → Users.
- La clave `service_role` **nunca** va en el frontend ni en Git.
- `.env` está excluido de Git; el repositorio solo contiene `.env.production` con valores públicos.

### Despliegue

Automático con Cloudflare Workers al hacer `git push` a `main`.
Alternativa manual: `npm run build` + `npx wrangler deploy`.
Detalles y solución de problemas: **`docs/PUBLICAR-CLOUDFLARE.md`**.

### Respaldos

Copia semanal automática de la base (lunes ~10:00 AM, hora de República Dominicana) en el repositorio privado
`Avismaelg/Aviech-backup`. Ver **`docs/RESPALDOS.md`**.

### Estructura

```
src/
  App.tsx                 # sesión de Supabase → Login o panel
  components/
    Layout.tsx            # barra lateral + navegación
    Inicio.tsx            # tablero: contadores, gráfica, anillo de cobro y balance
    Clientes.tsx          # CRUD de clientes (con RNC)
    Servicios.tsx         # CRUD de servicios
    Pagos.tsx             # CRUD de pagos (con vencidos)
    Facturacion.tsx       # facturas con NCF/e-NCF, ITBIS y PDF
    Gastos.tsx            # CRUD de gastos (regla ×3)
    Reportes.tsx          # estado de cuenta y resumen mensual (imprimir / CSV)
    Login.tsx             # acceso del personal
    ui.tsx / toast.tsx    # piezas de interfaz compartidas
  lib/
    supabase.ts           # cliente compartido de Supabase
    useTabla.ts           # carga/guardado genérico por tabla
    formato.ts            # moneda (RD$), fechas e iniciales
    etiquetas.ts          # estados, tipos y colores
    useContador.ts        # animación de números del tablero
    csv.ts                # exportar tablas a Excel (CSV)
    empresa.ts            # datos fiscales de la empresa (encabezado de facturas)
  types/                  # tipos Cliente, Servicio, Pago, Gasto y Factura
supabase/sql/             # migraciones (001, 002, 003, 004, …)
docs/                     # plan, estado, despliegue, respaldos, migraciones
```

### Documentación

- `docs/PLAN-TECNOLOGICO.md` — plan completo: stack, costos, fases y reglas
- `docs/ESTADO-ACTUAL.md` — dónde nos quedamos y próximos pasos
- `docs/MIGRACIONES.md` — cómo cambia la base de datos
- `docs/PUBLICAR-CLOUDFLARE.md` — despliegue automático y manual
- `docs/RESPALDOS.md` — respaldos y restauración
