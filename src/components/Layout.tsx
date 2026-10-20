import type { Session } from '@supabase/supabase-js'
import { Briefcase, FileText, Handshake, Inbox, LayoutDashboard, LogOut, Menu, Radar, Receipt, ReceiptText, SearchCheck, Target, Users, Wallet, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Fragment, useState, type ReactNode } from 'react'
import { cx } from '../lib/estilos'
import { supabase } from '../lib/supabase'
import { AsistenteIA } from './AsistenteIA'

export type Seccion =
  | 'inicio'
  | 'clientes'
  | 'crm'
  | 'seo'
  | 'prospeccion'
  | 'solicitudes'
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
  { id: 'solicitudes', etiqueta: 'Solicitudes', Icono: Inbox, grupo: 'Operación' },
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
  const inicial = correo.charAt(0).toUpperCase() || '?'
  const [menuAbierto, setMenuAbierto] = useState(false)

  function irA(destino: Seccion) {
    setMenuAbierto(false)
    onSeccion(destino)
  }

  return (
    <div className="min-h-screen text-tinta">
      {/* Barra superior: marca, cuenta y navegación en una sola pieza */}
      <header className="no-imprimir sticky top-0 z-40 border-b border-borde bg-superficie shadow-[0_1px_0_rgba(15,23,42,0.02)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-sm shadow-blue-600/25">
              A
            </span>
            <div className="min-w-0 leading-tight">
              <p className="font-display truncate text-sm font-semibold tracking-tight text-tinta">AviTech</p>
              <p className="hidden text-[11px] text-tinta-tenue sm:block">Panel interno</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 uppercase ring-1 ring-blue-100">
                {inicial}
              </span>
              <span className="hidden max-w-44 truncate text-xs text-tinta-suave md:block" title={correo}>
                {correo}
              </span>
            </div>
            <span aria-hidden className="hidden h-5 w-px bg-borde md:block" />
            <button
              type="button"
              onClick={salir}
              title="Cerrar sesión"
              className="flex items-center gap-1.5 rounded-full border border-borde px-2.5 py-1.5 text-xs font-medium text-tinta-suave transition-colors hover:bg-superficie-2 hover:text-tinta"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Salir</span>
              <span className="sr-only sm:hidden">Cerrar sesión</span>
            </button>
            <button
              type="button"
              onClick={() => setMenuAbierto((valor) => !valor)}
              aria-expanded={menuAbierto}
              aria-controls="menu-movil"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-borde text-tinta-suave transition-colors hover:bg-superficie-2 hover:text-tinta lg:hidden"
            >
              {menuAbierto ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        <nav
          aria-label="Secciones"
          className="sin-barra mx-auto hidden max-w-7xl items-center gap-1 overflow-x-auto px-3 pb-2 sm:px-5 lg:flex lg:px-7"
        >
          {GRUPOS.map((grupo, indice) => (
            <Fragment key={grupo}>
              {indice > 0 && <span aria-hidden className="mx-1.5 h-4 w-px shrink-0 bg-borde" />}
              <span
                aria-hidden
                className="hidden shrink-0 pr-0.5 pl-1 text-[10px] font-semibold tracking-[0.14em] text-tinta-tenue uppercase xl:inline"
              >
                {grupo}
              </span>
              {NAVEGACION.filter((item) => item.grupo === grupo).map(({ id, etiqueta }) => {
                const activo = seccion === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSeccion(id)}
                    aria-current={activo ? 'page' : undefined}
                    className={cx(
                      'shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150',
                      activo
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                        : 'text-tinta-suave hover:bg-superficie-2 hover:text-tinta',
                    )}
                  >
                    {etiqueta}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </nav>

        {/* Menú de secciones para móvil y tablet */}
        {menuAbierto && (
          <div
            id="menu-movil"
            className="animar-fundido max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-borde bg-superficie px-4 pt-3 pb-5 shadow-lg shadow-slate-900/5 sm:px-6 lg:hidden"
          >
            <p className="mb-3 truncate text-xs text-tinta-tenue" title={correo}>
              {correo}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {GRUPOS.map((grupo) => (
                <div key={grupo}>
                  <p className="mb-1.5 px-1 text-[10px] font-semibold tracking-[0.14em] text-tinta-tenue uppercase">{grupo}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {NAVEGACION.filter((item) => item.grupo === grupo).map(({ id, etiqueta }) => {
                      const activo = seccion === id
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => irA(id)}
                          aria-current={activo ? 'page' : undefined}
                          className={cx(
                            'rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors',
                            activo
                              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                              : 'text-tinta-suave hover:bg-superficie-2 hover:text-tinta',
                          )}
                        >
                          {etiqueta}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="area-impresion">
        <div className="area-impresion-contenido mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">{children}</div>
      </main>

      <AsistenteIA />
    </div>
  )
}
