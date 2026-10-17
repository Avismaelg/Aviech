# Estado actual — dónde nos quedamos

> Última actualización: 17-oct-2026 (mañana)

## ✅ Recuento de hoy

- La app amaneció sin arrancar: una limpieza del sistema dejó archivos borrados
  a medias (`node_modules` y el favicon del proyecto). Ya está **todo restaurado**:
  - Reinstalación limpia de dependencias (`npm ci`) ✓
  - Compilación de producción verificada ✓
  - Favicon restaurado desde Git ✓
- GitHub quedó intacto: nada importante se perdió (todo estaba subido).

## ✅ La app funciona (en local)

- Panel AviTech operativo en `http://localhost:5173`.
- Supabase: proyecto conectado, tabla `clientes` con seguridad RLS,
  registro público cerrado (los usuarios solo se crean desde Supabase).

## 🚀 Cómo abrir el proyecto (2 comandos)

```powershell
cd C:\Users\User\avitech\avitech-panel
npm run dev
```

Luego abre: http://localhost:5173 (para detener: `Ctrl+C` en ese terminal)

## ⚠️ Reglas de oro para no dañar el proyecto

1. Ningún limpiador de disco ni antivirus debe tocar `C:\Users\User\avitech`.
2. No borrar `node_modules` a mano: si algo se daña, se repara con `npm ci`.
3. El archivo `.env` (conexión a Supabase) vive solo en este PC — no borrarlo.

## 📋 Próximos pasos (en orden sugerido)

1. **Publicar en internet** con Cloudflare Pages (gratis; requiere cuenta de Cloudflare).
2. **Respaldos automáticos** semanales de la base de datos (GitHub Actions).
3. Terminar limpieza de disco si se necesita (ya hay ~42 GB libres ✓).
