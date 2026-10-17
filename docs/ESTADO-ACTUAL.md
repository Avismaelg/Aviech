# Estado actual — dónde nos quedamos

> Última actualización: 16-oct-2026, noche

## ✅ Todo guardado y sincronizado

- Repositorio: https://github.com/Avismaelg/Aviech
- Último avance: login con limpieza automática de espacios en el correo
- El archivo `.env` vive **solo en este PC** (Git lo ignora). No borrarlo: contiene la
  conexión a Supabase.

## 🎯 Único pendiente para terminar la prueba del panel

**Problema visto:** al pulsar "Entrar" salía "Correo o contraseña incorrectos"
(no hay un usuario válido todavía, o la contraseña no coincide).

**Pasos para mañana:**

1. Abre la lista de usuarios de tu proyecto:
   `https://supabase.com/dashboard/project/ktvyhtbmokmrzeuibznv/auth/users`
2. Si tu correo **no aparece** → "Add user" → "Create new user" → correo + contraseña
   → marcar **"Auto Confirm User"** → "Create user".
   Si tu correo **sí aparece** → clic en el usuario → **"Reset password"** →
   define una contraseña nueva (solo letras y números, ej. `Avitech2026`) → guarda.
3. En la app entra con la pestaña **"Entrar"** (no "Crear cuenta"), correo exacto
   (sin espacios) y la contraseña.
4. Prueba el ciclo completo: agregar un cliente → verlo en la lista → eliminarlo.

## 🚀 Cómo abrir el proyecto mañana

Abre un terminal nuevo (PowerShell, o en VS Code: Terminal → Nueva terminal):

```powershell
cd C:\Users\User\avitech\avitech-panel
npm run dev
```

Luego abre en el navegador: **http://localhost:5173**
(para detener el servidor: `Ctrl+C` en ese terminal)

## 📋 Después de la prueba

1. **Cloudflare Pages** — publicar gratis en internet (requiere cuenta gratuita).
2. **Export semanal de respaldo** antes de meter datos reales.
3. Liberar disco hasta ≥25 GB (sigue pendiente desde el inicio).
