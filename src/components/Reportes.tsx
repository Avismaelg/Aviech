import { Download, Printer, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { descargarCSV } from '../lib/csv'
import { cx } from '../lib/estilos'
import {
  colorEstadoCliente,
  colorEstadoPago,
  colorEstadoServicio,
  etiquetaEstadoCliente,
  etiquetaEstadoPago,
  etiquetaEstadoServicio,
  etiquetaMetodoPago,
  etiquetaTipoServicio,
} from '../lib/etiquetas'
import { diasDeAtraso, fechaCompleta, formatoDinero, formatoFecha, formatoMes, hoyISO, iniciales } from '../lib/formato'
import { supabase } from '../lib/supabase'
import type { Cliente } from '../types/cliente'
import type { Gasto } from '../types/gasto'
import type { Pago } from '../types/pago'
import type { Servicio } from '../types/servicio'
import { Boton, CabeceraSeccion, FilasCargando, Insignia, Selector, Tarjeta, Vacio } from './ui'

interface Datos {
  clientes: Cliente[]
  servicios: Servicio[]
  pagos: Pago[]
  gastos: Gasto[]
}

/** Últimos N meses en formato "YYYY-MM", del más reciente al más viejo. */
function ultimosMeses(cantidad: number): string[] {
  const claves: string[] = []
  const ahora = new Date()
  for (let i = 0; i < cantidad; i++) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    claves.push(`${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`)
  }
  return claves
}

function estaVencido(pago: Pago): boolean {
  return pago.estado === 'pendiente' && diasDeAtraso(pago.fecha) > 0
}

function Monto({ valor, clase }: { valor: number | null | undefined; clase?: string }) {
  return <span className={cx('tabular-nums', clase)}>{formatoDinero(valor)}</span>
}

