# Despliegue del panel en Cloudflare (estado real)

> Publicado el 18-oct-2026 con **Cloudflare Workers** (plan gratuito; permite uso comercial).
> Proyecto en Cloudflare: **`aviech`**, conectado al repo `Avismaelg/Aviech`, rama `main`.

## Cómo funciona (resumen)

- Cada `git push` a `main` dispara una compilación automática en Cloudflare
  (Workers Builds): instala dependencias → `npm run build` → publica `dist/`.
- La dirección pública está en el panel: **Workers & Pages → aviech → botón "Visit"**
  (formato `https://aviech.<subdominio>.workers.dev`).
- Las llaves de Supabase para la compilación se leen del archivo **`.env.production`**
  del repositorio (solo contiene la clave *publishable*, que es pública por diseño).
  ⚠️ No hace falta ni conviene guardar secretos en Cloudflare ni en ese archivo.

## Ver los despliegues

- Panel → **Workers & Pages** → **aviech** → pestaña **Deployments / Builds**:
  ahí aparecen los intentos con su estado (Success / Failed), fecha y logs.

## Problemas conocidos y solución

| Síntoma | Causa | Solución |
|---|---|---|
| El sitio carga pero dice "Falta conectar Supabase" | La compilación no incluyó las llaves | Verificar que `.env.production` esté en el repo y relanzar el despliegue |
| La compilación falla al instalar dependencias | Archivos dañados en el repo | Probar `npm ci && npm run build` en local y revisar el commit |
| Un despliegue no arranca solo | Trigger desactivado | Relanzar desde la pestaña Deployments, o hacer un push nuevo |

## Nota

Originalmente se planeó como proyecto "Pages" (direcciones `.pages.dev`) y también
es posible hacerlo así; el camino finalmente usado fue **Workers**, que es el que
Cloudflare ofrece por defecto hoy para conectar repositorios.
