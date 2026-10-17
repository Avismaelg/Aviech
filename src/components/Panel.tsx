import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Clientes } from './Clientes'

export function Panel({ sesion }: { sesion: Session }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-950/50 bg-slate-900 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">AviTech Panel</h1>
            <p className="text-sm text-slate-400">Gestión de clientes · Fase 1</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden truncate text-slate-300 sm:block">{sesion.user.email}</span>
            <button
              type="button"
              onClick={() => void supabase?.auth.signOut()}
              className="rounded-md border border-slate-600 px-3 py-1.5 hover:bg-slate-800"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Clientes />
      </main>
    </div>
  )
}
