import { isSupabaseConfigured } from './lib/supabase'

const pasos = [
  { texto: 'Proyecto Vite + React + TypeScript', listo: true },
  { texto: 'Tailwind CSS configurado', listo: true },
  { texto: 'Cliente de Supabase instalado', listo: true },
  { texto: 'Proyecto Supabase conectado (.env)', listo: isSupabaseConfigured },
]

function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-950/50 bg-slate-900 px-6 py-4 text-white">
        <h1 className="text-xl font-semibold tracking-tight">AviTech Panel</h1>
        <p className="text-sm text-slate-400">Panel de gestión · Fase 1</p>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">Estado del entorno</h2>
          <ul className="mt-4 space-y-2">
            {pasos.map((paso) => (
              <li key={paso.texto} className="flex items-center gap-3 text-sm">
                <span
                  aria-hidden="true"
                  className={
                    paso.listo
                      ? 'flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700'
                      : 'flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs text-amber-700'
                  }
                >
                  {paso.listo ? '✓' : '…'}
                </span>
                <span>{paso.texto}</span>
              </li>
            ))}
          </ul>

          {!isSupabaseConfigured && (
            <p className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              Siguiente paso: crea el proyecto en Supabase, copia <code>.env.example</code> a{' '}
              <code>.env</code> y completa la URL y la clave anónima.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
