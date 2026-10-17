# AviTech Panel

Panel de gestión de AviTech Solutions Group (Fase 1).
Stack: **Vite + React + TypeScript + Tailwind CSS + Supabase**.

## Requisitos

- Node.js LTS (probado con v24)
- npm (incluido con Node.js)

## Comandos

```powershell
npm install        # instalar dependencias (primera vez o al actualizar)
npm run dev        # servidor de desarrollo → http://localhost:5173
npm run build      # compilación de producción (genera dist/)
npm run preview    # previsualizar la compilación local
npm run lint       # revisión de código (oxlint)
```

> Regla del equipo: **un solo servidor de desarrollo a la vez**. Al terminar, `Ctrl+C`.

## Puesta en marcha con Supabase (solo la primera vez)

1. Crea un proyecto en https://supabase.com (plan gratuito, sin tarjeta). Elige la región
   más cercana a tus clientes.
2. En **SQL Editor → New query**, pega el contenido de `supabase/sql/001_clientes.sql` y pulsa
   **Run**. Esto crea la tabla `clientes` con seguridad RLS activada.
3. En **Project Settings → API**, copia la **URL** y la **clave anónima**.
4. Copia `.env.example` a `.env` y pega los valores.
5. Para entrar rápido durante el desarrollo: en **Authentication → Sign In / Providers → Email**,
   desactiva *Confirm email* (activar de nuevo antes de trabajar con clientes reales).
6. `npm run dev` → abre http://localhost:5173 → crea tu cuenta en la pantalla de acceso.

> Cuando ya tengas tus usuarios creados, revisa en **Authentication → Settings** la opción
> *Allow new users to sign up*: desactívala para que nadie más pueda registrarse.

## Seguridad (recordatorio permanente)

- La clave anónima es pública por diseño; la seguridad real vive en **RLS** en cada tabla.
- La clave `service_role` **nunca** va en el frontend ni en Git; solo en Edge Functions.
- `.env` está excluido de Git. No lo subas nunca.

## Despliegue (cuando toque)

El contenido de `dist/` se publica gratis en **Cloudflare Pages** conectando el
repositorio de GitHub (build en la nube, sin consumir RAM local).

## Estructura

```
src/
  App.tsx                 # sesión de Supabase → muestra Login o Panel
  components/
    Login.tsx             # acceso y creación de cuenta
    Panel.tsx             # cabecera + cierre de sesión
    Clientes.tsx          # listado y alta de clientes
  lib/supabase.ts         # cliente compartido de Supabase
  types/cliente.ts        # tipo Cliente
  index.css               # Tailwind CSS
supabase/
  sql/001_clientes.sql    # tabla + políticas RLS (pegar en SQL Editor)
```
