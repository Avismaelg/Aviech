# Migraciones SQL

Archivos `NNN_nombre.sql` que se aplican **en orden** contra Supabase. El workflow
**«Migrar base de datos»** los ejecuta todos en cada push que toque esta carpeta
(o a mano desde Actions → Run workflow), con `ON_ERROR_STOP=1`, y publica el
reporte en `supabase/verificacion-ultima.txt`.

## Reglas

- Cada archivo debe poder **reaplicarse sin error**: `create table if not exists`,
  `create or replace function`, `drop ... if exists`, `create index if not exists`.
- No editar una migración ya aplicada salvo que sea seguro reaplicarla. Para un
  cambio nuevo, crear el siguiente número.
- Nunca poner secretos, contraseñas ni claves de servicio aquí.
- Las funciones públicas usan `security definer`, `search_path` fijo, límites
  antiabuso y `grant execute` solo a `anon` cuando corresponde.

## Historial

| Archivo | Contenido |
|---|---|
| `001`–`009` | Panel, clientes, servicios, pagos, facturas, CRM, SEO y solicitudes de servicio con IA |
| `010_talento.sql` | Tablas de Talento, bucket privado `talento-cv`, RPC públicas y RLS |
| `011_talento_ia.sql` | Token del candidato y postulación asistida con IA |
| `012_talento_seguridad.sql` | Token obligatorio para editar (`guardar_postulacion_publica`), límites en base (`talento_limites_publicos`) e índices de las listas públicas |
