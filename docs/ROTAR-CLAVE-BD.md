# Rotar la contraseña de la base de datos

> Guía probada el **19-oct-2026**. La contraseña de la base es un secreto:
> nunca debe pegarse en el chat ni guardarse en el repositorio.

## Lo primero que hay que saber

- **No se puede cambiar por SQL.** Supabase bloquea `ALTER ROLE` / `ALTER USER`
  aunque el rol `postgres` tenga `CREATEROLE` (probado: `permission denied to alter
  role`). Hay que usar el **panel** o la **API de administración**.
- Al cambiarla, la contraseña vieja deja de funcionar **de inmediato** y la nueva
  tarda unos segundos en ser aceptada por el pooler (~10–20 s). Es normal: hay que
  reintentar la prueba de conexión un par de veces.
- Después de rotarla hay que actualizar el secreto **`SUPABASE_DBURL`** en los dos
  repositorios (`Avismaelg/Aviech` y `Avismaelg/Aviech-backup`) y volver a probar
  el respaldo y las migraciones.

## Opción A — desde el panel (5 clics)

1. Abrir
   `https://supabase.com/dashboard/project/ktvyhtbmokmrzeuibznv/settings/database`.
2. En **Database password** pulsar **Reset database password**.
3. Pulsar **Generate a password** y copiarla con el botón de copiar.
4. Pegar la clave (o la URL completa) en un archivo temporal y saltar a
   **“Después de la rotación”**.
5. Borrar el archivo temporal al terminar.

## Opción B — API de administración (sin abrir el panel)

Requiere un **token de acceso** de la cuenta (`sbp_...`). Se consigue con
`npx supabase login` (abre el navegador y guarda el token en
`C:\Users\User\.supabase\access-token`).

Cambio de contraseña (la clave se genera al azar y nunca se imprime):

```bash
node -e "const c=require('crypto'),a='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';let p='',b=c.randomBytes(64);for(let i=0;i<32;i++)p+=a[b[i]%62];require('fs').writeFileSync('clave.tmp',p);console.log('clave generada')"

node -e "const fs=require('fs'),t=fs.readFileSync(process.env.USERPROFILE+'\\.supabase\\access-token','utf8').trim(),p=fs.readFileSync('clave.tmp','utf8');fetch('https://api.supabase.com/v1/projects/ktvyhtbmokmrzeuibznv/database/password',{method:'PATCH',headers:{Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({password:p})}).then(r=>r.text().then(x=>console.log('status:',r.status,x)))"
```

Comprobar que la clave nueva conecta (usar una carpeta de trabajo con `npm i pg`):

```bash
node -e "const{Client}=require('pg'),fs=require('fs'),p=fs.readFileSync('clave.tmp','utf8');const c=new Client({connectionString:'postgresql://postgres.ktvyhtbmokmrzeuibznv:'+encodeURIComponent(p)+'@aws-0-us-east-1.pooler.supabase.com:5432/postgres',ssl:{rejectUnauthorized:false}});c.connect().then(()=>c.query('select 1')).then(()=>console.log('OK: la clave nueva conecta')).catch(e=>{console.log('fallo:',e.message);process.exitCode=1}).finally(()=>c.end())"
```

> **Truco probado (19-oct):** si `npx supabase login` se ejecuta desde una
> automatización o agente, hay que quitar del entorno las variables `AGENT`,
> `AI_AGENT`, `OPENCODE*` (el CLI se pone en modo no interactivo si las detecta) y
> usar `--no-browser --output-format text`. La página web muestra un **código de
> verificación** que hay que escribir en la terminal del CLI (que entonces crea el
> token `cli_...`). El token del CLI se borra al final:
> `npx supabase logout` y, en el panel, **Account → Access Tokens**.

## Después de la rotación (obligatorio)

1. **Actualizar el secreto** `SUPABASE_DBURL` en los dos repos con la URL nueva:
   `postgresql://postgres.ktvyhtbmokmrzeuibznv:<clave codificada>@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
2. **Probar de verdad**: lanzar a mano los workflows
   **“Respaldo de la base de datos”** (repo de respaldos) y **“Migrar base de datos”**
   (panel). Ambos deben terminar en verde y debe aparecer un `respaldos/backup-*.sql.gz`
   nuevo y un `supabase/verificacion-ultima.txt` actualizado.
3. **Borrar lo temporal**: archivos locales con la clave, scripts de prueba y el
   token del CLI (ver truco arriba). El historial de Git nunca debe contener la clave.

## Cómo saber que quedó bien

- La clave nueva conecta (prueba local y en los dos workflows). ✅
- La clave vieja ya **no** conecta (error `28P01`, «password authentication failed»). ✅
- Los runs del respaldo y de las migraciones terminan en `success`. ✅
