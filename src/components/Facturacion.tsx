import { ArrowLeft, Check, Download, Eye, Pencil, Plus, Printer, ReceiptText, Search, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAvisos } from '../lib/avisos'
import { descargarCSV } from '../lib/csv'
import { EMPRESA } from '../lib/empresa'
import { cx } from '../lib/estilos'
import {
  TIPOS_FACTURA,
  colorEstadoFactura,
  etiquetaEstadoFactura,
  etiquetaTipoFactura,
} from '../lib/etiquetas'
import { formatoDinero, formatoFecha, hoyISO, mesActualISO } from '../lib/formato'
import { supabase } from '../lib/supabase'
import type { Cliente } from '../types/cliente'
import type { Factura } from '../types/factura'
import {
  AreaTexto,
  Boton,
  BotonIcono,
  CabeceraSeccion,
  Campo,
  Confirmar,
  Entrada,
  ErrorTabla,
  FilasCargando,
  Insignia,
  Modal,
  Selector,
  Tarjeta,
  Vacio,
} from './ui'

const TASA_ITBIS = 0.18

interface Linea {
  descripcion: string
  cantidad: string
  precio: string
}

const LINEA_VACIA: Linea = { descripcion: '', cantidad: '1', precio: '' }

interface FormularioFactura {
  cliente_id: string
  tipo: string
  numero: string
  fecha: string
  aplica_itbis: boolean
  estado: string
  notas: string
  lineas: Linea[]
}

const FORMULARIO_VACIO: FormularioFactura = {
  cliente_id: '',
  tipo: 'B02',
  numero: '',
  fecha: hoyISO(),
  aplica_itbis: true,
  estado: 'borrador',
  notas: '',
  lineas: [{ ...LINEA_VACIA }],
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}

/** NCF tradicional: B + 10 dígitos · e-NCF: E + 12 dígitos. */
function ncFValido(numero: string): boolean {
  return /^B\d{10}$/.test(numero) || /^E\d{12}$/.test(numero)
}

function importeLinea(linea: Linea): number {
  return redondear((Number(linea.cantidad) || 0) * (Number(linea.precio) || 0))
}

