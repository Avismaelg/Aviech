import { AlertTriangle, Banknote, Check, Clock, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import {
  ESTADOS_PAGO,
  METODOS_PAGO,
  colorEstadoPago,
  etiquetaEstadoPago,
  etiquetaMetodoPago,
} from '../lib/etiquetas'
import { diasDeAtraso, formatoDinero, formatoFecha, hoyISO, mesActualISO } from '../lib/formato'
import { useListaClientes, useTabla } from '../lib/useTabla'
import type { Pago } from '../types/pago'
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

interface FormularioPago {
  cliente_id: string
  concepto: string
  monto: string
  fecha: string
  estado: string
  metodo: string
  notas: string
}

const FORMULARIO_VACIO: FormularioPago = {
  cliente_id: '',
  concepto: '',
  monto: '',
  fecha: hoyISO(),
  estado: 'pendiente',
  metodo: '',
  notas: '',
}

export function Pagos() {
  const { filas: pagos, cargando, error, guardar, eliminar } = useTabla<Pago>('pagos', '*, clientes(nombre)', 'fecha')
  const clientes = useListaClientes()
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<FormularioPago>(FORMULARIO_VACIO)
  const [porEliminar, setPorEliminar] = useState<Pago | null>(null)
  const [guardando, setGuardando] = useState(false)

  const mesActual = mesActualISO()
  const cobradoMes = pagos
    .filter((pago) => pago.estado === 'pagado' && (pago.fecha ?? '').slice(0, 7) === mesActual)
    .reduce((total, pago) => total + Number(pago.monto), 0)
  const pendientesPago = pagos.filter((pago) => pago.estado === 'pendiente')
  const porCobrar = pendientesPago.reduce((total, pago) => total + Number(pago.monto), 0)
  const vencidos = pendientesPago.filter((pago) => diasDeAtraso(pago.fecha) > 0)
  const porCobrarVencido = vencidos.reduce((total, pago) => total + Number(pago.monto), 0)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return pagos.filter((pago) => {
      const coincideEstado = filtroEstado === 'todos' || pago.estado === filtroEstado
      const coincideTexto =
        !texto ||
        pago.concepto.toLowerCase().includes(texto) ||
        (pago.clientes?.nombre ?? '').toLowerCase().includes(texto)
      return coincideEstado && coincideTexto
    })
  }, [pagos, busqueda, filtroEstado])

  function abrirNuevo() {
    setEditandoId(null)
    setFormulario(FORMULARIO_VACIO)
    setModalAbierto(true)
  }

  function abrirEdicion(pago: Pago) {
    setEditandoId(pago.id)
    setFormulario({
      cliente_id: pago.cliente_id,
      concepto: pago.concepto,
      monto: String(pago.monto),
      fecha: pago.fecha,
      estado: pago.estado,
      metodo: pago.metodo ?? '',
      notas: '',
    })
    setModalAbierto(true)
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando || !formulario.concepto.trim() || !formulario.cliente_id || formulario.monto === '') return
    setGuardando(true)
    const guardado = await guardar(
      {
        cliente_id: formulario.cliente_id,
        concepto: formulario.concepto.trim(),
        monto: Number(formulario.monto),
        fecha: formulario.fecha || hoyISO(),
        estado: formulario.estado,
        metodo: formulario.metodo || null,
      },
      editandoId ?? undefined,
    )
    setGuardando(false)
    if (guardado) setModalAbierto(false)
  }

  return (
    <section>
      <CabeceraSeccion
        titulo="Pagos"
        descripcion={`${pagos.length} registrado${pagos.length === 1 ? '' : 's'}`}
        acciones={
          <Boton onClick={abrirNuevo}>
            <Plus size={16} /> Nuevo pago
          </Boton>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <Banknote size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Cobrado este mes</p>
            <p className="text-base font-semibold text-tinta">{formatoDinero(cobradoMes)}</p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
            <Clock size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Por cobrar ({pendientesPago.length})</p>
            <p className="text-base font-semibold text-tinta">{formatoDinero(porCobrar)}</p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-300">
            <AlertTriangle size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Vencidos ({vencidos.length})</p>
            <p className="text-base font-semibold text-tinta">{formatoDinero(porCobrarVencido)}</p>
          </div>
        </Tarjeta>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por concepto o cliente…"
            className="pl-9"
          />
        </div>
        <Selector value={filtroEstado} onChange={(evento) => setFiltroEstado(evento.target.value)} className="sm:w-44">
          <option value="todos">Todos los estados</option>
          {ESTADOS_PAGO.map((estado) => (
            <option key={estado} value={estado}>
              {etiquetaEstadoPago[estado]}
            </option>
          ))}
        </Selector>
      </div>

      <Tarjeta>
        {error && <ErrorTabla mensaje={error} />}
        {cargando && !error && <FilasCargando />}
        {!cargando && !error && filtrados.length === 0 && (
          pagos.length === 0 ? (
            <Vacio
              icono={<Banknote size={22} />}
              titulo="Todavía no hay pagos"
              texto="Registra el primero con el botón «Nuevo pago»."
            />
          ) : (
            <Vacio icono={<Search size={22} />} titulo="Sin resultados" texto="Prueba otra búsqueda o quita el filtro." />
          )
        )}
        {!cargando && !error && filtrados.length > 0 && (
          <ul className="divide-y divide-borde-suave">
            {filtrados.map((pago) => (
              <li key={pago.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-superficie-2 text-tinta-suave">
                  <Banknote size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-tinta">{pago.concepto}</p>
                  <p className="truncate text-xs text-tinta-suave">
                    {[pago.clientes?.nombre ?? 'Cliente', formatoFecha(pago.fecha), etiquetaMetodoPago[pago.metodo ?? '']]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    pago.estado === 'pagado'
                      ? 'text-emerald-300'
                      : diasDeAtraso(pago.fecha) > 0
                        ? 'text-red-300'
                        : 'text-tinta'
                  }`}
                >
                  {formatoDinero(pago.monto)}
                </span>
                <div className="hidden shrink-0 sm:block">
                  {pago.estado === 'pendiente' && diasDeAtraso(pago.fecha) > 0 ? (
                    <Insignia color="red">Vencido</Insignia>
                  ) : (
                    <Insignia color={colorEstadoPago[pago.estado] ?? 'slate'}>
                      {etiquetaEstadoPago[pago.estado] ?? pago.estado}
                    </Insignia>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {pago.estado === 'pendiente' && (
                    <BotonIcono
                      etiqueta="Marcar como pagado"
                      onClick={() => void guardar({ estado: 'pagado' }, pago.id)}
                      className="hover:bg-emerald-400/10 hover:text-emerald-300"
                    >
                      <Check size={15} />
                    </BotonIcono>
                  )}
                  <BotonIcono etiqueta="Editar" onClick={() => abrirEdicion(pago)}>
                    <Pencil size={15} />
                  </BotonIcono>
                  <BotonIcono
                    etiqueta="Eliminar"
                    onClick={() => setPorEliminar(pago)}
                    className="hover:bg-red-400/10 hover:text-red-300"
                  >
                    <Trash2 size={15} />
                  </BotonIcono>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Modal abierto={modalAbierto} titulo={editandoId ? 'Editar pago' : 'Nuevo pago'} onCerrar={() => setModalAbierto(false)}>
        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Cliente *" className="sm:col-span-2">
            <Selector
              required
              value={formulario.cliente_id}
              onChange={(evento) => setFormulario({ ...formulario, cliente_id: evento.target.value })}
            >
              <option value="">Selecciona un cliente…</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                  {cliente.empresa ? ` — ${cliente.empresa}` : ''}
                </option>
              ))}
            </Selector>
          </Campo>
          {clientes.length === 0 && (
            <p className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-300 sm:col-span-2">
              Todavía no hay clientes. Crea uno primero en la sección «Clientes».
            </p>
          )}
          <Campo etiqueta="Concepto *" className="sm:col-span-2">
            <Entrada
              required
              value={formulario.concepto}
              onChange={(evento) => setFormulario({ ...formulario, concepto: evento.target.value })}
              placeholder="Ej. Anticipo auditoría"
            />
          </Campo>
          <Campo etiqueta="Monto (RD$) *">
            <Entrada
              required
              type="number"
              min="0"
              step="0.01"
              value={formulario.monto}
              onChange={(evento) => setFormulario({ ...formulario, monto: evento.target.value })}
              placeholder="0.00"
            />
          </Campo>
          <Campo etiqueta="Fecha">
            <Entrada
              type="date"
              value={formulario.fecha}
              onChange={(evento) => setFormulario({ ...formulario, fecha: evento.target.value })}
            />
          </Campo>
          <Campo etiqueta="Estado">
            <Selector
              value={formulario.estado}
              onChange={(evento) => setFormulario({ ...formulario, estado: evento.target.value })}
            >
              {ESTADOS_PAGO.map((estado) => (
                <option key={estado} value={estado}>
                  {etiquetaEstadoPago[estado]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Método">
            <Selector
              value={formulario.metodo}
              onChange={(evento) => setFormulario({ ...formulario, metodo: evento.target.value })}
            >
              <option value="">Sin especificar</option>
              {METODOS_PAGO.map((metodo) => (
                <option key={metodo} value={metodo}>
                  {etiquetaMetodoPago[metodo]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Notas" className="sm:col-span-2">
            <AreaTexto
              value={formulario.notas}
              onChange={(evento) => setFormulario({ ...formulario, notas: evento.target.value })}
              placeholder="Referencia, condiciones, etc. (opcional)"
            />
          </Campo>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Registrar pago'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar pago"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          if (porEliminar) void eliminar(porEliminar.id)
          setPorEliminar(null)
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar el pago <strong className="text-tinta">{porEliminar.concepto}</strong>? Esta
              acción no se puede deshacer.
            </>
          ) : null
        }
      />
    </section>
  )
}
