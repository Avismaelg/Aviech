import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Rutas del proyecto:
//   /                 Sitio comercial público
//   /panel            Panel interno (login + secciones por hash)
//   /solicitud        Formulario público detallado
//   /talento          Portal público de talento
// Los enlaces antiguos del panel (/#crm, /#talento…) se redirigen a /panel.
const SECCIONES_PANEL = [
  'inicio',
  'clientes',
  'crm',
  'talento',
  'seo',
  'prospeccion',
  'solicitudes',
  'servicios',
  'igualas',
  'pagos',
  'facturacion',
  'gastos',
  'reportes',
] as const

const ruta = window.location.pathname.replace(/\/+$/, '') || '/'
const seccionAntigua = window.location.hash.replace(/^#\/?/, '')
const esSolicitudPublica = /^\/solicitud$/i.test(ruta)
const esTalentoPublico = /^\/talento$/i.test(ruta)
const esPanel = /^\/panel$/i.test(ruta)

const redirigirAlPanel =
  ruta === '/' &&
  !esSolicitudPublica &&
  !esTalentoPublico &&
  !esPanel &&
  SECCIONES_PANEL.includes(seccionAntigua as (typeof SECCIONES_PANEL)[number])

const Pagina = esSolicitudPublica
  ? lazy(() =>
      import('./components/SolicitudPublica.tsx').then((modulo) => ({ default: modulo.SolicitudPublica })),
    )
  : esTalentoPublico
    ? lazy(() =>
        import('./components/TalentoPublico.tsx').then((modulo) => ({ default: modulo.TalentoPublico })),
      )
    : esPanel
      ? lazy(() => import('./App.tsx'))
      : lazy(() =>
          import('./components/sitio/SitioPublico.tsx').then((modulo) => ({ default: modulo.SitioPublico })),
        )

function arrancar() {
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
}

if (redirigirAlPanel) {
  window.location.replace(`/panel#${seccionAntigua}`)
} else {
  arrancar()
}
