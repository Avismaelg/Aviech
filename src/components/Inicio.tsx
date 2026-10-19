import type { Session } from '@supabase/supabase-js'
import { ArrowRight, Banknote, Briefcase, Clock, Plus, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cx } from '../lib/estilos'
import { colorEstadoCliente, etiquetaEstadoCliente } from '../lib/etiquetas'
import { formatoDinero, formatoFecha, iniciales, mesActualISO } from '../lib/formato'
import { supabase } from '../lib/supabase'
import type { Cliente } from '../types/cliente'
import type { Pago } from '../types/pago'
import type { Servicio } from '../types/servicio'
import type { Seccion } from './Layout'
import { Boton, CabeceraSeccion, Insignia, Tarjeta, Vacio } from './ui'

interface Resumen {
  clientes: Cliente[]
  servicios: Servicio[]
  pagos: Pago[]
}

function TarjetaDato({
  Icono,
  claseIcono,
  titulo,
  valor,
  detalle,
}: {
  Icono: LucideIcon
  claseIcono: string
  titulo: string
  valor: string
  detalle?: string
}) {
  return (
    <Tarjeta className="p-4">
      <div className="flex items-center gap-3">
        <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', claseIcono)}>
          <Icono size={19} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{titulo}</p>
          <p className="truncate text-lg font-semibold text-slate-900">{valor}</p>
          {detalle && <p className="truncate text-[11px] text-slate-400">{detalle}</p>}
        </div>
      </div>
    </Tarjeta>
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
    ]).then(([consultaClientes, consultaServicios, consultaPagos]) => {
      if (consultaClientes.error || consultaServicios.error || consultaPagos.error) setErrorTablas(true)
      setDatos({
        clientes: (consultaClientes.data ?? []) as Cliente[],
        servicios: (consultaServicios.data ?? []) as Servicio[],
        pagos: (consultaPagos.data ?? []) as Pago[],
      })
    })
  }, [])

  const nombre = (sesion.user.email ?? 'equipo').split('@')[0]

  if (errorTablas) {
    return (
      <section>
        <CabeceraSeccion titulo={`Hola, ${nombre}`} descripcion="Resumen general de AviTech." />
        <Tarjeta>
          <div className="p-6 text-sm text-amber-800">
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
        <CabeceraSeccion titulo={`Hola, ${nombre}`} descripcion="Resumen general de AviTech." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, indice) => (
            <Tarjeta key={indice} className="p-4">
              <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
            </Tarjeta>
          ))}
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
  const recientes = clientes.slice(0, 5)

  return (
    <section>
      <CabeceraSeccion titulo={`Hola, ${nombre} 👋`} descripcion="Este es el resumen de AviTech hoy." />

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
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaDato
          Icono={Users}
          claseIcono="bg-indigo-50 text-indigo-600"
          titulo="Clientes activos"
          valor={String(activos)}
          detalle={`de ${clientes.length} en total`}
        />
        <TarjetaDato
          Icono={Briefcase}
          claseIcono="bg-sky-50 text-sky-600"
          titulo="Servicios en curso"
          valor={String(enCurso)}
          detalle={`${pendientesServicio} ${pendientesServicio === 1 ? 'pendiente' : 'pendientes'} de iniciar`}
        />
        <TarjetaDato
          Icono={Banknote}
          claseIcono="bg-emerald-50 text-emerald-600"
          titulo="Cobrado este mes"
          valor={formatoDinero(cobradoMes)}
          detalle="Pagos recibidos"
        />
        <TarjetaDato
          Icono={Clock}
          claseIcono="bg-amber-50 text-amber-600"
          titulo="Por cobrar"
          valor={formatoDinero(porCobrar)}
          detalle={`${pendientesPago.length} pago${pendientesPago.length === 1 ? '' : 's'} pendiente${pendientesPago.length === 1 ? '' : 's'}`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Tarjeta>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Últimos clientes</h3>
            <button
              type="button"
              onClick={() => onIr('clientes')}
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
            >
              Ver todos <ArrowRight size={13} />
            </button>
          </div>
          {recientes.length === 0 ? (
            <Vacio icono={<Users size={22} />} titulo="Aún no hay clientes" texto="Agrega tu primer cliente para verlo aquí." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recientes.map((cliente) => (
                <li key={cliente.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-600">
                    {iniciales(cliente.nombre)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{cliente.nombre}</p>
                    <p className="truncate text-xs text-slate-400">{cliente.empresa ?? 'Sin empresa'}</p>
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
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Pagos pendientes</h3>
            <button
              type="button"
              onClick={() => onIr('pagos')}
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
            >
              Ver todos <ArrowRight size={13} />
            </button>
          </div>
          {pendientesPago.length === 0 ? (
            <Vacio icono={<Banknote size={22} />} titulo="Todo cobrado" texto="No hay pagos pendientes por ahora. ¡Bien!" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {pendientesPago.slice(0, 5).map((pago) => (
                <li key={pago.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{pago.concepto}</p>
                    <p className="truncate text-xs text-slate-400">
                      {pago.clientes?.nombre ?? 'Cliente'} · {formatoFecha(pago.fecha)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-700">{formatoDinero(pago.monto)}</span>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </section>
  )
}
