# AviTech Solutions Group — Plan tecnológico v1

> Documento vivo. Precios y límites verificados el **16-oct-2026** en las páginas oficiales (fuentes al final).
> Regla de oro: antes de pagar cualquier servicio, re-verificar precio y límites, y que un ingreso lo cubra.

---

## 0. Resumen ejecutivo

- **Costo inicial: US$0/mes** (solo dominio ≈ US$10–12/año). Con hasta US$10/mes se añade IA de pago (DeepSeek) para productos en producción.
- **Stack:** Vite + React + TypeScript en Cloudflare Pages · Supabase (Postgres, Auth, Storage, Edge Functions) · IA vía APIs gratuitas (Groq, Gemini) o DeepSeek (pago, muy barato) · automatizaciones con Edge Functions/pg_cron, Workers Cron y GitHub Actions.
- **Nada local pesado:** sin Docker, sin VMs, sin Postgres local, sin modelos de IA locales, sin n8n local.
- **Regla clave del equipo:** el código se compila y despliega en la nube (Cloudflare Pages); tu PC solo ejecuta editores y un servidor de desarrollo a la vez.

| Capa | Herramienta | Costo |
|---|---|---|
| Editor + agente | VS Code + OpenCode | $0 |
| Runtime local | Node.js LTS + pnpm + Git | $0 |
| Frontend | Vite + React + TS + Tailwind → Cloudflare Pages | $0 |
| Datos/Auth | Supabase Free | $0 |
| IA (prototipos) | Groq / Gemini (tiers gratuitos) | $0 |
| IA (producción) | DeepSeek API | ~$5–10/mes si se usa |
| Automatizaciones | Edge Functions + pg_cron + Workers Cron + GitHub Actions | $0 |
| Versiones | Git + GitHub (repos privados gratis) | $0 |
| Dominio | Cloudflare Registrar | ≈$10–12/año |

---

## 1. Diagnóstico real del equipo (medido, no supuesto)

| Recurso | Estado medido | Implicación |
|---|---|---|
| RAM | **8 GB físicos** (1 módulo de 8 GB @ 2667 MT/s), no 4 GB | Mejor de lo que creías, pero… |
| RAM libre | **~0.6 GB libres** con Chrome + Edge WebView + VS Code + OpenCode abiertos | El problema real es la gestión de procesos, no el total |
| Disco C: | **10.7 GB libres** de 237 GB | ⚠️ Es la restricción más urgente (Windows + cachés necesitan espacio) |
| CPU/SO | Windows 11 Pro 64 bits | Correcto para el plan |
| Instalado | VS Code ✓, winget ✓, OpenCode ✓ | Base lista |
| Faltante | Node.js ✗, Git ✗ (ninguno instalado) | Instalar en Fase 0 (≈300 MB combinados) |

**Interpretación honesta:** con Chrome (~840 MB en 3 procesos), Edge WebView (~785 MB), VS Code (~190 MB) y OpenCode (~350 MB) tu PC ya está al límite *antes* de abrir un servidor de desarrollo. La buena noticia: 8 GB reales y agregar un segundo módulo de 8 GB (≈US$15–25 si hay ranura libre) elimina la mayoría de estos problemas — pero **no es necesario para arrancar**, y no lo compres hasta validar que el flujo de trabajo lo exige.

**Acciones inmediatas (sin gastar):**
1. Liberar disco hasta ≥25–30 GB libres (`cleanmgr`, Descargas, videos/fotos a la nube o disco externo).
2. Confirmar en *Administrador de tareas → Rendimiento → Memoria* que Windows ve los 8 GB (descartar hardware reservado).
3. Revisar cuántas ranuras de RAM tiene la placa (Administrador de tareas lo indica) — dato para una futura compra opcional.

---

## 2. Arquitectura recomendada (y por qué NO otras cosas)

### 2.1 Stack por capa

```
[Tu PC: VS Code + OpenCode + 1 dev server Vite]
        │ git push
        ▼
[GitHub: repos + Actions (cron/tareas programadas)]
        │ build automático en la nube
        ▼
[Cloudflare Pages: frontend estático] ──► [Supabase: Auth + Postgres + RLS + Storage]
        ▲                                        ▲
        │                                        │ Edge Functions + pg_cron
[APIs de IA: Groq/Gemini gratis, DeepSeek producción] ◄─┘ (secretos solo aquí)
```

