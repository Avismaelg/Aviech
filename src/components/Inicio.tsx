import type { Session } from '@supabase/supabase-js'
import { ArrowRight, Banknote, Briefcase, Clock, Handshake, Inbox, PiggyBank, Plus, TrendingDown, TrendingUp, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cx } from '../lib/estilos'
import { colorEstadoCliente, etiquetaEstadoCliente } from '../lib/etiquetas'
import { diasDeAtraso, formatoDinero, formatoFecha, iniciales, mesActualISO } from '../lib/formato'
import { supabase } from '../lib/supabase'
import { useContador } from '../lib/useContador'
import type { Cliente } from '../types/cliente'
import type { Gasto } from '../types/gasto'
import type { Iguala } from '../types/iguala'
import type { Pago } from '../types/pago'
import type { Servicio } from '../types/servicio'
import type { SolicitudServicio } from '../types/solicitud'
import type { Seccion } from './Layout'
import { Boton, CabeceraSeccion, Insignia, Tarjeta, Vacio } from './ui'

interface Resumen {
  clientes: Cliente[]
  servicios: Servicio[]
  pagos: Pago[]
  gastos: Gasto[]
  igualas: Iguala[]
  solicitudes: SolicitudServicio[]
}

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function TarjetaDato({
  Icono,
  claseIcono,
  titulo,
  valor,
  formatear = (numero) => String(Math.round(numero)),
  claseValor,
  detalle,
}: {
  Icono: LucideIcon
  claseIcono: string
  titulo: string
  valor: number
  formatear?: (numero: number) => string
  claseValor?: string
  detalle?: string
}) {
  const animado = useContador(valor)
  return (
    <Tarjeta className="group p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-tinta/25 hover:shadow-[0_28px_55px_-36px_rgba(20,20,19,0.4)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-tinta-tenue uppercase">{titulo}</p>
          <p className={cx('mt-2.5 truncate text-[30px] leading-none font-medium tracking-[-0.035em] tabular-nums', claseValor ?? 'text-tinta')}>
            {formatear(animado)}
          </p>
          {detalle && <p className="mt-2 truncate text-[11px] text-tinta-tenue">{detalle}</p>}
        </div>
        <span
          className={cx(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105',
            claseIcono,
          )}
        >
          <Icono size={19} />
        </span>
      </div>
    </Tarjeta>
  )
}

interface PuntoSerie {
  clave: string
  etiqueta: string
  valor: number
  actual: boolean
}

function serieIngresos(pagos: Pago[]): PuntoSerie[] {
  const ahora = new Date()
  const puntos: PuntoSerie[] = []
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
    const valor = pagos
      .filter((pago) => pago.estado === 'pagado' && (pago.fecha ?? '').slice(0, 7) === clave)
      .reduce((total, pago) => total + Number(pago.monto), 0)
    puntos.push({ clave, etiqueta: MESES_CORTOS[fecha.getMonth()], valor, actual: i === 0 })
  }
  return puntos
}

function GraficoIngresos({ serie }: { serie: PuntoSerie[] }) {
  const maximo = Math.max(...serie.map((punto) => punto.valor), 1)
  return (
    <div
      role="img"
      aria-label="Gráfica de barras con los ingresos de los últimos 6 meses"
      className="flex h-48 items-stretch gap-2 px-4 pt-5 pb-3 sm:gap-3"
    >
      {serie.map((punto) => (
        <div key={punto.clave} className="group flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-tinta px-2.5 py-1 text-[10px] font-medium whitespace-nowrap text-superficie opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
              {formatoDinero(punto.valor)}
            </div>
            <div
              className={cx(
                'animar-barra absolute right-0 bottom-0 left-0 rounded-t-[10px] transition-[filter] duration-150 group-hover:brightness-110',
                punto.actual ? 'bg-acento' : 'bg-accion',
              )}
              style={{ height: `${Math.max((punto.valor / maximo) * 100, punto.valor > 0 ? 8 : 3)}%` }}
            />
          </div>
          <span className={cx('text-center text-[10px]', punto.actual ? 'font-semibold text-clay' : 'text-tinta-tenue')}>
            {punto.etiqueta}
          </span>
        </div>
      ))}
    </div>
  )
}

