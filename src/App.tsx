import type { Session } from '@supabase/supabase-js'
import { Suspense, lazy, useEffect, useState } from 'react'
import { Layout, type Seccion } from './components/Layout'
import { Login } from './components/Login'
import { ProveedorAvisos } from './components/toast'
import { isSupabaseConfigured, supabase } from './lib/supabase'

// Cada sección viaja en su propio paquete: al entrar al panel solo se
// descarga lo que se va a mostrar y el resto se pide al abrir cada pestaña.
const Inicio = lazy(() => import('./components/Inicio').then((modulo) => ({ default: modulo.Inicio })))
const Clientes = lazy(() => import('./components/Clientes').then((modulo) => ({ default: modulo.Clientes })))
const Crm = lazy(() => import('./components/crm/Crm').then((modulo) => ({ default: modulo.Crm })))
const Talento = lazy(() =>
  import('./components/talento/Talento').then((modulo) => ({ default: modulo.Talento })),
)
const Seo = lazy(() => import('./components/seo/Seo').then((modulo) => ({ default: modulo.Seo })))
const Prospeccion = lazy(() =>
  import('./components/prospeccion/Prospeccion').then((modulo) => ({ default: modulo.Prospeccion })),
)
const Solicitudes = lazy(() =>
  import('./components/Solicitudes').then((modulo) => ({ default: modulo.Solicitudes })),
)
const Servicios = lazy(() =>
  import('./components/Servicios').then((modulo) => ({ default: modulo.Servicios })),
)
const Igualas = lazy(() => import('./components/Igualas').then((modulo) => ({ default: modulo.Igualas })))
const Pagos = lazy(() => import('./components/Pagos').then((modulo) => ({ default: modulo.Pagos })))
const Facturacion = lazy(() =>
  import('./components/Facturacion').then((modulo) => ({ default: modulo.Facturacion })),
)
const Gastos = lazy(() => import('./components/Gastos').then((modulo) => ({ default: modulo.Gastos })))
const Reportes = lazy(() =>
  import('./components/Reportes').then((modulo) => ({ default: modulo.Reportes })),
)

function SinConfigurar() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-[28px] border border-borde bg-superficie p-6 shadow-2xl shadow-tinta/15">
        <h1 className="text-xl font-semibold tracking-tight text-tinta">AviTech Panel</h1>
        <p className="mt-2 text-sm text-tinta-suave">Falta conectar Supabase. Pasos:</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-tinta-suave">
          <li>
            Copia <code className="rounded-md bg-superficie-2 px-1.5 py-0.5 text-[13px] text-clay">.env.example</code> como{' '}
            <code className="rounded-md bg-superficie-2 px-1.5 py-0.5 text-[13px] text-clay">.env</code> y completa los
            valores del proyecto.
          </li>
          <li>
            Aplica las migraciones de{' '}
            <code className="rounded-md bg-superficie-2 px-1.5 py-0.5 text-[13px] text-clay">supabase/sql</code> en orden
            — o usa el workflow «Migrar base de datos» en GitHub.
          </li>
          <li>
            Reinicia el servidor de desarrollo:{' '}
            <code className="rounded-md bg-superficie-2 px-1.5 py-0.5 text-[13px] text-clay">npm run dev</code>.
          </li>
        </ol>
      </div>
    </div>
  )
}

function Comprobando() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-tinta-suave">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-borde border-t-blue-600" />
        Cargando…
      </div>
    </div>
  )
}

function CargandoSeccion() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p role="status" className="text-sm text-tinta-suave">
        Cargando…
      </p>
    </div>
  )
}

const SECCIONES: Seccion[] = ['inicio', 'clientes', 'crm', 'talento', 'seo', 'prospeccion', 'solicitudes', 'servicios', 'igualas', 'pagos', 'facturacion', 'gastos', 'reportes']

/** Enlace profundo: la sección activa vive en la URL (#igualas), así se puede recargar, compartir y usar el botón Atrás. */
function seccionDesdeHash(): Seccion {
  const valor = window.location.hash.replace(/^#\/?/, '')
  return SECCIONES.includes(valor as Seccion) ? (valor as Seccion) : 'inicio'
}

function App() {
  const [sesion, setSesion] = useState<Session | null>(null)
  const [comprobando, setComprobando] = useState(isSupabaseConfigured)
  const [seccion, setSeccion] = useState<Seccion>(seccionDesdeHash)

  useEffect(() => {
    function alCambiarLaUrl() {
      setSeccion(seccionDesdeHash())
    }
    window.addEventListener('hashchange', alCambiarLaUrl)
    window.addEventListener('popstate', alCambiarLaUrl)
    return () => {
      window.removeEventListener('hashchange', alCambiarLaUrl)
      window.removeEventListener('popstate', alCambiarLaUrl)
    }
  }, [])

  useEffect(() => {
    const destino = `#${seccion}`
    if (window.location.hash === destino) return
    if (window.location.hash === '') window.history.replaceState(null, '', destino)
    else window.history.pushState(null, '', destino)
  }, [seccion])

  useEffect(() => {
    if (!supabase) return
    let activo = true
    const limite = window.setTimeout(() => {
      if (activo) setComprobando(false)
    }, 8_000)
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (activo) setSesion(data.session)
      })
      .catch(() => {
        if (activo) setSesion(null)
      })
      .finally(() => {
        window.clearTimeout(limite)
        if (activo) setComprobando(false)
      })
    const { data } = supabase.auth.onAuthStateChange((_evento, sesionNueva) => {
      if (!activo) return
      setSesion(sesionNueva)
      if (!sesionNueva) setSeccion('inicio')
      setComprobando(false)
    })
    return () => {
      activo = false
      window.clearTimeout(limite)
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    document.title = 'Panel · AviTech Solutions Group'
    const tema = document.querySelector('meta[name="theme-color"]')
    tema?.setAttribute('content', '#f3f0ee')
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.appendChild(robots)
    return () => {
      robots.remove()
    }
  }, [])

  if (!isSupabaseConfigured) return <SinConfigurar />
  if (comprobando) return <Comprobando />

  return (
    <ProveedorAvisos>
      {sesion ? (
        <Layout sesion={sesion} seccion={seccion} onSeccion={setSeccion}>
          <div key={seccion} className="animar-entrada">
            <Suspense fallback={<CargandoSeccion />}>
              {seccion === 'inicio' && <Inicio sesion={sesion} onIr={setSeccion} />}
              {seccion === 'clientes' && <Clientes />}
              {seccion === 'crm' && <Crm />}
              {seccion === 'talento' && <Talento />}
              {seccion === 'seo' && <Seo />}
              {seccion === 'prospeccion' && <Prospeccion onIrAlCrm={() => setSeccion('crm')} />}
              {seccion === 'solicitudes' && <Solicitudes onIrAServicios={() => setSeccion('servicios')} />}
              {seccion === 'servicios' && <Servicios />}
              {seccion === 'igualas' && <Igualas />}
              {seccion === 'pagos' && <Pagos />}
              {seccion === 'facturacion' && <Facturacion />}
              {seccion === 'gastos' && <Gastos />}
              {seccion === 'reportes' && <Reportes />}
            </Suspense>
          </div>
        </Layout>
      ) : (
        <Login />
      )}
    </ProveedorAvisos>
  )
}

export default App