- **Frontend: Vite + React + TypeScript + Tailwind CSS.** Compila a archivos estáticos → carga en Cloudflare Pages. El servidor de desarrollo de Vite consume poco (≈200–500 MB) frente a Next.js (≈0.8–1.8 GB).
- **Datos: Supabase Free.** Postgres administrado con Auth, Storage, Edge Functions (Deno) y pg_cron. La app habla directo con Supabase usando RLS (Row Level Security); la lógica con secretos vive en Edge Functions.
- **IA de producto: API externa, nunca local.** Groq y Gemini tienen tier gratuito para prototipos; DeepSeek es ridículamente barato para producción (ver sección 3).
- **Automatizaciones en la nube:** Edge Functions + `pg_cron` (todo dentro de Supabase), Workers Cron de Cloudflare (hasta 5 tareas programadas gratis) y GitHub Actions para tareas pesadas programadas. Todo esto corre 24/7 sin tu PC encendida.

### 2.2 Lo que NO usaremos (y por qué)

| Descartado | Razón |
|---|---|
| Next.js (por ahora) | Su servidor de desarrollo consume 2–4× más RAM que Vite y el MVP no necesita SSR. Reevaluar solo si un cliente paga hosting Pro. |
| Docker / WSL2 / VMs | Consumen RAM y disco que no tenemos; obligan a duplicar servicios. Supabase en la nube cubre todo. |
| Postgres/MySQL local | Ya existe en Supabase, administrado y con respaldos por tu cuenta. |
| Modelos de IA locales (Ollama, etc.) | Con 8 GB de RAM comprometerías Windows; las APIs externas son más capaces y baratas. |
| n8n local | Node + base de datos corriendo 24/7 en 8 GB = mala idea. n8n Cloud Starter cuesta 20 €/mes (no cabe solo). Automatizamos con código en free tiers. |
| Vercel Hobby para trabajo de clientes | Su plan gratuito es **solo uso personal no comercial**; Pro cuesta $20/usuario/mes. Cloudflare Pages permite uso comercial en el plan gratuito. |
| Herramientas duplicadas (Neon, Turso, Railway, etc.) | Supabase ya cubre base de datos + auth + storage; añadir más servicios = más mantenimiento y más factores de falla. |

### 2.3 Regla de dependencias

Cada dependencia nueva debe justificar: (a) qué problema resuelve, (b) cuánta RAM/disco añade, (c) qué alternativas nativas ya tenemos. Si no pasa las tres, no entra.

---

## 3. Servicios en la nube: planes gratuitos verificados (16-oct-2026)

| Servicio | Plan gratuito (límites clave) | Costo al escalar | ¿Cuándo pagar? |
|---|---|---|---|
| **Supabase** | 2 proyectos activos · 500 MB BD · 50.000 usuarios · 1 GB storage · 5 GB egress · 500.000 invocaciones Edge Functions · pausa tras 7 días de inactividad · **sin backups automáticos** | Pro $25/mes (8 GB disco, backups 7 días, sin pausas) | Cuando un cliente pague y necesites producción estable + backups |
| **Cloudflare Pages** | 500 builds/mes · builds en la nube · 100 proyectos · 20.000 archivos/sitio · previews ilimitados · requests de sitios estáticos sin costo · uso comercial permitido | Workers Paid $5/mes | Casi nunca al inicio |
| **Cloudflare Workers / Cron** | 100.000 requests/día · CPU 10 ms/request · 5 cron triggers/cuenta | $5/mes (CPU hasta 5 min, 250 crons) | Cuando una automatización supere CPU 10 ms |
| **GitHub** | Repos privados ilimitados · Actions ≈2.000 min/mes (privados) · backups de código | Copilot/otros aparte | No necesario |
| **Google Gemini API** | Tier gratuito sin tarjeta (límites RPM/RPD/TPM por modelo, visibles en AI Studio) | Pago por uso con spend caps | Solo si el tier gratis no alcanza para un cliente |
| **Groq API** | Tier gratuito (ej. gpt-oss-120b: 30 RPM · 1.000 req/día · 200.000 tokens/día; Whisper: 20 RPM · 2.000 audios/día) | Developer plan | Prototipos y demos suelen bastar gratis |
| **DeepSeek API** | No tiene tier gratis, pero es el más barato verificado: flash $0.15–0.30 / millón tokens entrada · $0.60–1.20 salida (off-peak/peak); cache hit $0.003–0.006; con US$10 haces **decenas de millones de tokens** | Igual (pago por uso) | Desde el primer producto con IA real |
| **n8n Cloud** | Sin tier gratis permanente (prueba 14 días) | Starter 20 €/mes · Pro 50 €/mes | Solo si un cliente lo paga como costo del proyecto |
| **Vercel** | Hobby gratis **solo personal/no comercial** | Pro $20/usuario/mes | No lo necesitamos con Cloudflare |
| **Dominio** | — | .com ≈ US$10–12/año en Cloudflare Registrar (a costo) | Al publicar el primer producto |

