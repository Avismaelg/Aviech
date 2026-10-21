import type { Session } from '@supabase/supabase-js'
import { Briefcase, BriefcaseBusiness, FileText, Handshake, Inbox, LayoutDashboard, LogOut, Menu, Radar, Receipt, ReceiptText, SearchCheck, Sparkles, Target, Users, Wallet, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { cx } from '../lib/estilos'
import { supabase } from '../lib/supabase'
import { AsistenteIA } from './AsistenteIA'

export type Seccion =
  | 'inicio'
  | 'clientes'
  | 'crm'
  | 'talento'
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
  { id: 'talento', etiqueta: 'Talento', Icono: BriefcaseBusiness, grupo: 'Operación' },
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

const DESCRIPCIONES: Record<Seccion, string> = {
  inicio: 'Pulso operativo',
  clientes: 'Cartera y contactos',
  crm: 'Pipeline comercial',
  talento: 'Candidatos, vacantes y procesos',
  seo: 'Auditorías técnicas',
  prospeccion: 'Nuevos prospectos',
  solicitudes: 'Entrada y cierre con IA',
  servicios: 'Ejecución y entregables',
  igualas: 'Ingresos recurrentes',
  pagos: 'Cobros y conciliación',
  facturacion: 'NCF e ITBIS',
  gastos: 'Salidas operativas',
  reportes: 'Cierre y análisis',
}

function salir() {
  void supabase?.auth.signOut()
}

function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accion text-sm font-semibold text-superficie">
        A
        <span aria-hidden className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-superficie bg-acento" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="font-display truncate text-[15px] font-semibold tracking-[-0.025em] text-tinta">AviTech</p>
        <p className={cx('truncate text-[10px] tracking-[0.08em] text-tinta-tenue uppercase', compacta && 'hidden sm:block')}>
          Solutions Group
        </p>
      </div>
    </div>
  )
}