function VistaFactura({ factura, onVolver }: { factura: Factura; onVolver: () => void }) {
  const items = factura.factura_items ?? []
  return (
    <section>
      <div className="no-imprimir mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-tinta-suave transition-colors hover:text-tinta"
        >
          <ArrowLeft size={16} /> Volver a facturas
        </button>
        <Boton onClick={() => window.print()}>
          <Printer size={16} /> Imprimir / PDF
        </Boton>
      </div>

      <Tarjeta className="documento-factura mx-auto max-w-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-borde pb-5">
          <div>
            <p className="text-lg font-bold tracking-tight text-tinta">{EMPRESA.nombre}</p>
            {EMPRESA.eslogan && <p className="text-xs text-tinta-suave">{EMPRESA.eslogan}</p>}
            <p className="mt-1.5 text-xs text-tinta-suave">{EMPRESA.direccion}</p>
            {EMPRESA.rnc && <p className="text-xs text-tinta-suave">RNC: {EMPRESA.rnc}</p>}
            {(EMPRESA.telefono || EMPRESA.correo) && (
              <p className="text-xs text-tinta-suave">{[EMPRESA.telefono, EMPRESA.correo].filter(Boolean).join(' · ')}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-tinta">Factura</p>
            <p className="text-xs text-tinta-suave">NCF: {factura.numero ?? '—'}</p>
            <p className="text-xs text-tinta-suave">
              Tipo: {factura.tipo} · {etiquetaTipoFactura[factura.tipo] ?? ''}
            </p>
            <p className="text-xs text-tinta-suave">Fecha: {formatoFecha(factura.fecha)}</p>
            <div className="no-imprimir mt-1.5">
              <Insignia color={colorEstadoFactura[factura.estado] ?? 'slate'}>
                {etiquetaEstadoFactura[factura.estado] ?? factura.estado}
              </Insignia>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-medium tracking-wide text-tinta-tenue uppercase">Facturar a</p>
          <p className="text-sm font-semibold text-tinta">{factura.cliente_nombre}</p>
          {factura.cliente_rnc && <p className="text-xs text-tinta-suave">RNC: {factura.cliente_rnc}</p>}
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-borde text-left text-xs text-tinta-tenue">
              <th className="py-2 font-medium">Descripción</th>
              <th className="py-2 text-right font-medium">Cant.</th>
              <th className="py-2 text-right font-medium">Precio</th>
              <th className="py-2 text-right font-medium">Importe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde-suave">
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-sm text-tinta-tenue">
                  Sin líneas de detalle.
                </td>
              </tr>
            )}
            {items.map((item, indice) => (
              <tr key={item.id ?? indice}>
                <td className="py-2 text-tinta">{item.descripcion}</td>
                <td className="py-2 text-right text-tinta-suave tabular-nums">{item.cantidad}</td>
                <td className="py-2 text-right text-tinta-suave tabular-nums">{formatoDinero(item.precio)}</td>
                <td className="py-2 text-right text-tinta tabular-nums">{formatoDinero(item.cantidad * item.precio)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 flex justify-end">
          <div className="w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-tinta-suave">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatoDinero(factura.subtotal)}</span>
            </div>
            <div className="flex justify-between text-tinta-suave">
              <span>ITBIS {factura.aplica_itbis ? '(18%)' : '(no aplica)'}</span>
              <span className="tabular-nums">{formatoDinero(factura.itbis)}</span>
            </div>
            <div className="flex justify-between border-t border-borde pt-1.5 text-base font-semibold text-tinta">
              <span>Total</span>
              <span className="tabular-nums">{formatoDinero(factura.total)}</span>
            </div>
          </div>
        </div>

        {factura.notas && (
          <p className="mt-5 border-t border-borde-suave pt-4 text-xs text-tinta-suave">Notas: {factura.notas}</p>
        )}

        <p className="mt-6 text-center text-[11px] text-tinta-tenue">
          {factura.tipo.startsWith('E') ? 'Comprobante fiscal electrónico (e-CF).' : 'Comprobante fiscal.'} Emitido con{' '}
          {EMPRESA.nombre} · Gracias por su preferencia.
        </p>
      </Tarjeta>
    </section>
  )
}

export function Facturacion() {
  const aviso = useAvisos()
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<FormularioFactura>(FORMULARIO_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todas')
  const [porEliminar, setPorEliminar] = useState<Factura | null>(null)
  const [porAnular, setPorAnular] = useState<Factura | null>(null)
  const [porPagar, setPorPagar] = useState<Factura | null>(null)
  const [viendo, setViendo] = useState<Factura | null>(null)

  const cargar = useCallback(async () => {
    if (!supabase) return
    const [respuestaFacturas, respuestaClientes] = await Promise.all([
      supabase.from('facturas').select('*, factura_items(*)').order('fecha', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('clientes').select('*').order('nombre'),
    ])
    if (respuestaFacturas.error) {
      const mensaje = respuestaFacturas.error.message
      setError(
        respuestaFacturas.error.code === 'PGRST205' || mensaje.includes('does not exist')
          ? 'La tabla "facturas" todavía no existe. Aplica las migraciones (workflow "Migrar base de datos" en GitHub).'
          : `No se pudieron cargar las facturas: ${mensaje}`,
      )
    } else {
      setError(null)
      setFacturas((respuestaFacturas.data ?? []) as Factura[])
    }
    setClientes((respuestaClientes.data ?? []) as Cliente[])
    setCargando(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- los setState ocurren después del await, no de forma sincrónica
    void cargar()
  }, [cargar])

  const mesActual = mesActualISO()
  const vigentes = facturas.filter((factura) => factura.estado !== 'anulada')
  const facturadoMes = vigentes
    .filter((factura) => (factura.fecha ?? '').slice(0, 7) === mesActual)
    .reduce((total, factura) => total + Number(factura.total), 0)
  const itbisMes = vigentes
    .filter((factura) => (factura.fecha ?? '').slice(0, 7) === mesActual)
    .reduce((total, factura) => total + Number(factura.itbis), 0)
  const porCobrarFacturas = facturas
    .filter((factura) => factura.estado === 'emitida')
    .reduce((total, factura) => total + Number(factura.total), 0)

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return facturas.filter((factura) => {
      const coincideEstado = filtroEstado === 'todas' || factura.estado === filtroEstado
      const coincideTexto =
        !texto ||
        (factura.cliente_nombre ?? '').toLowerCase().includes(texto) ||
        (factura.numero ?? '').toLowerCase().includes(texto)
      return coincideEstado && coincideTexto
    })
  }, [facturas, busqueda, filtroEstado])

  const lineasValidas = formulario.lineas.filter(
    (linea) => linea.descripcion.trim() !== '' && (Number(linea.precio) || 0) > 0,
  )
  const subtotalForm = redondear(formulario.lineas.reduce((total, linea) => total + importeLinea(linea), 0))
  const itbisForm = formulario.aplica_itbis ? redondear(subtotalForm * TASA_ITBIS) : 0
  const totalForm = redondear(subtotalForm + itbisForm)

  function abrirNueva() {
    setEditandoId(null)
    setFormulario({ ...FORMULARIO_VACIO, lineas: [{ ...LINEA_VACIA }] })
    setModalAbierto(true)
  }

  function abrirEdicion(factura: Factura) {
    const items = factura.factura_items ?? []
    setEditandoId(factura.id)
    setFormulario({
      cliente_id: factura.cliente_id ?? '',
      tipo: factura.tipo,
      numero: factura.numero ?? '',
      fecha: factura.fecha,
      aplica_itbis: factura.aplica_itbis,
      estado: factura.estado,
      notas: factura.notas ?? '',
      lineas:
        items.length > 0
          ? items.map((item) => ({
              descripcion: item.descripcion,
              cantidad: String(item.cantidad),
              precio: String(item.precio),
            }))
          : [{ ...LINEA_VACIA }],
    })
    setModalAbierto(true)
  }

  function actualizarLinea(indice: number, campo: keyof Linea, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      lineas: actual.lineas.map((linea, posicion) => (posicion === indice ? { ...linea, [campo]: valor } : linea)),
    }))
  }

  function agregarLinea() {
    setFormulario((actual) => ({ ...actual, lineas: [...actual.lineas, { ...LINEA_VACIA }] }))
  }

  function quitarLinea(indice: number) {
    setFormulario((actual) => ({ ...actual, lineas: actual.lineas.filter((_, posicion) => posicion !== indice) }))
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!supabase || guardando) return
    const cliente = clientes.find((registro) => registro.id === formulario.cliente_id) ?? null
    if (!cliente) {
      aviso('Elige un cliente para la factura', 'error')
      return
    }
    if (lineasValidas.length === 0) {
      aviso('Agrega al menos una línea con descripción y precio', 'error')
      return
    }
    const numero = formulario.numero.trim().toUpperCase()
    if (numero && !ncFValido(numero)) {
      aviso('El NCF/e-NCF no tiene un formato válido (ej. B0200000001 o E320000000001)', 'error')
      return
    }
    if (numero && numero.slice(0, 3) !== formulario.tipo) {
      aviso(`El NCF no corresponde al tipo ${formulario.tipo}`, 'error')
      return
    }
    if (formulario.estado !== 'borrador' && !numero) {
      aviso('Para emitir la factura se necesita el NCF/e-NCF', 'error')
      return
    }

    setGuardando(true)
    const datosFactura = {
      cliente_id: cliente.id,
      cliente_nombre: cliente.nombre,
      cliente_rnc: cliente.rnc ?? null,
      numero: numero || null,
      tipo: formulario.tipo,
      fecha: formulario.fecha || hoyISO(),
      aplica_itbis: formulario.aplica_itbis,
      subtotal: subtotalForm,
      itbis: itbisForm,
      total: totalForm,
      estado: formulario.estado,
      notas: formulario.notas.trim() || null,
    }

    let facturaId = editandoId
    if (editandoId) {
      const { error: errorUpdate } = await supabase.from('facturas').update(datosFactura).eq('id', editandoId)
      if (errorUpdate) {
        aviso(`No se pudo guardar la factura: ${errorUpdate.message}`, 'error')
        setGuardando(false)
        return
      }
      const { error: errorLimpieza } = await supabase.from('factura_items').delete().eq('factura_id', editandoId)
      if (errorLimpieza) {
        aviso(`No se pudieron actualizar las líneas: ${errorLimpieza.message}`, 'error')
        setGuardando(false)
        return
      }
    } else {
      const { data: creada, error: errorInsert } = await supabase
        .from('facturas')
        .insert(datosFactura)
        .select('id')
        .single()
      if (errorInsert || !creada) {
        aviso(`No se pudo crear la factura: ${errorInsert?.message ?? 'error desconocido'}`, 'error')
        setGuardando(false)
        return
      }
      facturaId = creada.id as string
    }

    const { error: errorItems } = await supabase.from('factura_items').insert(
      lineasValidas.map((linea) => ({
        factura_id: facturaId,
        descripcion: linea.descripcion.trim(),
        cantidad: Number(linea.cantidad) || 1,
        precio: Number(linea.precio) || 0,
      })),
    )
    if (errorItems) {
      aviso(`No se guardaron las líneas: ${errorItems.message}`, 'error')
      setGuardando(false)
      return
    }

    setGuardando(false)
    setModalAbierto(false)
    aviso(
      editandoId
        ? 'Factura actualizada'
        : formulario.estado === 'borrador'
          ? 'Borrador guardado'
          : 'Factura emitida',
    )
    await cargar()
  }

  async function marcarPagada(factura: Factura) {
    if (!supabase || procesando) return
    if (!factura.cliente_id) {
      aviso('La factura no tiene un cliente válido para registrar el pago', 'error')
      return
    }
    setProcesando(true)
    const { data: pago, error: errorPago } = await supabase
      .from('pagos')
      .insert({
        cliente_id: factura.cliente_id,
        concepto: factura.numero ? `Factura ${factura.numero}` : `Factura del ${formatoFecha(factura.fecha)}`,
        monto: factura.total,
        fecha: hoyISO(),
        estado: 'pagado',
        metodo: null,
        notas: 'Registrado automáticamente desde Facturación',
      })
      .select('id')
      .single()
    if (errorPago || !pago) {
      aviso(`No se pudo registrar el pago: ${errorPago?.message ?? 'error desconocido'}`, 'error')
      setProcesando(false)
      return
    }
    const { error: errorFactura } = await supabase
      .from('facturas')
      .update({ estado: 'pagada', pago_id: pago.id })
      .eq('id', factura.id)
    if (errorFactura) {
      await supabase.from('pagos').delete().eq('id', pago.id)
      aviso(`No se pudo marcar como pagada: ${errorFactura.message}`, 'error')
      setProcesando(false)
      return
    }
    setProcesando(false)
    aviso('Factura pagada; el pago quedó registrado en Pagos')
    await cargar()
  }

  async function anular(factura: Factura) {
    if (!supabase || procesando) return
    setProcesando(true)
    const { error: errorAnular } = await supabase.from('facturas').update({ estado: 'anulada' }).eq('id', factura.id)
    setProcesando(false)
    if (errorAnular) {
      aviso(`No se pudo anular: ${errorAnular.message}`, 'error')
      return
    }
    aviso('Factura anulada')
    await cargar()
  }

  async function eliminar(factura: Factura) {
    if (!supabase) return
    const { error: errorEliminar } = await supabase.from('facturas').delete().eq('id', factura.id)
    if (errorEliminar) {
      aviso(`No se pudo eliminar: ${errorEliminar.message}`, 'error')
      return
    }
    aviso('Borrador eliminado')
    await cargar()
  }

  function exportarCSV() {
    const filas: Array<Array<string | number>> = [
      ['Cliente', 'RNC', 'NCF', 'Tipo', 'Fecha', 'Estado', 'Subtotal', 'ITBIS', 'Total'],
      ...filtradas.map((factura) => [
        factura.cliente_nombre,
        factura.cliente_rnc ?? '',
        factura.numero ?? '',
        factura.tipo,
        factura.fecha,
        etiquetaEstadoFactura[factura.estado] ?? factura.estado,
        Number(factura.subtotal),
        Number(factura.itbis),
        Number(factura.total),
      ]),
    ]
    descargarCSV(`facturas-${hoyISO()}`, filas)
  }

  if (viendo) {
    const actual = facturas.find((factura) => factura.id === viendo.id) ?? viendo
    return <VistaFactura factura={actual} onVolver={() => setViendo(null)} />
  }

  return (
    <section>
      <CabeceraSeccion
        titulo="Facturación"
        descripcion={`${facturas.length} comprobante${facturas.length === 1 ? '' : 's'} · NCF/e-NCF con ITBIS 18%`}
        acciones={
          <div className="flex gap-2">
            <Boton variante="secundario" onClick={exportarCSV} disabled={facturas.length === 0}>
              <Download size={16} /> CSV
            </Boton>
            <Boton onClick={abrirNueva}>
              <Plus size={16} /> Nueva factura
            </Boton>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <ReceiptText size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Facturado este mes</p>
            <p className="text-base font-semibold text-tinta">{formatoDinero(facturadoMes)}</p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Printer size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Emitidas por cobrar</p>
            <p className="text-base font-semibold text-tinta">{formatoDinero(porCobrarFacturas)}</p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <Check size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">ITBIS este mes</p>
            <p className="text-base font-semibold text-tinta">{formatoDinero(itbisMes)}</p>
          </div>
        </Tarjeta>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por cliente o NCF…"
            className="pl-9"
          />
        </div>
        <Selector
          value={filtroEstado}
          onChange={(evento) => setFiltroEstado(evento.target.value)}
          className="sm:w-44"
        >
          <option value="todas">Todos los estados</option>
          <option value="borrador">Borradores</option>
          <option value="emitida">Emitidas</option>
          <option value="pagada">Pagadas</option>
          <option value="anulada">Anuladas</option>
        </Selector>
      </div>

      <Tarjeta>
        {error && <ErrorTabla mensaje={error} />}
        {cargando && !error && <FilasCargando />}
        {!cargando && !error && filtradas.length === 0 && (
          facturas.length === 0 ? (
            <Vacio
              icono={<ReceiptText size={22} />}
              titulo="Todavía no hay facturas"
              texto="Crea la primera con «Nueva factura»: agrega el NCF/e-NCF, las líneas y el ITBIS se calcula solo."
            />
          ) : (
            <Vacio icono={<Search size={22} />} titulo="Sin resultados" texto="Prueba otra búsqueda o quita el filtro." />
          )
        )}
        {!cargando && !error && filtradas.length > 0 && (
          <ul className="divide-y divide-borde-suave">
            {filtradas.map((factura) => (
              <li key={factura.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <ReceiptText size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-tinta">{factura.cliente_nombre}</p>
                  <p className="truncate text-xs text-tinta-suave">
                    {[
                      factura.numero ?? 'Sin NCF',
                      `${factura.tipo} · ${etiquetaTipoFactura[factura.tipo] ?? ''}`,
                      formatoFecha(factura.fecha),
                      `${(factura.factura_items ?? []).length} línea${(factura.factura_items ?? []).length === 1 ? '' : 's'}`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <span
                  className={cx(
                    'shrink-0 text-sm font-semibold tabular-nums',
                    factura.estado === 'anulada' ? 'text-tinta-tenue line-through' : 'text-tinta',
                  )}
                >
                  {formatoDinero(factura.total)}
                </span>
                <div className="hidden shrink-0 sm:block">
                  <Insignia color={colorEstadoFactura[factura.estado] ?? 'slate'}>
                    {etiquetaEstadoFactura[factura.estado] ?? factura.estado}
                  </Insignia>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <BotonIcono etiqueta="Ver / Imprimir" onClick={() => setViendo(factura)}>
                    <Eye size={15} />
                  </BotonIcono>
                  {factura.estado === 'emitida' && (
                    <>
                      <BotonIcono
                        etiqueta="Marcar como pagada"
                        onClick={() => setPorPagar(factura)}
                        className="hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Check size={15} />
                      </BotonIcono>
                      <BotonIcono
                        etiqueta="Anular"
                        onClick={() => setPorAnular(factura)}
                        className="hover:bg-red-50 hover:text-red-700"
                      >
                        <X size={15} />
                      </BotonIcono>
                    </>
                  )}
                  {factura.estado === 'borrador' && (
                    <>
                      <BotonIcono etiqueta="Editar" onClick={() => abrirEdicion(factura)}>
                        <Pencil size={15} />
                      </BotonIcono>
                      <BotonIcono
                        etiqueta="Eliminar"
                        onClick={() => setPorEliminar(factura)}
                        className="hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={15} />
                      </BotonIcono>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? 'Editar borrador' : 'Nueva factura'}
        onCerrar={() => setModalAbierto(false)}
        ancho="sm:max-w-2xl"
      >
        <form onSubmit={enviar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Cliente *">
              <Selector
                required
                value={formulario.cliente_id}
                onChange={(evento) => setFormulario({ ...formulario, cliente_id: evento.target.value })}
              >
                <option value="">Elige un cliente…</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                    {cliente.empresa ? ` — ${cliente.empresa}` : ''}
                  </option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="Tipo de comprobante">
              <Selector
                value={formulario.tipo}
                onChange={(evento) => setFormulario({ ...formulario, tipo: evento.target.value })}
              >
                {TIPOS_FACTURA.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo} · {etiquetaTipoFactura[tipo]}
                  </option>
                ))}
              </Selector>
            </Campo>
            <Campo etiqueta="NCF / e-NCF">
              <Entrada
                value={formulario.numero}
                onChange={(evento) => setFormulario({ ...formulario, numero: evento.target.value })}
                placeholder="B0200000001 o E320000000001"
              />
            </Campo>
            <Campo etiqueta="Fecha">
              <Entrada
                type="date"
                value={formulario.fecha}
                onChange={(evento) => setFormulario({ ...formulario, fecha: evento.target.value })}
              />
            </Campo>
          </div>

          <p className="text-xs text-tinta-tenue">
            NCF: B + 10 dígitos · e-CF: E + 12 dígitos. El envío a DGII se conecta cuando esté listo el
            certificado; aquí el comprobante se registra e imprime.
          </p>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-tinta-suave">Líneas de la factura</span>
              <button
                type="button"
                onClick={agregarLinea}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50"
              >
                <Plus size={13} /> Agregar línea
              </button>
            </div>
            <div className="space-y-2">
              {formulario.lineas.map((linea, indice) => (
                <div key={indice} className="flex flex-wrap items-center gap-2">
                  <Entrada
                    value={linea.descripcion}
                    onChange={(evento) => actualizarLinea(indice, 'descripcion', evento.target.value)}
                    placeholder="Descripción del servicio"
                    className="min-w-40 flex-1"
                  />
                  <Entrada
                    type="number"
                    min="0"
                    step="0.01"
                    value={linea.cantidad}
                    onChange={(evento) => actualizarLinea(indice, 'cantidad', evento.target.value)}
                    title="Cantidad"
                    className="w-20"
                  />
                  <Entrada
                    type="number"
                    min="0"
                    step="0.01"
                    value={linea.precio}
                    onChange={(evento) => actualizarLinea(indice, 'precio', evento.target.value)}
                    placeholder="Precio RD$"
                    className="w-32"
                  />
                  <span className="w-24 shrink-0 text-right text-sm text-tinta-suave tabular-nums">
                    {formatoDinero(importeLinea(linea))}
                  </span>
                  <BotonIcono
                    etiqueta="Quitar línea"
                    onClick={() => quitarLinea(indice)}
                    disabled={formulario.lineas.length === 1}
                    className="hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 size={15} />
                  </BotonIcono>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-tinta">
            <input
              type="checkbox"
              checked={formulario.aplica_itbis}
              onChange={(evento) => setFormulario({ ...formulario, aplica_itbis: evento.target.checked })}
              className="h-4 w-4 rounded accent-blue-500"
            />
            Aplica ITBIS (18%)
          </label>

          <div className="rounded-lg bg-superficie-2 p-3 text-sm">
            <div className="flex justify-between text-tinta-suave">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatoDinero(subtotalForm)}</span>
            </div>
            <div className="flex justify-between text-tinta-suave">
              <span>ITBIS</span>
              <span className="tabular-nums">{formatoDinero(itbisForm)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-borde pt-1 font-semibold text-tinta">
              <span>Total</span>
              <span className="tabular-nums">{formatoDinero(totalForm)}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Estado">
              <Selector
                value={formulario.estado}
                onChange={(evento) => setFormulario({ ...formulario, estado: evento.target.value })}
              >
                <option value="borrador">Borrador (sin emitir)</option>
                <option value="emitida">Emitida</option>
              </Selector>
            </Campo>
          </div>
          <Campo etiqueta="Notas">
            <AreaTexto
              value={formulario.notas}
              onChange={(evento) => setFormulario({ ...formulario, notas: evento.target.value })}
              placeholder="Condiciones, forma de pago, etc. (opcional)"
            />
          </Campo>

          <div className="flex justify-end gap-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando
                ? 'Guardando…'
                : editandoId
                  ? 'Guardar cambios'
                  : formulario.estado === 'borrador'
                    ? 'Guardar borrador'
                    : 'Emitir factura'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Confirmar
        abierto={porPagar !== null}
        titulo="Marcar como pagada"
        textoBoton="Marcar pagada"
        onCancelar={() => setPorPagar(null)}
        onConfirmar={() => {
          if (porPagar) void marcarPagada(porPagar)
          setPorPagar(null)
        }}
        mensaje={
          porPagar ? (
            <>
              Se registrará un pago de <strong className="text-tinta">{formatoDinero(porPagar.total)}</strong> en el
              módulo Pagos y la factura{' '}
              <strong className="text-tinta">{porPagar.numero ?? 'sin NCF'}</strong> quedará pagada.
            </>
          ) : null
        }
      />

      <Confirmar
        abierto={porAnular !== null}
        titulo="Anular factura"
        textoBoton="Anular"
        onCancelar={() => setPorAnular(null)}
        onConfirmar={() => {
          if (porAnular) void anular(porAnular)
          setPorAnular(null)
        }}
        mensaje={
          porAnular ? (
            <>
              La factura <strong className="text-tinta">{porAnular.numero ?? 'sin NCF'}</strong> quedará anulada y no
              contará en los reportes. Esta acción no se puede deshacer.
            </>
          ) : null
        }
      />

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar borrador"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          if (porEliminar) void eliminar(porEliminar)
          setPorEliminar(null)
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar el borrador de{' '}
              <strong className="text-tinta">{porEliminar.cliente_nombre}</strong>? Esta acción no se puede deshacer.
            </>
          ) : null
        }
      />
    </section>
  )
}