**Notas de riesgo de los free tiers:**
- Los límites gratuitos cambian. Verifica antes de depender de ellos para un cliente.
- El plan Free de Supabase **no incluye backups** → mitigación en sección 7.
- Un proyecto Supabase free se pausa tras 7 días sin actividad (en desarrollo no molesta; para producción de cliente, plan Pro pagado por el cliente).

---

## 4. Presupuesto (US$10/mes)

**Escenario A — Mes 1–2 (desarrollo y prototipos): $0/mes + dominio prorrateado (~$1/mes)**
Todo con free tiers. La IA para probar sale de Groq/Gemini gratis.

**Escenario B — Producción ligera (cuando ya hay uso real): hasta $10/mes**

| Concepto | Costo |
|---|---|
| Recarga DeepSeek (variable, solo uso real) | $5–10 |
| Dominio (amortizado) | ~$1 |
| Todo lo demás | $0 (free tiers) |
| **Total** | **$6–11/mes** |

**Qué NO pagar hasta tener ingresos que lo cubran** (regla: el ingreso del cliente debe cubrir la infraestructura ×3):
- Supabase Pro $25/mes → pasar cuando un cliente pague hosting/backups.
- Vercel Pro $20/mes → innecesario; usamos Cloudflare.
- n8n Cloud 20–50 €/mes → cobrarlo como costo del proyecto si el cliente lo requiere.
- PC nueva → cuando haya flujo de caja; mientras tanto, el upgrade de RAM (≈$15–25) es la mejora más rentable si el desarrollo se vuelve incómodo.

---

## 5. Guía de rendimiento local (reglas fijas para esta PC)

1. **Un solo servidor de desarrollo a la vez.** Al terminar: `Ctrl+C`. No dejar `dev` corriendo "por si acaso".
2. **Un solo navegador durante desarrollo** y con pocas pestañas. Cerrar Chrome si usas Edge o viceversa. Cerrar apps de fondo (Widgets, Teams, WebView2).
3. **Limitar Node:** definir `NODE_OPTIONS=--max-old-space-size=2048` para evitar que consuma todo.
4. **Usar pnpm** en lugar de npm: misma compatibilidad, store único con hardlinks → ahorra varios GB de disco (crítico con 10.7 GB libres).
5. **Excluir carpetas de proyecto del antivirus** (Seguridad de Windows → Exclusiones): acelera builds y escaneos.
6. **VS Code con extensiones mínimas** (lista en sección 8). Desinstalar/deshabilitar las que no se usen hoy.
7. **Compilar en la nube:** Cloudflare Pages hace el `build` al hacer push. Tu PC nunca compila producción.
8. **No sincronizar `node_modules` con OneDrive.** Excluir carpetas de proyecto de OneDrive (además de lento, duplica disco).
9. **Mantener pagefile gestionado por Windows** y ≥25 GB de disco libre.
10. **Limpiar cachés** cuando falte disco: `pnpm store prune`, `cleanmgr`, revisar `Downloads`.
11. **Un agente/proceso pesado a la vez.** OpenCode + dev server + 10 pestañas de Chrome no caben juntos cómodamente: elige dos.
12. **No instalar:** Docker, WSL2, antivirus de terceros, suites de oficina pesadas, servidores locales de base de datos.

