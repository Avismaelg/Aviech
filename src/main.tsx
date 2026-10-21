import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SolicitudPublica } from './components/SolicitudPublica.tsx'
import { TalentoPublico } from './components/TalentoPublico.tsx'

const esSolicitudPublica = /^\/solicitud\/?$/i.test(window.location.pathname)
const esTalentoPublico = /^\/talento\/?$/i.test(window.location.pathname)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {esSolicitudPublica ? <SolicitudPublica /> : esTalentoPublico ? <TalentoPublico /> : <App />}
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
