# CRM — guía del módulo

> **Qué es:** el CRM vive **dentro del panel**, con el mismo login y la misma base de
> datos (Supabase). No es una aplicación aparte ni tiene costo adicional.

## 1. Qué incluye

| Pestaña | Para qué sirve |
|---|---|
| **Pipeline** | Tablero kanban de oportunidades. Arrastra una tarjeta a otra columna o cambia la etapa desde el modal. |
| **Empresas** | Prospectos y cuentas: nombre, dominio, industria, teléfono, sitio web y notas. Desde aquí se convierte una empresa en cliente. |
| **Contactos** | Personas de cada empresa: cargo, correo, teléfono, LinkedIn y notas. |
| **Actividades** | Llamadas, correos, reuniones, tareas y notas. Se pueden vincular a una oportunidad y a un contacto, marcar como completadas y detectar las atrasadas. |

Arriba del tablero se muestran cuatro métricas: **pipeline abierto**, **ponderado**
(monto × probabilidad), **ganado** y **actividades pendientes** (con las atrasadas en rojo).

## 2. Etapas del pipeline

| Etapa | Significado |
|---|---|
| Prospecto | Contacto inicial; todavía no hay necesidad confirmada. |
| Contactado | Ya hubo un primer contacto. |
| Reunión | Reunión agendada o realizada. |
| Propuesta | Se envió una propuesta o cotización. |
| Negociación | Se están discutiendo alcance, precio o condiciones. |
| Ganado | Cliente cerrado. |
| Perdido | Oportunidad descartada. |

Las etapas **Prospecto → Negociación** cuentan como pipeline abierto. **Ganado** y
**Perdido** quedan fuera de esa suma.

## 3. Flujo recomendado

1. **Empresas → Nueva empresa**: registra la cuenta.
2. **Contactos → Nuevo contacto**: agrega a la persona con la que hablas.
3. **Pipeline → Nueva oportunidad**: elige empresa, contacto, monto, probabilidad y fecha
   de cierre.
4. **Actividades → Nueva actividad**: agenda el siguiente paso (llamada, correo, reunión o
   tarea) y vincúlalo a la oportunidad.
5. Cuando la oportunidad pase a **Ganado**, usa **Convertir en cliente** (en el modal de la
   oportunidad o en el botón de la fila de Empresas). Se crea el registro en **Clientes** y
   la empresa queda vinculada; puedes completar RNC y datos fiscales desde Clientes.

## 4. Datos y seguridad

- Migración: **`supabase/sql/007_crm.sql`** (idempotente).
- Tablas: `crm_empresas`, `crm_contactos`, `crm_oportunidades`, `crm_actividades`.
- `crm_empresas.cliente_id` enlaza con `clientes` (se llena al convertir).
- RLS activo: solo usuarios autenticados leen y escriben; un visitante anónimo no ve nada.
- `crm_oportunidades.updated_at` se actualiza solo con un trigger.
- Al borrar una empresa se borran sus contactos; las oportunidades quedan sin empresa.
- Al borrar una oportunidad se borran sus actividades.

## 5. Código

```
src/components/crm/Crm.tsx          # pestañas, métricas y carga de las 4 tablas
src/components/crm/Pipeline.tsx     # kanban + modal de oportunidad + conversión
src/components/crm/Empresas.tsx     # CRUD + conversión a cliente
src/components/crm/Contactos.tsx    # CRUD de contactos
src/components/crm/Actividades.tsx  # seguimiento y filtros
src/lib/crm.ts                      # convertirEmpresaEnCliente()
src/types/crm.ts                    # tipos del módulo
```

## 6. Inspiración y alcance

El modelo de datos y la experiencia están inspirados en **Comp AI CRM**
(https://github.com/trycompai/crm, licencia MIT), adaptados al panel interno de AviTech.
No se copió código: se reescribió con React + Supabase y el sistema de diseño del panel.

**Esta primera fase no incluye** el agente de IA, el enriquecimiento automático de empresas
ni la sincronización de correo del proyecto original: esas funciones requieren claves y
créditos de IA, y quedan para una fase 2 si el uso lo justifica.
