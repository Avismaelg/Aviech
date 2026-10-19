import type { Session } from '@supabase/supabase-js'
import { ArrowRight, Banknote, Briefcase, Clock, Handshake, PiggyBank, Plus, TrendingDown, TrendingUp, Users } from 'lucide-react'
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
import type { Seccion } from './Layout'
import { Boton, CabeceraSeccion, Insignia, Tarjeta, Vacio } from './ui'

interface Resumen {
  clientes: Cliente[]
  servicios: Servicio[]
  pagos: Pago[]
  gastos: Gasto[]
  igualas: Iguala[]
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
    <Tarjeta className="group p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-950/40">
      <div className="flex items-center gap-3">
        <span
          className={cx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
            claseIcono,
          )}
        >
          <Icono size={19} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-tinta-suave">{titulo}</p>
          <p className={cx('truncate text-lg font-semibold tabular-nums', claseValor ?? 'text-tinta')}>{formatear(animado)}</p>
          {detalle && <p className="truncate text-[11px] text-tinta-tenue">{detalle}</p>}
        </div>
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
            <div className="pointer-events-none absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-md bg-superficie-2 px-2 py-1 text-[10px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
              {formatoDinero(punto.valor)}
            </div>
            <div
              className={cx(
                'animar-barra absolute right-0 bottom-0 left-0 rounded-t-md bg-gradient-to-t from-indigo-600 to-violet-400 shadow-[0_0_24px_rgba(129,140,248,0.3)] transition-[filter] duration-150 group-hover:brightness-110',
                punto.actual && 'from-indigo-500 to-violet-300',
              )}
              style={{ height: `${Math.max((punto.valor / maximo) * 100, punto.valor > 0 ? 8 : 3)}%` }}
            />
          </div>
          <span className={cx('text-center text-[10px]', punto.actual ? 'font-semibold text-indigo-300' : 'text-tinta-tenue')}>
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
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={radio} fill="none" strokeWidth="9" className="stroke-white/10" />
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
          <span className="text-2xl font-semibold text-tinta tabular-nums">{Math.round(proporcion * 100)}%</span>
          <span className="text-[10px] font-medium tracking-wide text-tinta-tenue uppercase">cobrado</span>
        </div>
      </div>
      <dl className="w-full space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-tinta-suave">Cobrado (histórico)</dt>
          <dd className="font-semibold text-emerald-300 tabular-nums">{formatoDinero(cobrado)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-tinta-suave">Por cobrar</dt>
          <dd className="font-semibold text-amber-300 tabular-nums">{formatoDinero(porCobrar)}</dd>
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
    ]).then(([consultaClientes, consultaServicios, consultaPagos, consultaGastos, consultaIgualas]) => {
      if (consultaClientes.error || consultaServicios.error || consultaPagos.error) setErrorTablas(true)
      setDatos({
        clientes: (consultaClientes.data ?? []) as Cliente[],
        servicios: (consultaServicios.data ?? []) as Servicio[],
        pagos: (consultaPagos.data ?? []) as Pago[],
        gastos: (consultaGastos.error ? [] : (consultaGastos.data ?? [])) as Gasto[],
        igualas: (consultaIgualas.error ? [] : (consultaIgualas.data ?? [])) as Iguala[],
      })
    })
  }, [])

  const nombre = (sesion.user.email ?? 'equipo').split('@')[0]

  if (errorTablas) {
    return (
      <section>
        <CabeceraSeccion titulo={`Hola, ${nombre}`} descripcion="Resumen general de AviTech." />
        <Tarjeta>
          <div className="p-6 text-sm text-amber-200">
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
        <CabeceraSeccion titulo={`Hola, ${nombre}`} descripcion="Este es el resumen de AviTech hoy." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, indice) => (
            <Tarjeta key={indice} className="p-4">
              <div className="h-10 animate-pulse rounded-lg bg-superficie-2" />
            </Tarjeta>
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Tarjeta className="p-4 lg:col-span-2">
            <div className="h-48 animate-pulse rounded-lg bg-superficie-2" />
          </Tarjeta>
          <Tarjeta className="p-4">
            <div className="h-48 animate-pulse rounded-lg bg-superficie-2" />
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
  const serie = serieIngresos(pagos)
  const totalPeriodo = serie.reduce((total, punto) => total + punto.valor, 0)
  const recientes = clientes.slice(0, 5)

  return (
    <section>
      <CabeceraSeccion titulo={`Hola, ${nombre}`} descripcion="Este es el resumen de AviTech hoy." />

      <div className="mb-6 flex flex-wrap gap-2">
        <Boton onClick={() => onIr('clientes')}>
          <Plus size={16} /> Cliente
        </Boton>
        <Boton variante="secundario" onClick={() => onIr('servicios')}>
          <Plus size={16} /> Servicio
        </Boton>
        <Boton variante="secundario" onClick={() => onIr('pagos')}>
          <Plus size={16} /> Pago
        </Boton>
        <Boton variante="secundario" onClick={() => onIr('facturacion')}>
          <Plus size={16} /> Factura
        </Boton>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-400/20 bg-teal-400/[0.06] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
            <Handshake size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Ingreso mensual recurrente (igualas)</p>
            <p className="text-base font-semibold text-tinta tabular-nums">
              {formatoDinero(ingresoRecurrente)}
              <span className="ml-2 text-xs font-normal text-tinta-tenue">
                {igualasActivas.length} activa{igualasActivas.length === 1 ? '' : 's'} en {clientesConIguala} cliente
                {clientesConIguala === 1 ? '' : 's'}
              </span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onIr('igualas')}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-teal-300 transition-colors hover:text-teal-200"
        >
          Ver igualas <ArrowRight size={13} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaDato
          Icono={Users}
          claseIcono="bg-indigo-400/10 text-indigo-300"
          titulo="Clientes activos"
          valor={activos}
          detalle={`de ${clientes.length} en total`}
        />
        <TarjetaDato
          Icono={Briefcase}
          claseIcono="bg-sky-400/10 text-sky-300"
          titulo="Servicios en curso"
          valor={enCurso}
          detalle={`${pendientesServicio} ${pendientesServicio === 1 ? 'pendiente' : 'pendientes'} de iniciar`}
        />
        <TarjetaDato
          Icono={Banknote}
          claseIcono="bg-emerald-400/10 text-emerald-300"
          titulo="Cobrado este mes"
          valor={cobradoMes}
          formatear={(numero) => formatoDinero(Math.round(numero))}
          detalle="Pagos recibidos"
        />
        <TarjetaDato
          Icono={Clock}
          claseIcono="bg-amber-400/10 text-amber-300"
          titulo="Por cobrar"
          valor={porCobrar}
          formatear={(numero) => formatoDinero(Math.round(numero))}
          detalle={`${pendientesPago.length} pago${pendientesPago.length === 1 ? '' : 's'} pendiente${pendientesPago.length === 1 ? '' : 's'}`}
        />
        <TarjetaDato
          Icono={TrendingDown}
          claseIcono="bg-rose-400/10 text-rose-300"
          titulo="Gastos este mes"
          valor={gastosMes}
          formatear={(numero) => formatoDinero(Math.round(numero))}
          detalle="Salidas registradas"
        />
        <TarjetaDato
          Icono={PiggyBank}
          claseIcono="bg-violet-400/10 text-violet-300"
          titulo="Balance del mes"
          valor={balanceMes}
          formatear={(numero) => formatoDinero(Math.round(numero))}
          claseValor={balanceMes >= 0 ? 'text-emerald-300' : 'text-rose-300'}
          detalle="Cobrado − gastos"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Tarjeta className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-borde-suave px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-tinta">Ingresos últimos 6 meses</h3>
              <p className="mt-0.5 text-xs text-tinta-tenue">
                Total del periodo: <span className="font-medium text-tinta-suave">{formatoDinero(totalPeriodo)}</span>
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <TrendingUp size={17} />
            </span>
          </div>
          <GraficoIngresos serie={serie} />
        </Tarjeta>

        <Tarjeta>
          <div className="border-b border-borde-suave px-4 py-3">
            <h3 className="text-sm font-semibold text-tinta">Estado de cobro</h3>
            <p className="mt-0.5 text-xs text-tinta-tenue">Pagado vs. pendiente (todo el historial)</p>
          </div>
          <AnilloCobro cobrado={cobradoHistorico} porCobrar={porCobrar} />
        </Tarjeta>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Tarjeta>
          <div className="flex items-center justify-between border-b border-borde-suave px-4 py-3">
            <h3 className="text-sm font-semibold text-tinta">Últimos clientes</h3>
            <button
              type="button"
              onClick={() => onIr('clientes')}
              className="flex items-center gap-1 text-xs font-medium text-indigo-300 hover:text-indigo-200"
            >
              Ver todos <ArrowRight size={13} />
            </button>
          </div>
          {recientes.length === 0 ? (
            <Vacio icono={<Users size={22} />} titulo="Aún no hay clientes" texto="Agrega tu primer cliente para verlo aquí." />
          ) : (
            <ul className="divide-y divide-borde-suave">
              {recientes.map((cliente) => (
                <li key={cliente.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-superficie-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-400/10 text-[11px] font-semibold text-indigo-300">
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
          <div className="flex items-center justify-between border-b border-borde-suave px-4 py-3">
            <h3 className="text-sm font-semibold text-tinta">Pagos pendientes</h3>
            <button
              type="button"
              onClick={() => onIr('pagos')}
              className="flex items-center gap-1 text-xs font-medium text-indigo-300 hover:text-indigo-200"
            >
              Ver todos <ArrowRight size={13} />
            </button>
          </div>
          {pendientesPago.length === 0 ? (
            <Vacio icono={<Banknote size={22} />} titulo="Todo cobrado" texto="No hay pagos pendientes por ahora. ¡Bien!" />
          ) : (
            <ul className="divide-y divide-borde-suave">
              {pendientesPago.slice(0, 5).map((pago) => (
                <li key={pago.id} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-superficie-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-tinta">{pago.concepto}</p>
                    <p className="truncate text-xs text-tinta-tenue">
                      {pago.clientes?.nombre ?? 'Cliente'} · {formatoFecha(pago.fecha)}
                      {diasDeAtraso(pago.fecha) > 0 && (
                        <>
                          {' · '}
                          <span className="font-medium text-red-300">
                            vencido hace {diasDeAtraso(pago.fecha)} día{diasDeAtraso(pago.fecha) === 1 ? '' : 's'}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <span
                    className={cx(
                      'shrink-0 text-sm font-semibold tabular-nums',
                      diasDeAtraso(pago.fecha) > 0 ? 'text-red-300' : 'text-tinta',
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
