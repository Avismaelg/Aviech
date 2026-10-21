import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const esSolicitudPublica = /^\/solicitud\/?$/i.test(window.location.pathname)
const esTalentoPublico = /^\/talento\/?$/i.test(window.location.pathname)

// Cada página carga solo su código: el portal público no descarga el panel
// interno y viceversa. El paquete inicial queda en lo mínimo.
const Pagina = esSolicitudPublica
  ? lazy(() =>
      import('./components/SolicitudPublica.tsx').then((modulo) => ({ default: modulo.SolicitudPublica })),
    )
  : esTalentoPublico
    ? lazy(() =>
        import('./components/TalentoPublico.tsx').then((modulo) => ({ default: modulo.TalentoPublico })),
      )
    : lazy(() => import('./App.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p role="status" className="text-sm text-tinta-suave">
            Cargando…
          </p>
        </div>
      }
    >
      <Pagina />
    </Suspense>
  </StrictMode>,
)

// Service worker (PWA): abre sin conexión y repite visitas al instante.
// Si hay una versión nueva, se toma al instante y se recarga una sola vez
// para que nadie se quede viendo una interfaz vieja guardada en caché.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const teniaControlador = Boolean(navigator.serviceWorker.controller)
  let recargando = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!teniaControlador || recargando) return
    recargando = true
    window.location.reload()
  })

  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register('/sw.js')
      .then((registro) => {
        const buscarActualizacion = () => {
          if (document.visibilityState === 'visible') void registro.update().catch(() => {})
        }
        document.addEventListener('visibilitychange', buscarActualizacion)
      })
      .catch(() => {
        // Si el registro falla, la app funciona igual (con red).
      })
  })
}
