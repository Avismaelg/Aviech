import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Login } from './components/Login'
import { Panel } from './components/Panel'
import { isSupabaseConfigured, supabase } from './lib/supabase'

function SinConfigurar() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">AviTech Panel</h1>
        <p className="mt-2 text-sm text-slate-600">Falta conectar Supabase. Pasos:</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>
            Crea un proyecto gratuito en{' '}
            <a className="underline" href="https://supabase.com" target="_blank" rel="noreferrer">
              supabase.com
            </a>
            .
          </li>
          <li>
            Pega el contenido de <code>supabase/sql/001_clientes.sql</code> en el SQL Editor y
            ejecútalo.
          </li>
          <li>
            Copia <code>.env.example</code> a <code>.env</code> con la URL y la clave anónima del
            proyecto.
          </li>
          <li>
            Reinicia <code>npm run dev</code>.
          </li>
        </ol>
      </div>
    </div>
  )
}

function App() {
  const [sesion, setSesion] = useState<Session | null>(null)
  const [comprobando, setComprobando] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return

    void supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      setComprobando(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_evento, sesionNueva) => {
      setSesion(sesionNueva)
      setComprobando(false)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  if (!isSupabaseConfigured) return <SinConfigurar />

  if (comprobando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Cargando…</p>
      </div>
    )
  }

  return sesion ? <Panel sesion={sesion} /> : <Login />
}

export default App
