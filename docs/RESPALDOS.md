# Respaldos de la base de datos

> Activo desde: 18-oct-2026

## Qué es

Copia completa de la base de datos del panel (esquema + datos) en un archivo comprimido,
guardada en un repositorio **privado** de GitHub:

**`https://github.com/Avismaelg/Aviech-backup`** → carpeta **`respaldos/`**

- Nombre de archivo: `backup-AAAA-MM-DD_HHMM.sql.gz`
- Primer respaldo (prueba, 18-oct-2026): `backup-2026-10-18_2323.sql.gz` ✅

## Cuándo corre

- **Automático:** todos los lunes ~10:00 AM (hora de República Dominicana).
- **Manual:** GitHub → repo de respaldos → pestaña **Actions** →
  *"Respaldo de la base de datos"* → **Run workflow**.
- **Retención:** ~120 días (los respaldos más viejos se borran solos).

## Cómo restaurar (solo si algún día se daña la base)

1. Descargar el archivo `.sql.gz` más reciente del repo de respaldos.
2. Descomprimir: `gunzip backup-2026-10-18_2323.sql.gz`
3. Aplicarlo usando la cadena "Session pooler" de Supabase (Project → Connect):

```bash
psql "postgresql://postgres.ktvyhtbmokmrzeuibznv:TU-CONTRASENA@aws-0-us-east-1.pooler.supabase.com:5432/postgres" < backup-2026-10-18_2323.sql
```

## Detalles técnicos

- **Secreto en GitHub:** `SUPABASE_DBURL` (en Settings → Secrets and variables → Actions del repo
  de respaldos). Guarda la cadena de conexión completa, **nunca** se escribe en archivos del proyecto.
  (El robot también acepta el nombre `SUPABASE_DB_URL`.)
- **Si un respaldo falla:** aparece `respaldos/ERROR-....txt` con el detalle del problema;
  el siguiente lunes se reintenta solo. Cualquier cosa rara: avisar al asistente.
- **El robot** (workflow) vive en `.github/workflows/respaldo.yml` del repo de respaldos.
  Cada `git push` a ese repo también genera un respaldo (útil para probar).
- La conexión usa el **Session pooler** (compatible con IPv4): región `us-east-1`.