Consumo aproximado de referencia (para planificar, no exacto):

| Proceso | RAM aproximada |
|---|---|
| Windows 11 en reposo | 2–3 GB |
| VS Code + 3–5 extensiones | 0.4–0.8 GB |
| Vite dev server | 0.2–0.5 GB |
| Next.js dev server (si algún día) | 0.8–1.8 GB |
| OpenCode | 0.2–0.4 GB |
| Navegador (5–10 pestañas) | 0.5–1.5 GB |
| **Presupuesto de trabajo cómodo** | **≤ 6 GB** |

---

## 6. Hoja de ruta por fases

| Fase | Objetivo | Entregable | Criterio de salida |
|---|---|---|---|
| **0. Preparación** (1 semana) | Instalar Node LTS + Git + pnpm, liberar disco, crear cuentas (GitHub, Supabase, Cloudflare, AI Studio, Groq) | Entorno funcional + cuentas listas | `pnpm create vite` funciona y la RAM se mantiene estable |
| **1. MVP interno** (2–4 semanas) | Construir **una** app propia de principio a fin (certificas el flujo completo: código → git → build nube → Supabase → uso real) | App CRUD con login y roles, desplegada en Cloudflare Pages | La usas tú o alguien de confianza durante 1+ semana |
| **2. Primer producto/cliente** | Añadir IA (DeepSeek) y/o automatización; dominio propio; proyecto Supabase por cliente; export semanal de la base | Producto cobrable con datos y respaldo | Un cliente real paga o firma piloto |
| **3. Escala (con ingresos)** | Pagar Supabase Pro / Workers Paid / n8n según demanda; PC nueva (16 GB+) cuando el flujo lo justifique; migrar lo necesario | Infraestructura estable de ingresos | El margen cubre la infraestructura ×3 |

**Proyectos candidatos para Fase 1** (elegir uno):
- Panel de gestión (clientes, inventario o facturación ligera) — clásico, validable con negocios locales.
- Automatización de reportes/procesos (ej. ordenar datos de correos/Excel en un panel).
- Sitio web corporativo + formularios que alimentan Supabase (portafolio de AviTech).
- Asistente/chatbot con IA para atención al cliente de un negocio pequeño.

---

## 7. Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Quedarse sin disco (10.7 GB libres) | Alta | Limpieza ya + reglas de sección 5 + `pnpm` |
| PC lenta al desarrollar (RAM) | Media-alta | Reglas sección 5; upgrade de RAM (≈$15–25) si molesta; PC nueva solo con ingresos |
| **Sin backups en Supabase Free** | Media | Export semanal automático (`pg_dump` vía GitHub Actions a las 2:00 a.m.) + código siempre en GitHub; plan Pro cuando haya cliente |
| Proyecto Supabase pausado por inactividad | Media | En desarrollo no importa; para producción de cliente: Pro pagado por el cliente |
| Free tiers cambian (Gemini/Groq) | Media | Producción con DeepSeek (pago barato y predecible); prototipos con lo gratuito; nunca depender de un solo proveedor IA |
| Usar Vercel Hobby para clientes (viola términos) | Baja | Hosting comercial → Cloudflare Pages (permitido) |
| Fuga de secretos (API keys) | Media | Secretos solo en Edge Functions/Cloudflare; nunca en el frontend ni en Git; 2FA en GitHub/Supabase/Cloudflare |
| Datos de clientes mal protegidos (RLS desactivado) | Media | RLS activado **siempre** desde el primer día; `service_role` key solo en el servidor |
| Dependencia de proveedor (lock-in) | Baja | Supabase = Postgres estándar (los datos son portables); frontend estático es portable a cualquier hosting |

---

## 8. Checklist de instalación (Fase 0)