function AnilloCobro({ cobrado, porCobrar }: { cobrado: number; porCobrar: number }) {
  const total = cobrado + porCobrar
  const proporcion = total > 0 ? cobrado / total : 0
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    const temporizador = window.setTimeout(() => setMontado(true), 80)
    return () => window.clearTimeout(temporizador)
  }, [])

  const radio = 42
  const circunferencia = 2 * Math.PI * radio
  const avance = montado ? proporcion : 0

  return (
    <div className="flex flex-col items-center gap-4 p-5">
      <div className="relative">
        <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
          <defs>
            <linearGradient id="gradiente-anillo" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#cf4500" />
              <stop offset="100%" stopColor="#f37338" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={radio} fill="none" strokeWidth="9" className="stroke-borde" />
          <circle
            cx="50"
            cy="50"
            r={radio}
            fill="none"
            strokeWidth="9"
            strokeLinecap="round"
            stroke="url(#gradiente-anillo)"
            strokeDasharray={circunferencia}
            strokeDashoffset={circunferencia * (1 - avance)}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-medium text-tinta tabular-nums">{Math.round(proporcion * 100)}%</span>
          <span className="text-[9px] font-bold tracking-[0.14em] text-tinta-tenue uppercase">cobrado</span>
        </div>
      </div>
      <dl className="w-full space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-tinta-suave">Cobrado (histórico)</dt>
          <dd className="font-semibold text-exito tabular-nums">{formatoDinero(cobrado)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-tinta-suave">Por cobrar</dt>
          <dd className="font-semibold text-aviso tabular-nums">{formatoDinero(porCobrar)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-borde-suave pt-1.5">
          <dt className="text-tinta-suave">Facturado</dt>
          <dd className="font-semibold text-tinta tabular-nums">{formatoDinero(total)}</dd>
        </div>
      </dl>
    </div>
  )
}

export function Inicio({ sesion, onIr }: { sesion: Session; onIr: (seccion: Seccion) => void }) {
  const [datos, setDatos] = useState<Resumen | null>(null)
  const [errorTablas, setErrorTablas] = useState(false)

  useEffect(() => {
    if (!supabase) return
    void Promise.all([
      supabase.from('clientes').select('*').order('created_at', { ascending: false }),
      supabase.from('servicios').select('*'),
      supabase.from('pagos').select('*, clientes(nombre)').order('fecha', { ascending: false }),
      supabase.from('gastos').select('*').order('fecha', { ascending: false }),
      supabase.from('igualas').select('*'),
      supabase.from('solicitudes_servicio').select('id, estado, titulo, created_at').order('created_at', { ascending: false }),
    ]).then(([consultaClientes, consultaServicios, consultaPagos, consultaGastos, consultaIgualas, consultaSolicitudes]) => {
      if (consultaClientes.error || consultaServicios.error || consultaPagos.error) setErrorTablas(true)
      setDatos({
        clientes: (consultaClientes.data ?? []) as Cliente[],
        servicios: (consultaServicios.data ?? []) as Servicio[],
        pagos: (consultaPagos.data ?? []) as Pago[],
        gastos: (consultaGastos.error ? [] : (consultaGastos.data ?? [])) as Gasto[],
        igualas: (consultaIgualas.error ? [] : (consultaIgualas.data ?? [])) as Iguala[],
        solicitudes: (consultaSolicitudes.error ? [] : (consultaSolicitudes.data ?? [])) as SolicitudServicio[],
      })
    })
  }, [])

  const nombre = (sesion.user.email ?? 'equipo').split('@')[0]
  const nombreVisible = nombre.charAt(0).toUpperCase() + nombre.slice(1)

  if (errorTablas) {
    return (
      <section>
        <CabeceraSeccion titulo={`Hola, ${nombreVisible}`} descripcion="Resumen general de AviTech." />
        <Tarjeta>
          <div className="p-6 text-sm text-aviso">
            Alguna tabla todavía no existe en la base de datos. Aplica las migraciones: GitHub → Actions → «Migrar base de datos» →
            Run workflow.
          </div>
        </Tarjeta>
      </section>
    )
  }

  if (!datos) {
    return (
      <section>
        <CabeceraSeccion titulo={`Hola, ${nombreVisible}`} descripcion="Este es el resumen de AviTech hoy." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, indice) => (
            <Tarjeta key={indice} className="p-4">
              <div className="h-10 animate-pulse rounded-[18px] bg-superficie-2" />
            </Tarjeta>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Tarjeta className="p-4 lg:col-span-2">
            <div className="h-48 animate-pulse rounded-[18px] bg-superficie-2" />
          </Tarjeta>
          <Tarjeta className="p-4">
            <div className="h-48 animate-pulse rounded-[18px] bg-superficie-2" />
          </Tarjeta>
        </div>
      </section>
    )
  }

  const clientes = datos.clientes
  const servicios = datos.servicios
  const pagos = datos.pagos
  const activos = clientes.filter((cliente) => cliente.estado === 'activo').length
  const enCurso = servicios.filter((servicio) => servicio.estado === 'en_curso').length
  const pendientesServicio = servicios.filter((servicio) => servicio.estado === 'pendiente').length
  const mesActual = mesActualISO()
  const cobradoMes = pagos
    .filter((pago) => pago.estado === 'pagado' && (pago.fecha ?? '').slice(0, 7) === mesActual)
    .reduce((total, pago) => total + Number(pago.monto), 0)
  const pendientesPago = pagos.filter((pago) => pago.estado === 'pendiente')
  const porCobrar = pendientesPago.reduce((total, pago) => total + Number(pago.monto), 0)
  const cobradoHistorico = pagos
    .filter((pago) => pago.estado === 'pagado')
    .reduce((total, pago) => total + Number(pago.monto), 0)
  const gastosMes = datos.gastos
    .filter((gasto) => (gasto.fecha ?? '').slice(0, 7) === mesActual)
    .reduce((total, gasto) => total + Number(gasto.monto), 0)
  const balanceMes = cobradoMes - gastosMes
  const igualasActivas = datos.igualas.filter((iguala) => iguala.estado === 'activa')
  const ingresoRecurrente = igualasActivas.reduce((total, iguala) => total + Number(iguala.monto_mensual), 0)
  const clientesConIguala = new Set(igualasActivas.map((iguala) => iguala.cliente_id)).size
  const solicitudesPendientes = datos.solicitudes.filter((solicitud) =>
    ['nueva', 'analizando', 'error'].includes(solicitud.estado),
  )
  const serie = serieIngresos(pagos)
  const totalPeriodo = serie.reduce((total, punto) => total + punto.valor, 0)
  const recientes = clientes.slice(0, 5)

  return (
    <section>
      <div className="relative mb-4 overflow-hidden rounded-[40px] border border-borde bg-superficie p-6 sm:p-8">
        <svg
          aria-hidden
          viewBox="0 0 420 260"
          className="pointer-events-none absolute -top-16 -right-10 h-[300px] w-[480px] text-acento-claro opacity-70"
          fill="none"
        >
          <circle cx="290" cy="80" r="116" stroke="currentColor" strokeOpacity="0.28" />
          <circle cx="290" cy="80" r="66" stroke="currentColor" strokeOpacity="0.18" />
          <path d="M92 210C175 92 292 66 406 132" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
          <circle cx="406" cy="132" r="5" fill="currentColor" />
        </svg>
        <span
          aria-hidden
          className="font-display pointer-events-none absolute -right-3 -bottom-16 text-[12rem] leading-none font-semibold text-tinta/[0.035] select-none"
        >
          A
        </span>

        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-clay uppercase">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-acento" /> Resumen de hoy
            </p>
            <h2 className="text-[34px] leading-[1.04] font-medium tracking-[-0.035em] text-tinta sm:text-[42px]">
              Hola, {nombreVisible}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-tinta-suave">
              Este es el pulso de AviTech hoy: cobros, servicios y solicitudes en una sola lectura.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Boton onClick={() => onIr('solicitudes')} className="px-4 py-2 text-xs">
              <Inbox size={14} /> Solicitud
            </Boton>
            <Boton variante="secundario" onClick={() => onIr('clientes')} className="px-4 py-2 text-xs">
              <Plus size={14} /> Cliente
            </Boton>
            <Boton variante="secundario" onClick={() => onIr('servicios')} className="px-4 py-2 text-xs">
              <Plus size={14} /> Servicio
            </Boton>
            <Boton variante="secundario" onClick={() => onIr('pagos')} className="px-4 py-2 text-xs">
              <Plus size={14} /> Pago
            </Boton>
            <Boton variante="secundario" onClick={() => onIr('facturacion')} className="px-4 py-2 text-xs">
              <Plus size={14} /> Factura
            </Boton>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[28px] bg-tinta px-5 py-4 text-superficie shadow-[0_24px_48px_-32px_rgba(20,20,19,0.55)]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-superficie/10 text-acento-claro ring-1 ring-superficie/10">
            <Handshake size={18} />
          </span>
          <div>
            <p className="text-[10px] font-bold tracking-[0.12em] text-superficie/50 uppercase">Ingreso mensual recurrente</p>
            <p className="text-lg font-medium tracking-tight text-superficie tabular-nums">
              {formatoDinero(ingresoRecurrente)}
              <span className="ml-2 text-xs font-normal text-superficie/55">
                {igualasActivas.length} activa{igualasActivas.length === 1 ? '' : 's'} en {clientesConIguala} cliente
                {clientesConIguala === 1 ? '' : 's'}
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onIr('igualas')}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-superficie/80 transition-colors hover:bg-superficie/10 hover:text-superficie"
        >
          Ver igualas <ArrowRight size={13} />
        </button>
      </div>

      {solicitudesPendientes.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-arena-borde bg-arena px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-superficie text-clay ring-1 ring-arena-borde">
              <Inbox size={18} />
            </span>
            <div>
              <p className="text-[10px] font-bold tracking-[0.12em] text-clay/70 uppercase">Solicitudes por revisar</p>
              <p className="text-lg font-medium tracking-tight text-tinta">
                {solicitudesPendientes.length} pendiente{solicitudesPendientes.length === 1 ? '' : 's'} de revisión
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onIr('solicitudes')}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-clay transition-colors hover:bg-superficie/70"
          >
            Ver solicitudes <ArrowRight size={13} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaDato
          Icono={Users}
          claseIcono="bg-arena text-clay ring-1 ring-arena-borde"
          titulo="Clientes activos"
          valor={activos}
          detalle={`de ${clientes.length} en total`}
        />
        <TarjetaDato
          Icono={Briefcase}
          claseIcono="bg-info-suave text-info ring-1 ring-info-borde"
          titulo="Servicios en curso"
          valor={enCurso}
          detalle={`${pendientesServicio} ${pendientesServicio === 1 ? 'pendiente' : 'pendientes'} de iniciar`}
        />
        <TarjetaDato
          Icono={Banknote}
          claseIcono="bg-exito-suave text-exito ring-1 ring-exito-borde"
          titulo="Cobrado este mes"
          valor={cobradoMes}
          formatear={(numero) => formatoDinero(Math.round(numero))}
          detalle="Pagos recibidos"
        />
        <TarjetaDato
          Icono={Clock}
          claseIcono="bg-aviso-suave text-aviso ring-1 ring-aviso-borde"
          titulo="Por cobrar"
          valor={porCobrar}
          formatear={(numero) => formatoDinero(Math.round(numero))}
          detalle={`${pendientesPago.length} pago${pendientesPago.length === 1 ? '' : 's'} pendiente${pendientesPago.length === 1 ? '' : 's'}`}
        />
        <TarjetaDato
          Icono={TrendingDown}
          claseIcono="bg-peligro-suave text-peligro ring-1 ring-peligro-borde"
          titulo="Gastos este mes"
          valor={gastosMes}
          formatear={(numero) => formatoDinero(Math.round(numero))}
          detalle="Salidas registradas"
        />
        <TarjetaDato
          Icono={PiggyBank}
          claseIcono="bg-superficie-2 text-tinta ring-1 ring-borde"
          titulo="Balance del mes"
          valor={balanceMes}
          formatear={(numero) => formatoDinero(Math.round(numero))}
          claseValor={balanceMes >= 0 ? 'text-exito' : 'text-peligro'}
          detalle="Cobrado − gastos"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Tarjeta className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-borde-suave px-5 py-4">
            <div>
              <h3 className="text-[15px] font-semibold text-tinta">Ingresos últimos 6 meses</h3>
              <p className="mt-0.5 text-xs text-tinta-tenue">
                Total del periodo: <span className="font-medium text-tinta-suave">{formatoDinero(totalPeriodo)}</span>
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-exito-suave text-exito ring-1 ring-exito-borde">
              <TrendingUp size={17} />
            </span>
          </div>
          <GraficoIngresos serie={serie} />
        </Tarjeta>

        <Tarjeta>
          <div className="border-b border-borde-suave px-5 py-4">
            <h3 className="text-[15px] font-semibold text-tinta">Estado de cobro</h3>
            <p className="mt-0.5 text-xs text-tinta-tenue">Pagado vs. pendiente (todo el historial)</p>
          </div>
          <AnilloCobro cobrado={cobradoHistorico} porCobrar={porCobrar} />
        </Tarjeta>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Tarjeta>
          <div className="flex items-center justify-between border-b border-borde-suave px-5 py-4">
            <h3 className="text-[15px] font-semibold text-tinta">Últimos clientes</h3>
            <button
              type="button"
              onClick={() => onIr('clientes')}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-clay transition-colors hover:bg-arena"
            >
              Ver todos <ArrowRight size={13} />
            </button>
          </div>
          {recientes.length === 0 ? (
            <Vacio icono={<Users size={22} />} titulo="Aún no hay clientes" texto="Agrega tu primer cliente para verlo aquí." />
          ) : (
            <ul className="divide-y divide-borde-suave">
              {recientes.map((cliente) => (
                <li key={cliente.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-arena/50">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-arena text-[11px] font-semibold text-clay">
                    {iniciales(cliente.nombre)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-tinta">{cliente.nombre}</p>
                    <p className="truncate text-xs text-tinta-tenue">{cliente.empresa ?? 'Sin empresa'}</p>
                  </div>
                  <Insignia color={colorEstadoCliente[cliente.estado] ?? 'slate'}>
                    {etiquetaEstadoCliente[cliente.estado] ?? cliente.estado}
                  </Insignia>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta>
          <div className="flex items-center justify-between border-b border-borde-suave px-5 py-4">
            <h3 className="text-[15px] font-semibold text-tinta">Pagos pendientes</h3>
            <button
              type="button"
              onClick={() => onIr('pagos')}
              className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-clay transition-colors hover:bg-arena"
            >
              Ver todos <ArrowRight size={13} />
            </button>
          </div>
          {pendientesPago.length === 0 ? (
            <Vacio icono={<Banknote size={22} />} titulo="Todo cobrado" texto="No hay pagos pendientes por ahora. ¡Bien!" />
          ) : (
            <ul className="divide-y divide-borde-suave">
              {pendientesPago.slice(0, 5).map((pago) => (
                <li key={pago.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-arena/50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-tinta">{pago.concepto}</p>
                    <p className="text-xs leading-snug text-tinta-tenue">
                      {pago.clientes?.nombre ?? 'Cliente'} · {formatoFecha(pago.fecha)}
                      {diasDeAtraso(pago.fecha) > 0 && (
                        <>
                          {' · '}
                          <span className="font-medium text-peligro">
                            vencido hace {diasDeAtraso(pago.fecha)} día{diasDeAtraso(pago.fecha) === 1 ? '' : 's'}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <span
                    className={cx(
                      'shrink-0 text-sm font-semibold tabular-nums',
                      diasDeAtraso(pago.fecha) > 0 ? 'text-peligro' : 'text-tinta',
                    )}
                  >
                    {formatoDinero(pago.monto)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </section>
  )
}
