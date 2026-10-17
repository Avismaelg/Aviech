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

## Conectar Supabase

1. Crea un proyecto en https://supabase.com (plan gratuito, sin tarjeta).
2. En *Project Settings → API*, copia la **URL** y la **clave anónima**.
3. Copia `.env.example` a `.env` y pega los valores.
4. Reinicia `npm run dev`.

> La clave anónima es pública por diseño. La seguridad real se define con
> **Row Level Security (RLS)** en cada tabla: activarlo siempre desde el primer día.

## Despliegue (cuando toque)

El contenido de `dist/` se publica gratis en **Cloudflare Pages** conectando el
repositorio de GitHub (build en la nube, sin consumir RAM local).

## Estructura

```
src/
  App.tsx          # pantalla principal (placeholder de Fase 1)
  lib/supabase.ts  # cliente compartido de Supabase
  index.css        # Tailwind CSS
```
