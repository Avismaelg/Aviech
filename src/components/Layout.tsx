import type { Session } from '@supabase/supabase-js'
import { Briefcase, FileText, Handshake, LayoutDashboard, LogOut, Radar, Receipt, ReceiptText, SearchCheck, Target, Users, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from '../lib/estilos'
import { supabase } from '../lib/supabase'

export type Seccion =
  | 'inicio'
  | 'clientes'
  | 'crm'
  | 'seo'
  | 'prospeccion'
  | 'servicios'
  | 'igualas'
  | 'pagos'
  | 'facturacion'
  | 'gastos'
  | 'reportes'

const GRUPOS = ['Operación', 'Herramientas', 'Finanzas'] as const

const NAVEGACION: Array<{ id: Seccion; etiqueta: string; Icono: LucideIcon; grupo: (typeof GRUPOS)[number] }> = [
  { id: 'inicio', etiqueta: 'Inicio', Icono: LayoutDashboard, grupo: 'Operación' },
  { id: 'clientes', etiqueta: 'Clientes', Icono: Users, grupo: 'Operación' },
  { id: 'crm', etiqueta: 'CRM', Icono: Target, grupo: 'Operación' },
  { id: 'seo', etiqueta: 'Auditor SEO', Icono: SearchCheck, grupo: 'Herramientas' },
  { id: 'prospeccion', etiqueta: 'Prospección', Icono: Radar, grupo: 'Herramientas' },
  { id: 'servicios', etiqueta: 'Servicios', Icono: Briefcase, grupo: 'Finanzas' },
  { id: 'igualas', etiqueta: 'Igualas', Icono: Handshake, grupo: 'Finanzas' },
  { id: 'pagos', etiqueta: 'Pagos', Icono: Wallet, grupo: 'Finanzas' },
  { id: 'facturacion', etiqueta: 'Facturación', Icono: ReceiptText, grupo: 'Finanzas' },
  { id: 'gastos', etiqueta: 'Gastos', Icono: Receipt, grupo: 'Finanzas' },
  { id: 'reportes', etiqueta: 'Reportes', Icono: FileText, grupo: 'Finanzas' },
]

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
    <div className="min-h-screen text-tinta">
      {/* Barra lateral (escritorio) */}
      <aside className="no-imprimir fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-borde bg-[#0a101d] md:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-bold text-white shadow-sm ring-1 ring-white/15">
            A
          </span>
          <div>
            <p className="text-sm font-semibold text-white">AviTech</p>
            <p className="text-[11px] text-slate-400">Panel interno</p>
          </div>
        </div>

        <nav aria-label="Secciones" className="mt-2 flex-1 overflow-y-auto px-3 pb-4">
          {GRUPOS.map((grupo) => (
            <div key={grupo} className="pb-2">
              <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">{grupo}</p>
              <div className="space-y-0.5">
                {NAVEGACION.filter((item) => item.grupo === grupo).map(({ id, etiqueta, Icono }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSeccion(id)}
                    aria-current={seccion === id ? 'page' : undefined}
                    className={cx(
                      'relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                      seccion === id
                        ? 'bg-blue-500/10 text-white shadow-[inset_0_0_0_1px_rgba(59,130,246,0.28)]'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100',
                    )}
                  >
                    {seccion === id && (
                      <span aria-hidden className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-r-full bg-blue-400" />
                    )}
                    <Icono size={17} className={seccion === id ? 'text-blue-300' : ''} />
                    {etiqueta}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-borde p-3">
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-semibold text-blue-300 uppercase ring-1 ring-blue-400/25">
              {correo.charAt(0) || '?'}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-slate-400" title={correo}>
              {correo}
            </span>
            <button
              type="button"
              onClick={salir}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Barra superior (móvil) */}
      <header className="no-imprimir sticky top-0 z-40 border-b border-borde bg-[#0a101d] md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white ring-1 ring-white/15">
              A
            </span>
            <span className="text-sm font-semibold text-white">AviTech</span>
          </div>
          <button
            type="button"
            onClick={salir}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/5"
          >
            <LogOut size={13} /> Salir
          </button>
        </div>
        <nav aria-label="Secciones" className="sin-barra mascara-desvanecida flex gap-1 overflow-x-auto px-3 pb-2">
          {NAVEGACION.map(({ id, etiqueta, Icono }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSeccion(id)}
              aria-current={seccion === id ? 'page' : undefined}
              className={cx(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150',
                seccion === id
                  ? 'bg-blue-500/15 text-white shadow-[inset_0_0_0_1px_rgba(59,130,246,0.35)]'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
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
