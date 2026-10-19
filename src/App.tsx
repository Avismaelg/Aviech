import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Clientes } from './components/Clientes'
import { Facturacion } from './components/Facturacion'
import { Gastos } from './components/Gastos'
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">AviTech Panel</h1>
        <p className="mt-2 text-sm text-slate-600">Falta conectar Supabase. Pasos:</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>
            Copia <code>.env.example</code> como <code>.env</code> y completa los valores del proyecto.
          </li>
          <li>
            Aplica las migraciones de <code>supabase/sql</code> en orden — o usa el workflow «Migrar base de datos» en GitHub.
          </li>
          <li>
            Reinicia el servidor de desarrollo: <code>npm run dev</code>.
          </li>
        </ol>
      </div>
    </div>
  )
}

function Comprobando() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
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
