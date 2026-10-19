import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Clientes } from './components/Clientes'
import { Facturacion } from './components/Facturacion'
import { Gastos } from './components/Gastos'
import { Igualas } from './components/Igualas'
import { Inicio } from './components/Inicio'
import { Layout, type Seccion } from './components/Layout'
import { Login } from './components/Login'
import { Pagos } from './components/Pagos'
import { Reportes } from './components/Reportes'
import { Servicios } from './components/Servicios'
import { ProveedorAvisos } from './components/toast'
import { isSupabaseConfigured, supabase } from './lib/supabase'

function SinConfigurar() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-borde bg-superficie p-6 shadow-2xl shadow-black/50">
        <h1 className="text-xl font-semibold tracking-tight text-tinta">AviTech Panel</h1>
        <p className="mt-2 text-sm text-tinta-suave">Falta conectar Supabase. Pasos:</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-tinta-suave">
          <li>
            Copia <code className="rounded-md bg-superficie-2 px-1.5 py-0.5 text-[13px] text-indigo-200">.env.example</code> como{' '}
            <code className="rounded-md bg-superficie-2 px-1.5 py-0.5 text-[13px] text-indigo-200">.env</code> y completa los
            valores del proyecto.
          </li>
          <li>
            Aplica las migraciones de{' '}
            <code className="rounded-md bg-superficie-2 px-1.5 py-0.5 text-[13px] text-indigo-200">supabase/sql</code> en orden
            — o usa el workflow «Migrar base de datos» en GitHub.
          </li>
          <li>
            Reinicia el servidor de desarrollo:{' '}
            <code className="rounded-md bg-superficie-2 px-1.5 py-0.5 text-[13px] text-indigo-200">npm run dev</code>.
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
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-borde border-t-indigo-400" />
        Cargando…
      </div>
    </div>
  )
}

function App() {
  const [sesion, setSesion] = useState<Session | null>(null)
  const [comprobando, setComprobando] = useState(isSupabaseConfigured)
  const [seccion, setSeccion] = useState<Seccion>('inicio')

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      setComprobando(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, sesionNueva) => {
      setSesion(sesionNueva)
      if (!sesionNueva) setSeccion('inicio')
      setComprobando(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (!isSupabaseConfigured) return <SinConfigurar />
  if (comprobando) return <Comprobando />

  return (
    <ProveedorAvisos>
      {sesion ? (
        <Layout sesion={sesion} seccion={seccion} onSeccion={setSeccion}>
          <div key={seccion} className="animar-entrada">
            {seccion === 'inicio' && <Inicio sesion={sesion} onIr={setSeccion} />}
            {seccion === 'clientes' && <Clientes />}
            {seccion === 'servicios' && <Servicios />}
            {seccion === 'igualas' && <Igualas />}
            {seccion === 'pagos' && <Pagos />}
            {seccion === 'facturacion' && <Facturacion />}
            {seccion === 'gastos' && <Gastos />}
            {seccion === 'reportes' && <Reportes />}
          </div>
        </Layout>
      ) : (
        <Login />
      )}
    </ProveedorAvisos>
  )
}

export default App