export function Reportes() {
  const [datos, setDatos] = useState<Datos | null>(null)
  const [errorTablas, setErrorTablas] = useState(false)
  const [vista, setVista] = useState<'cliente' | 'mensual'>('cliente')
  const [clienteId, setClienteId] = useState('')

  useEffect(() => {
    if (!supabase) return
    void Promise.all([
      supabase.from('clientes').select('*').order('nombre'),
      supabase.from('servicios').select('*').order('created_at', { ascending: false }),
      supabase.from('pagos').select('*, clientes(nombre)').order('fecha', { ascending: false }),
      supabase.from('gastos').select('*').order('fecha', { ascending: false }),
    ]).then(([consultaClientes, consultaServicios, consultaPagos, consultaGastos]) => {
      if (consultaClientes.error || consultaServicios.error || consultaPagos.error) setErrorTablas(true)
      setDatos({
        clientes: (consultaClientes.data ?? []) as Cliente[],
        servicios: (consultaServicios.data ?? []) as Servicio[],
        pagos: (consultaPagos.data ?? []) as Pago[],
        gastos: (consultaGastos.error ? [] : (consultaGastos.data ?? [])) as Gasto[],
      })
    })
  }, [])

  const meses = useMemo(() => ultimosMeses(12), [])

  const filasMensuales = useMemo(() => {
    if (!datos) return []
    return meses.map((clave) => {
      const cobrado = datos.pagos
        .filter((pago) => pago.estado === 'pagado' && (pago.fecha ?? '').slice(0, 7) === clave)
        .reduce((total, pago) => total + Number(pago.monto), 0)
      const porCobrar = datos.pagos
        .filter((pago) => pago.estado === 'pendiente' && (pago.fecha ?? '').slice(0, 7) === clave)
        .reduce((total, pago) => total + Number(pago.monto), 0)
      const gastos = datos.gastos
        .filter((gasto) => (gasto.fecha ?? '').slice(0, 7) === clave)
        .reduce((total, gasto) => total + Number(gasto.monto), 0)
      return { clave, cobrado, porCobrar, gastos, balance: cobrado - gastos }
    })
  }, [datos, meses])

  const totales = filasMensuales.reduce(
    (acumulado, fila) => ({
      cobrado: acumulado.cobrado + fila.cobrado,
      porCobrar: acumulado.porCobrar + fila.porCobrar,
      gastos: acumulado.gastos + fila.gastos,
      balance: acumulado.balance + fila.balance,
    }),
    { cobrado: 0, porCobrar: 0, gastos: 0, balance: 0 },
  )

  if (errorTablas) {
    return (
      <section>
        <CabeceraSeccion titulo="Reportes" descripcion="Estado de cuenta y resumen mensual." />
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
        <CabeceraSeccion titulo="Reportes" descripcion="Estado de cuenta y resumen mensual." />
        <Tarjeta>
          <FilasCargando filas={6} />
        </Tarjeta>
      </section>
    )
  }

  const cliente = datos.clientes.find((registro) => registro.id === clienteId) ?? null
  const serviciosCliente = cliente ? datos.servicios.filter((servicio) => servicio.cliente_id === cliente.id) : []
  const pagosCliente = cliente ? datos.pagos.filter((pago) => pago.cliente_id === cliente.id) : []
  const contratado = serviciosCliente.reduce((total, servicio) => total + Number(servicio.monto ?? 0), 0)
  const cobradoCliente = pagosCliente
    .filter((pago) => pago.estado === 'pagado')
    .reduce((total, pago) => total + Number(pago.monto), 0)
  const pendienteCliente = pagosCliente
    .filter((pago) => pago.estado === 'pendiente')
    .reduce((total, pago) => total + Number(pago.monto), 0)

  function exportarCSVCliente() {
    if (!cliente) return
    const filas: Array<Array<string | number>> = [
      ['Estado de cuenta', cliente.nombre],
      ['Empresa', cliente.empresa ?? ''],
      ['RNC', cliente.rnc ?? ''],
      ['Generado', fechaCompleta()],
      ['Contratado', contratado],
      ['Cobrado', cobradoCliente],
      ['Por cobrar', pendienteCliente],
      [],
      ['Concepto', 'Fecha', 'Método', 'Estado', 'Monto'],
      ...pagosCliente.map((pago) => [
        pago.concepto,
        pago.fecha,
        etiquetaMetodoPago[pago.metodo ?? ''] ?? '',
        estaVencido(pago) ? 'Vencido' : (etiquetaEstadoPago[pago.estado] ?? pago.estado),
        Number(pago.monto),
      ]),
    ]
    descargarCSV(`estado-cuenta-${cliente.nombre}-${hoyISO()}`, filas)
  }

  function exportarCSVMensual() {
    const filas: Array<Array<string | number>> = [
      ['Reporte mensual', 'AviTech Solutions Group'],
      ['Generado', fechaCompleta()],
      [],
      ['Mes', 'Cobrado', 'Por cobrar', 'Gastos', 'Balance'],
      ...filasMensuales.map((fila) => [formatoMes(fila.clave), fila.cobrado, fila.porCobrar, fila.gastos, fila.balance]),
      ['Total', totales.cobrado, totales.porCobrar, totales.gastos, totales.balance],
    ]
    descargarCSV(`reporte-mensual-${hoyISO()}`, filas)
  }

  return (
    <section>
      <div className="no-imprimir">
        <CabeceraSeccion
          titulo="Reportes"
          descripcion="Listos para imprimir, guardar en PDF o exportar a Excel."
          acciones={
            <div className="flex gap-2">
              <Boton variante="secundario" onClick={() => (vista === 'cliente' ? exportarCSVCliente() : exportarCSVMensual())}>
                <Download size={16} /> CSV
              </Boton>
              <Boton onClick={() => window.print()}>
                <Printer size={16} /> Imprimir / PDF
              </Boton>
            </div>
          }
        />
      </div>

      {/* Encabezado solo para impresión */}
      <div className="solo-impresion mb-5 border-b border-slate-200 pb-3">
        <h1 className="text-lg font-bold text-slate-900">AviTech Solutions Group</h1>
        <p className="text-sm text-slate-600">
          {vista === 'cliente' ? `Estado de cuenta — ${cliente?.nombre ?? 'Sin cliente seleccionado'}` : 'Resumen mensual de ingresos y gastos'}
        </p>
        <p className="text-xs text-slate-500">Generado el {fechaCompleta()}</p>
      </div>

      <div className="no-imprimir mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setVista('cliente')}
            className={cx(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150',
              vista === 'cliente' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            Por cliente
          </button>
          <button
            type="button"
            onClick={() => setVista('mensual')}
            className={cx(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150',
              vista === 'mensual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            Resumen mensual
          </button>
        </div>
        {vista === 'cliente' && (
          <Selector value={clienteId} onChange={(evento) => setClienteId(evento.target.value)} className="sm:w-72">
            <option value="">Elige un cliente…</option>
            {datos.clientes.map((registro) => (
              <option key={registro.id} value={registro.id}>
                {registro.nombre}
                {registro.empresa ? ` — ${registro.empresa}` : ''}
              </option>
            ))}
          </Selector>
        )}
      </div>

      {vista === 'cliente' && !cliente && (
        <Tarjeta>
          <Vacio
            icono={<UserRound size={22} />}
            titulo="Elige un cliente"
            texto="Selecciona un cliente para generar su estado de cuenta con servicios, pagos y saldos."
          />
        </Tarjeta>
      )}

      {vista === 'cliente' && cliente && (
        <div className="space-y-4">
          <Tarjeta className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                {iniciales(cliente.nombre)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{cliente.nombre}</p>
                <p className="truncate text-xs text-slate-500">
                  {[cliente.empresa, cliente.rnc ? `RNC ${cliente.rnc}` : null, cliente.email, cliente.telefono]
                    .filter(Boolean)
                    .join(' · ') || 'Sin datos de contacto'}
                </p>
              </div>
            </div>
            <Insignia color={colorEstadoCliente[cliente.estado] ?? 'slate'}>
              {etiquetaEstadoCliente[cliente.estado] ?? cliente.estado}
            </Insignia>
          </Tarjeta>

          <div className="grid gap-3 sm:grid-cols-3">
            <Tarjeta className="p-3.5">
              <p className="text-xs text-slate-500">Contratado (servicios)</p>
              <p className="text-base font-semibold text-slate-900">{formatoDinero(contratado)}</p>
            </Tarjeta>
            <Tarjeta className="p-3.5">
              <p className="text-xs text-slate-500">Cobrado</p>
              <p className="text-base font-semibold text-emerald-600">{formatoDinero(cobradoCliente)}</p>
            </Tarjeta>
            <Tarjeta className="p-3.5">
              <p className="text-xs text-slate-500">Por cobrar</p>
              <p className="text-base font-semibold text-amber-600">{formatoDinero(pendienteCliente)}</p>
            </Tarjeta>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Servicios</h3>
            <Tarjeta className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                      <th className="px-4 py-2.5 font-medium">Título</th>
                      <th className="px-4 py-2.5 font-medium">Tipo</th>
                      <th className="px-4 py-2.5 font-medium">Estado</th>
                      <th className="px-4 py-2.5 font-medium">Inicio</th>
                      <th className="px-4 py-2.5 font-medium">Fin</th>
                      <th className="px-4 py-2.5 text-right font-medium">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {serviciosCliente.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                          Sin servicios registrados.
                        </td>
                      </tr>
                    )}
                    {serviciosCliente.map((servicio) => (
                      <tr key={servicio.id}>
                        <td className="px-4 py-2.5 text-slate-800">{servicio.titulo}</td>
                        <td className="px-4 py-2.5 text-slate-500">{etiquetaTipoServicio[servicio.tipo] ?? servicio.tipo}</td>
                        <td className="px-4 py-2.5">
                          <Insignia color={colorEstadoServicio[servicio.estado] ?? 'slate'}>
                            {etiquetaEstadoServicio[servicio.estado] ?? servicio.estado}
                          </Insignia>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">{formatoFecha(servicio.fecha_inicio)}</td>
                        <td className="px-4 py-2.5 text-slate-500">{formatoFecha(servicio.fecha_fin)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <Monto valor={servicio.monto} clase="text-slate-800" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tarjeta>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Pagos</h3>
            <Tarjeta className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                      <th className="px-4 py-2.5 font-medium">Concepto</th>
                      <th className="px-4 py-2.5 font-medium">Fecha</th>
                      <th className="px-4 py-2.5 font-medium">Método</th>
                      <th className="px-4 py-2.5 font-medium">Estado</th>
                      <th className="px-4 py-2.5 text-right font-medium">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagosCliente.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">
                          Sin pagos registrados.
                        </td>
                      </tr>
                    )}
                    {pagosCliente.map((pago) => (
                      <tr key={pago.id}>
                        <td className="px-4 py-2.5 text-slate-800">{pago.concepto}</td>
                        <td className="px-4 py-2.5 text-slate-500">{formatoFecha(pago.fecha)}</td>
                        <td className="px-4 py-2.5 text-slate-500">{etiquetaMetodoPago[pago.metodo ?? ''] ?? '—'}</td>
                        <td className="px-4 py-2.5">
                          {estaVencido(pago) ? (
                            <Insignia color="red">Vencido</Insignia>
                          ) : (
                            <Insignia color={colorEstadoPago[pago.estado] ?? 'slate'}>
                              {etiquetaEstadoPago[pago.estado] ?? pago.estado}
                            </Insignia>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Monto valor={pago.monto} clase={pago.estado === 'pagado' ? 'text-emerald-600' : 'text-slate-700'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tarjeta>
          </div>
        </div>
      )}

      {vista === 'mensual' && (
        <div className="space-y-3">
          <Tarjeta className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                    <th className="px-4 py-2.5 font-medium">Mes</th>
                    <th className="px-4 py-2.5 text-right font-medium">Cobrado</th>
                    <th className="px-4 py-2.5 text-right font-medium">Por cobrar</th>
                    <th className="px-4 py-2.5 text-right font-medium">Gastos</th>
                    <th className="px-4 py-2.5 text-right font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filasMensuales.map((fila) => (
                    <tr key={fila.clave}>
                      <td className="px-4 py-2.5 text-slate-800">{formatoMes(fila.clave)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Monto valor={fila.cobrado} clase="text-emerald-600" />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Monto valor={fila.porCobrar} clase="text-amber-600" />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Monto valor={fila.gastos} clase="text-rose-600" />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Monto valor={fila.balance} clase={fila.balance >= 0 ? 'font-semibold text-slate-900' : 'font-semibold text-rose-600'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">Total (12 meses)</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">{formatoDinero(totales.cobrado)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-amber-700">{formatoDinero(totales.porCobrar)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-rose-700">{formatoDinero(totales.gastos)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{formatoDinero(totales.balance)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Tarjeta>
          <p className="text-xs text-slate-400">Balance = cobrado − gastos del mes. «Por cobrar» son pagos pendientes con fecha en ese mes.</p>
        </div>
      )}
    </section>
  )
}
