import type { Session } from '@supabase/supabase-js'
import { Briefcase, FileText, LayoutDashboard, LogOut, Receipt, ReceiptText, Users, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '../lib/estilos'
import { supabase } from '../lib/supabase'

export type Seccion = 'inicio' | 'clientes' | 'servicios' | 'pagos' | 'facturacion' | 'gastos' | 'reportes'

const NAVEGACION: Array<{ id: Seccion; etiqueta: string; Icono: LucideIcon }> = [
  { id: 'inicio', etiqueta: 'Inicio', Icono: LayoutDashboard },
  { id: 'clientes', etiqueta: 'Clientes', Icono: Users },
  { id: 'servicios', etiqueta: 'Servicios', Icono: Briefcase },
  { id: 'pagos', etiqueta: 'Pagos', Icono: Wallet },
  { id: 'facturacion', etiqueta: 'Facturación', Icono: ReceiptText },
  { id: 'gastos', etiqueta: 'Gastos', Icono: Receipt },
  { id: 'reportes', etiqueta: 'Reportes', Icono: FileText },
]

const BRILLO_LATERAL = 'radial-gradient(120% 55% at 50% -10%, rgba(99, 102, 241, 0.22), transparent)'

function salir() {
  void supabase?.auth.signOut()
}

export function Layout({
  sesion,
  seccion,
  onSeccion,
  children,
}: {
  sesion: Session
  seccion: Seccion
  onSeccion: (seccion: Seccion) => void
  children: ReactNode
}) {
  const correo = sesion.user.email ?? ''

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Barra lateral (escritorio) */}
      <aside
        className="no-imprimir fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-slate-900 md:flex"
        style={{ backgroundImage: BRILLO_LATERAL }}
      >
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/40">
            A
          </span>
          <div>
            <p className="text-sm font-semibold text-white">AviTech</p>
            <p className="text-[11px] text-slate-400">Panel interno</p>
          </div>
        </div>

        <nav className="mt-1 flex-1 space-y-1 px-3">
          {NAVEGACION.map(({ id, etiqueta, Icono }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSeccion(id)}
              className={cx(
                'relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                seccion === id
                  ? 'bg-indigo-500/15 text-white shadow-[inset_0_0_0_1px_rgba(99,102,241,0.25)]'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
              )}
            >
              {seccion === id && (
                <span aria-hidden className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-400" />
              )}
              <Icono size={17} className={seccion === id ? 'text-indigo-400' : ''} />
              {etiqueta}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300 uppercase">
              {correo.charAt(0) || '?'}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-slate-400" title={correo}>
              {correo}
            </span>
            <button
              type="button"
              onClick={salir}
              title="Cerrar sesión"
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Barra superior (móvil) */}
      <header
        className="no-imprimir sticky top-0 z-40 border-b border-slate-800 bg-slate-900 md:hidden"
        style={{ backgroundImage: 'radial-gradient(100% 160% at 50% -40%, rgba(99, 102, 241, 0.25), transparent)' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
              A
            </span>
            <span className="text-sm font-semibold text-white">AviTech</span>
          </div>
          <button
            type="button"
            onClick={salir}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-800"
          >
            <LogOut size={13} /> Salir
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {NAVEGACION.map(({ id, etiqueta, Icono }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSeccion(id)}
              className={cx(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
                seccion === id ? 'bg-indigo-500/20 text-white shadow-[inset_0_0_0_1px_rgba(99,102,241,0.35)]' : 'text-slate-400',
              )}
            >
              <Icono size={14} /> {etiqueta}
            </button>
          ))}
        </nav>
      </header>

      <main className="area-impresion md:pl-60">
        <div className="area-impresion-contenido mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  )
}