```powershell
# 1. Node.js LTS y Git (≈300 MB en total, vía winget)
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Git.Git -e

# 2. Reiniciar la terminal y verificar
node -v
git --version

# 3. pnpm (gestor de paquetes ligero, ahorra disco)
corepack enable
corepack prepare pnpm@latest --activate

# 4. Identidad en Git
git config --global user.name "Tu Nombre"
git config --global user.email "tu@correo.com"
git config --global init.defaultBranch main

# 5. Extensiones mínimas de VS Code
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
```

**Cuentas a crear (todas gratuitas, sin tarjeta):** GitHub, Supabase, Cloudflare, Google AI Studio (clave Gemini), Groq (clave API).
**Tarjeta solo cuando decidas activar:** DeepSeek (recarga mínima ~$5) y dominio (≈$10–12/año).

**Plantilla base del primer proyecto (Fase 1):**
```powershell
pnpm create vite avitech-mvp --template react-ts
cd avitech-mvp
pnpm install
pnpm add @supabase/supabase-js
pnpm add -D tailwindcss @tailwindcss/vite
pnpm dev   # mantener SOLO este proceso a la vez
```

**Modelos gratuitos disponibles en OpenCode hoy:** `deepseek-v4.1-flash-free`, `glm-5.3-flash-free`, `nemotron-3.5-super-vl-free`, `longcat-2.5-preview-free`, `mimo-v2.6-flash-free`, `beam-free`, `space-bunny-free`. También puedes conectar tus claves gratuitas de Groq o Gemini como proveedores para tareas puntuales.

---

## 9. Próximos pasos inmediatos

**Estado de avance (16-oct-2026):**

- ✅ Node.js LTS **v24.20.0** + npm 11.19.0 instalados (winget)
- ✅ Git **2.55.0** instalado y registrado en el PATH del sistema · identidad configurada
- ✅ Proyecto **`avitech-panel`** creado: Vite 8 + React 19 + TypeScript + Tailwind 4 + Supabase JS
- ✅ **Módulo de acceso construido en código**: login/registro con Supabase Auth, panel con sesión, gestión de clientes (alta, listado, baja) y script SQL con RLS (`supabase/sql/001_clientes.sql`)
- ✅ Repositorio en GitHub creado, enlazado y sincronizado: `github.com/Avismaelg/Aviech` (commit `7f4dcff`)
- ✅ Build y lint sin errores · historial local y remoto al día
- ⏳ Pendiente (requiere tus cuentas): proyecto Supabase + ejecutar el SQL + `.env`; despliegue en Cloudflare Pages; cuentas de Google AI Studio y Groq (IA)
- ⏳ Pendiente (local): liberar disco hasta ≥25 GB
- ⏳ pnpm: pospuesto por decisión propia (se añade con `corepack enable` cuando haga falta)

**Próximos pasos (solo queda lo que requiere tus cuentas):**

1. Cuentas gratuitas: GitHub ✅ · faltan Supabase, Cloudflare, Google AI Studio y Groq.
2. Supabase → *New project* → **SQL Editor** → pegar `supabase/sql/001_clientes.sql` → Run.
3. Supabase → *Project Settings → API* → copiar URL + clave anónima → archivo `.env` (plantilla en `.env.example`).
4. `npm run dev` → crear tu cuenta en la app → probar el alta de clientes.
5. De ahora en adelante, guardar cambios con: `git add -A`, `git commit -m "..."`, `git push` (ya está enlazado).
6. Cloudflare Pages: conectar el repo → build `npm run build` → salida `dist` (el build corre en la nube).
7. Export semanal de respaldo antes de meter datos reales.

**Nota de Windows:** si PowerShell bloquea `npm` o `npx` (política de ejecución de scripts), usa `npm.cmd` / `npx.cmd`, o habilita scripts para tu usuario con:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

---

## Fuentes (verificadas 16-oct-2026)

- Supabase pricing: https://supabase.com/pricing
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Vercel Hobby (uso no comercial): https://vercel.com/docs/plans/hobby
- DeepSeek API pricing: https://api-docs.deepseek.com/quick_start/pricing
- Gemini API rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Groq rate limits: https://console.groq.com/docs/rate-limits
- n8n pricing: https://n8n.io/pricing/
