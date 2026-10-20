import { CalendarClock, Handshake, Pencil, Plus, Repeat, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import {
  CATEGORIAS_IGUALA,
  ESTADOS_IGUALA,
  colorEstadoIguala,
  etiquetaCategoriaIguala,
  etiquetaEstadoIguala,
} from '../lib/etiquetas'
import { formatoDinero, formatoFecha, hoyISO } from '../lib/formato'
import { useListaClientes, useTabla } from '../lib/useTabla'
import type { Iguala } from '../types/iguala'
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

interface FormularioIguala {
  cliente_id: string
  categoria: string
  descripcion: string
  monto_mensual: string
  dia_cobro: string
  fecha_inicio: string
  estado: string
  notas: string
}

const FORMULARIO_VACIO: FormularioIguala = {
  cliente_id: '',
  categoria: 'contabilidad',
  descripcion: '',
  monto_mensual: '',
  dia_cobro: '1',
  fecha_inicio: hoyISO(),
  estado: 'activa',
  notas: '',
}

export function Igualas() {
  const { filas: igualas, cargando, error, guardar, eliminar } = useTabla<Iguala>('igualas', '*, clientes(nombre)')
  const clientes = useListaClientes()
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<FormularioIguala>(FORMULARIO_VACIO)
  const [porEliminar, setPorEliminar] = useState<Iguala | null>(null)
  const [guardando, setGuardando] = useState(false)

  const activas = igualas.filter((iguala) => iguala.estado === 'activa')
  const pausadas = igualas.filter((iguala) => iguala.estado === 'pausada').length
  const mrr = activas.reduce((total, iguala) => total + Number(iguala.monto_mensual), 0)
  const clientesActivos = new Set(activas.map((iguala) => iguala.cliente_id)).size

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return igualas.filter((iguala) => {
      const coincideEstado = filtroEstado === 'todos' || iguala.estado === filtroEstado
      const coincideCategoria = filtroCategoria === 'todas' || iguala.categoria === filtroCategoria
      const coincideTexto =
        !texto ||
        iguala.descripcion.toLowerCase().includes(texto) ||
        (etiquetaCategoriaIguala[iguala.categoria] ?? iguala.categoria).toLowerCase().includes(texto) ||
        (iguala.clientes?.nombre ?? '').toLowerCase().includes(texto)
      return coincideEstado && coincideCategoria && coincideTexto
    })
  }, [igualas, busqueda, filtroEstado, filtroCategoria])

  function abrirNuevo() {
    setEditandoId(null)
    setFormulario(FORMULARIO_VACIO)
    setModalAbierto(true)
  }

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroEstado('todos')
    setFiltroCategoria('todas')
  }

  function abrirEdicion(iguala: Iguala) {
    setEditandoId(iguala.id)
    setFormulario({
      cliente_id: iguala.cliente_id,
      categoria: iguala.categoria,
      descripcion: iguala.descripcion,
      monto_mensual: String(iguala.monto_mensual),
      dia_cobro: String(iguala.dia_cobro),
      fecha_inicio: iguala.fecha_inicio,
      estado: iguala.estado,
      notas: iguala.notas ?? '',
    })
    setModalAbierto(true)
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando || !formulario.descripcion.trim() || !formulario.cliente_id || formulario.monto_mensual === '') return
    setGuardando(true)
    const dia = Math.min(28, Math.max(1, Number(formulario.dia_cobro) || 1))
    const guardado = await guardar(
      {
        cliente_id: formulario.cliente_id,
        categoria: formulario.categoria,
        descripcion: formulario.descripcion.trim(),
        monto_mensual: Number(formulario.monto_mensual),
        dia_cobro: dia,
        fecha_inicio: formulario.fecha_inicio || hoyISO(),
        estado: formulario.estado,
        notas: formulario.notas.trim() || null,
      },
      editandoId ?? undefined,
    )
    setGuardando(false)
    if (guardado) setModalAbierto(false)
  }

  return (
    <section>
      <CabeceraSeccion
        titulo="Igualas"
        descripcion={`${igualas.length} registrada${igualas.length === 1 ? '' : 's'} · ingreso mensual recurrente ${formatoDinero(mrr)}`}
        acciones={
          <Boton onClick={abrirNuevo}>
            <Plus size={16} /> Nueva iguala
          </Boton>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Repeat size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Ingreso mensual recurrente</p>
            <p className="text-base font-semibold text-tinta">{formatoDinero(mrr)}</p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <Handshake size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Igualas activas</p>
            <p className="text-base font-semibold text-tinta">{activas.length}</p>
            <p className="text-xs text-tinta-tenue">
              {clientesActivos === 1 ? 'en 1 cliente' : `en ${clientesActivos} clientes`}
            </p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <CalendarClock size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Pausadas</p>
            <p className="text-base font-semibold text-tinta">{pausadas}</p>
          </div>
        </Tarjeta>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por descripción o cliente…"
            className="pl-9"
          />
        </div>
        <Selector
          value={filtroCategoria}
          onChange={(evento) => setFiltroCategoria(evento.target.value)}
          className="sm:w-44"
        >
          <option value="todas">Todos los servicios</option>
          {CATEGORIAS_IGUALA.map((categoria) => (
            <option key={categoria} value={categoria}>
              {etiquetaCategoriaIguala[categoria]}
            </option>
          ))}
        </Selector>
        <Selector value={filtroEstado} onChange={(evento) => setFiltroEstado(evento.target.value)} className="sm:w-44">
          <option value="todos">Todos los estados</option>
          {ESTADOS_IGUALA.map((estado) => (
            <option key={estado} value={estado}>
              {etiquetaEstadoIguala[estado]}
            </option>
          ))}
        </Selector>
      </div>

      <p aria-live="polite" className="sr-only">
        {filtradas.length} iguala{filtradas.length === 1 ? '' : 's'} en pantalla
      </p>

      <Tarjeta>
        {error && <ErrorTabla mensaje={error} />}
        {cargando && !error && <FilasCargando />}
        {!cargando && !error && filtradas.length === 0 && (
          igualas.length === 0 ? (
            <Vacio
              icono={<Handshake size={22} />}
              titulo="Todavía no hay igualas"
              texto="Crea la primera: cobro mensual de contabilidad, software o asesoría legal."
              accion={
                <Boton variante="secundario" onClick={abrirNuevo}>
                  <Plus size={16} /> Nueva iguala
                </Boton>
              }
            />
          ) : (
            <Vacio
              icono={<Search size={22} />}
              titulo="Sin resultados"
              texto="Prueba otra búsqueda o quita los filtros."
              accion={
                <Boton variante="secundario" onClick={limpiarFiltros}>
                  Limpiar filtros
                </Boton>
              }
            />
          )
        )}
        {!cargando && !error && filtradas.length > 0 && (
          <ul className="divide-y divide-borde-suave">
            {filtradas.map((iguala) => (
              <li key={iguala.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <Handshake size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-tinta">{iguala.descripcion}</p>
                  <p className="truncate text-xs text-tinta-suave">
                    {[
                      iguala.clientes?.nombre ?? 'Cliente',
                      etiquetaCategoriaIguala[iguala.categoria] ?? iguala.categoria,
                      `Cobro el día ${iguala.dia_cobro}`,
                    ].join(' · ')}
                  </p>
                </div>
                <span className="hidden shrink-0 text-xs text-tinta-tenue lg:block">{formatoFecha(iguala.fecha_inicio)}</span>
                <span className="shrink-0 text-sm font-semibold text-tinta tabular-nums">
                  {formatoDinero(iguala.monto_mensual)}
                  <span className="text-xs font-normal text-tinta-tenue"> /mes</span>
                </span>
                <div className="hidden shrink-0 sm:block">
                  <Insignia color={colorEstadoIguala[iguala.estado] ?? 'slate'}>
                    {etiquetaEstadoIguala[iguala.estado] ?? iguala.estado}
                  </Insignia>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <BotonIcono etiqueta="Editar" onClick={() => abrirEdicion(iguala)}>
                    <Pencil size={15} />
                  </BotonIcono>
                  <BotonIcono
                    etiqueta="Eliminar"
                    onClick={() => setPorEliminar(iguala)}
                    className="hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 size={15} />
                  </BotonIcono>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? 'Editar iguala' : 'Nueva iguala'}
        onCerrar={() => setModalAbierto(false)}
      >
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
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 sm:col-span-2">
              Todavía no hay clientes. Crea uno primero en la sección «Clientes».
            </p>
          )}
          <Campo etiqueta="Descripción *" className="sm:col-span-2">
            <Entrada
              required
              value={formulario.descripcion}
              onChange={(evento) => setFormulario({ ...formulario, descripcion: evento.target.value })}
              placeholder="Ej. Iguala contable: registros, impuestos y reportes"
            />
          </Campo>
          <Campo etiqueta="Servicio">
            <Selector
              value={formulario.categoria}
              onChange={(evento) => setFormulario({ ...formulario, categoria: evento.target.value })}
            >
              {CATEGORIAS_IGUALA.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {etiquetaCategoriaIguala[categoria]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Estado">
            <Selector
              value={formulario.estado}
              onChange={(evento) => setFormulario({ ...formulario, estado: evento.target.value })}
            >
              {ESTADOS_IGUALA.map((estado) => (
                <option key={estado} value={estado}>
                  {etiquetaEstadoIguala[estado]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Monto mensual (RD$) *">
            <Entrada
              required
              type="number"
              min="0"
              step="0.01"
              value={formulario.monto_mensual}
              onChange={(evento) => setFormulario({ ...formulario, monto_mensual: evento.target.value })}
              placeholder="0.00"
            />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo etiqueta="Inicio">
              <Entrada
                type="date"
                value={formulario.fecha_inicio}
                onChange={(evento) => setFormulario({ ...formulario, fecha_inicio: evento.target.value })}
              />
            </Campo>
            <Campo etiqueta="Día de cobro">
              <Entrada
                type="number"
                min="1"
                max="28"
                value={formulario.dia_cobro}
                onChange={(evento) => setFormulario({ ...formulario, dia_cobro: evento.target.value })}
              />
            </Campo>
          </div>
          <Campo etiqueta="Notas" className="sm:col-span-2">
            <AreaTexto
              value={formulario.notas}
              onChange={(evento) => setFormulario({ ...formulario, notas: evento.target.value })}
              placeholder="Alcance, entregables, condiciones…"
            />
          </Campo>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Crear iguala'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar iguala"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          if (porEliminar) void eliminar(porEliminar.id)
          setPorEliminar(null)
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar la iguala <strong className="text-tinta">{porEliminar.descripcion}</strong>{' '}
              de <strong className="text-tinta">{porEliminar.clientes?.nombre ?? 'este cliente'}</strong>? Esta acción no
              se puede deshacer.
            </>
          ) : null
        }
      />
    </section>
  )
}