function FechaHoy({ fecha }: { fecha: string }) {
  return <span>{fecha.charAt(0).toUpperCase() + fecha.slice(1)}</span>
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
  const [fechaHoy] = useState(() =>
    new Intl.DateTimeFormat('es-DO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()),
  )
  const actual = NAVEGACION.find((item) => item.id === seccion)

  useEffect(() => {
    if (!menuAbierto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = anterior
    }
  }, [menuAbierto])

  function irA(destino: Seccion) {
    setMenuAbierto(false)
    onSeccion(destino)
  }

  return (
    <div className="min-h-screen bg-fondo text-tinta">
      {/* Barra lateral flotante (escritorio) */}
      <aside className="no-imprimir fixed inset-y-4 left-4 z-40 hidden w-[256px] flex-col overflow-hidden rounded-[36px] border border-borde bg-superficie p-3 shadow-[0_1px_0_rgba(20,20,19,0.03),0_30px_70px_-44px_rgba(20,20,19,0.4)] lg:flex">
        <div className="px-2 pt-2 pb-5">
          <Marca />
        </div>

        <nav aria-label="Secciones" className="sin-barra flex-1 space-y-4 overflow-y-auto pb-3">
          {GRUPOS.map((grupo) => (
            <div key={grupo}>
              <p className="mb-1.5 flex items-center gap-1.5 px-3 text-[10px] font-bold tracking-[0.15em] text-tinta-tenue uppercase">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-acento/70" />
                {grupo}
              </p>
              <div className="space-y-0.5">
                {NAVEGACION.filter((item) => item.grupo === grupo).map(({ id, etiqueta, Icono }) => {
                  const activo = seccion === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onSeccion(id)}
                      aria-current={activo ? 'page' : undefined}
                      className={cx(
                        'group flex w-full items-center gap-2.5 rounded-[18px] px-3 py-2 text-left text-[13px] font-medium transition-colors duration-150',
                        activo
                          ? 'bg-accion text-superficie shadow-[0_8px_18px_-14px_rgba(20,20,19,0.7)]'
                          : 'text-tinta-suave hover:bg-arena/70 hover:text-tinta',
                      )}
                    >
                      <Icono size={16} className={activo ? 'text-superficie' : 'text-tinta-tenue group-hover:text-clay'} aria-hidden />
                      <span className="truncate">{etiqueta}</span>
                      {activo && <span aria-hidden className="ml-auto h-1.5 w-1.5 rounded-full bg-acento-claro" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-3 rounded-[24px] border border-borde bg-arena/55 p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accion text-xs font-semibold text-superficie uppercase">
              {inicial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-tinta" title={correo}>
                {correo.split('@')[0]}
              </p>
              <p className="truncate text-[10px] text-tinta-tenue" title={correo}>
                {correo}
              </p>
            </div>
            <button
              type="button"
              onClick={salir}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-tinta-tenue transition-colors hover:bg-superficie hover:text-clay"
            >
              <LogOut size={15} />
            </button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 px-1 text-[9px] font-semibold tracking-[0.12em] text-tinta-tenue uppercase">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-exito" />
            Sistema privado
          </p>
        </div>
      </aside>

      {/* Cabecera flotante (móvil y tablet) */}
      <header className="no-imprimir sticky top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:hidden">
        <div className="mx-auto flex h-14 items-center justify-between gap-3 rounded-full border border-borde bg-superficie px-4 shadow-[0_12px_30px_-24px_rgba(20,20,19,0.4)]">
          <Marca compacta />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('abrir-asistente-ia'))}
              aria-label="Abrir asistente IA"
              aria-haspopup="dialog"
              title="Asistente IA"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-arena text-clay transition-colors hover:bg-acento/10"
            >
              <Sparkles size={15} aria-hidden />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-arena text-[11px] font-semibold text-clay uppercase">
              {inicial}
            </span>
            <button
              type="button"
              onClick={() => setMenuAbierto((valor) => !valor)}
              aria-expanded={menuAbierto}
              aria-controls="menu-movil"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-borde text-tinta-suave transition-colors hover:bg-arena hover:text-clay"
            >
              {menuAbierto ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      {menuAbierto && (
        <div className="no-imprimir animar-fundido fixed inset-0 z-50 bg-tinta/40 p-3 backdrop-blur-sm lg:hidden">
          <div
            id="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de secciones"
            className="animar-modal mx-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-[32px] border border-borde bg-superficie shadow-[0_40px_90px_-40px_rgba(20,20,19,0.55)]"
          >
            <div className="flex items-center justify-between border-b border-borde-suave px-5 py-4">
              <Marca />
              <button
                type="button"
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú"
                className="flex h-9 w-9 items-center justify-center rounded-full text-tinta-tenue transition-colors hover:bg-arena hover:text-clay"
              >
                <X size={18} />
              </button>
            </div>
            <div className="sin-barra flex-1 overflow-y-auto px-4 py-4">
              <div className="grid gap-5">
                {GRUPOS.map((grupo) => (
                  <div key={grupo}>
                    <p className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-bold tracking-[0.15em] text-tinta-tenue uppercase">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-acento/70" />
                      {grupo}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {NAVEGACION.filter((item) => item.grupo === grupo).map(({ id, etiqueta, Icono }) => {
                        const activo = seccion === id
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => irA(id)}
                            aria-current={activo ? 'page' : undefined}
                            className={cx(
                              'flex items-center gap-2 rounded-[18px] px-3 py-2.5 text-left text-sm font-medium transition-colors',
                              activo
                                ? 'bg-accion text-superficie'
                                : 'bg-superficie-2/60 text-tinta-suave hover:bg-arena hover:text-tinta',
                            )}
                          >
                            <Icono size={15} aria-hidden />
                            <span className="truncate">{etiqueta}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-borde-suave bg-arena/40 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-tinta">{correo.split('@')[0]}</p>
                <p className="truncate text-[10px] text-tinta-tenue" title={correo}>
                  {correo}
                </p>
              </div>
              <button
                type="button"
                onClick={salir}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-borde bg-superficie px-3 py-1.5 text-xs font-medium text-tinta-suave transition-colors hover:bg-arena hover:text-clay"
              >
                <LogOut size={14} /> Salir
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="area-impresion lg:pl-[288px]">
        <div className="area-impresion-contenido mx-auto max-w-[1440px] px-4 pt-5 pb-[calc(3rem+env(safe-area-inset-bottom))] sm:px-6 md:pt-6 lg:px-8 lg:pt-7 lg:pb-10">
          <div className="no-imprimir mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 text-[11px] text-tinta-tenue">
              <span className="font-semibold tracking-[0.08em] uppercase">AviTech</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-acento/70" />
              <span className="truncate font-medium text-tinta-suave">{actual?.etiqueta ?? 'Panel'}</span>
              <span className="hidden truncate text-tinta-tenue sm:inline">· {DESCRIPCIONES[seccion]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-[11px] text-tinta-tenue sm:block">
                <FechaHoy fecha={fechaHoy} />
              </span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('abrir-asistente-ia'))}
                aria-haspopup="dialog"
                className="group hidden items-center gap-1.5 rounded-full border border-tinta/15 bg-superficie px-3 py-1.5 text-[11px] font-semibold text-tinta transition-colors hover:border-tinta/35 hover:bg-arena lg:flex"
              >
                <Sparkles size={13} className="text-acento" aria-hidden /> Asistente IA
              </button>
            </div>
          </div>
          <div key={seccion} className="animar-entrada">
            {children}
          </div>
        </div>
      </main>

      <AsistenteIA />
    </div>
  )
}
