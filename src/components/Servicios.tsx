import { Briefcase, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import {
  ESTADOS_SERVICIO,
  TIPOS_SERVICIO,
  colorEstadoServicio,
  etiquetaEstadoServicio,
  etiquetaTipoServicio,
} from '../lib/etiquetas'
import { formatoDinero, formatoFecha } from '../lib/formato'
import { useListaClientes, useTabla } from '../lib/useTabla'
import type { Servicio } from '../types/servicio'
import {
  AreaTexto,
  Boton,
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

interface FormularioServicio {
  cliente_id: string
  titulo: string
  tipo: string
  estado: string
  monto: string
  fecha_inicio: string
  fecha_fin: string
  notas: string
}

const FORMULARIO_VACIO: FormularioServicio = {
  cliente_id: '',
  titulo: '',
  tipo: 'consultoria',
  estado: 'pendiente',
  monto: '',
  fecha_inicio: '',
  fecha_fin: '',
  notas: '',
}

export function Servicios() {
  const { filas: servicios, cargando, error, guardar, eliminar } = useTabla<Servicio>(
    'servicios',
    '*, clientes(nombre)',
  )
  const clientes = useListaClientes()
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<FormularioServicio>(FORMULARIO_VACIO)
  const [porEliminar, setPorEliminar] = useState<Servicio | null>(null)
  const [guardando, setGuardando] = useState(false)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return servicios.filter((servicio) => {
      const coincideEstado = filtroEstado === 'todos' || servicio.estado === filtroEstado
      const coincideTexto =
        !texto ||
        servicio.titulo.toLowerCase().includes(texto) ||
        (servicio.clientes?.nombre ?? '').toLowerCase().includes(texto)
      return coincideEstado && coincideTexto
    })
  }, [servicios, busqueda, filtroEstado])

  function abrirNuevo() {
    setEditandoId(null)
    setFormulario(FORMULARIO_VACIO)
    setModalAbierto(true)
  }

  function abrirEdicion(servicio: Servicio) {
    setEditandoId(servicio.id)
    setFormulario({
      cliente_id: servicio.cliente_id,
      titulo: servicio.titulo,
      tipo: servicio.tipo,
      estado: servicio.estado,
      monto: servicio.monto == null ? '' : String(servicio.monto),
      fecha_inicio: servicio.fecha_inicio ?? '',
      fecha_fin: servicio.fecha_fin ?? '',
      notas: servicio.notas ?? '',
    })
    setModalAbierto(true)
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando || !formulario.titulo.trim() || !formulario.cliente_id) return
    setGuardando(true)
    const guardado = await guardar(
      {
        cliente_id: formulario.cliente_id,
        titulo: formulario.titulo.trim(),
        tipo: formulario.tipo,
        estado: formulario.estado,
        monto: formulario.monto === '' ? null : Number(formulario.monto),
        fecha_inicio: formulario.fecha_inicio || null,
        fecha_fin: formulario.fecha_fin || null,
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
        titulo="Servicios"
        descripcion={`${servicios.length} registrado${servicios.length === 1 ? '' : 's'}`}
        acciones={
          <Boton onClick={abrirNuevo}>
            <Plus size={16} /> Nuevo servicio
          </Boton>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por título o cliente…"
            className="pl-9"
          />
        </div>
        <Selector value={filtroEstado} onChange={(evento) => setFiltroEstado(evento.target.value)} className="sm:w-44">
          <option value="todos">Todos los estados</option>
          {ESTADOS_SERVICIO.map((estado) => (
            <option key={estado} value={estado}>
              {etiquetaEstadoServicio[estado]}
            </option>
          ))}
        </Selector>
      </div>

      <Tarjeta>
        {error && <ErrorTabla mensaje={error} />}
        {cargando && !error && <FilasCargando />}
        {!cargando && !error && filtrados.length === 0 && (
          servicios.length === 0 ? (
            <Vacio
              icono={<Briefcase size={22} />}
              titulo="Todavía no hay servicios"
              texto="Registra el primero con el botón «Nuevo servicio»."
            />
          ) : (
            <Vacio icono={<Search size={22} />} titulo="Sin resultados" texto="Prueba otra búsqueda o quita el filtro." />
          )
        )}
        {!cargando && !error && filtrados.length > 0 && (
          <ul className="divide-y divide-borde-suave">
            {filtrados.map((servicio) => (
              <li key={servicio.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-400/10 text-sky-300">
                  <Briefcase size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-tinta">{servicio.titulo}</p>
                  <p className="truncate text-xs text-tinta-suave">
                    {[servicio.clientes?.nombre ?? 'Cliente', etiquetaTipoServicio[servicio.tipo] ?? servicio.tipo].join(
                      ' · ',
                    )}
                  </p>
                </div>
                <span className="hidden shrink-0 text-xs text-tinta-tenue lg:block">
                  {servicio.fecha_inicio ? formatoFecha(servicio.fecha_inicio) : ''}
                </span>
                <span className="hidden shrink-0 text-sm font-medium text-tinta md:block">
                  {formatoDinero(servicio.monto)}
                </span>
                <div className="hidden shrink-0 sm:block">
                  <Insignia color={colorEstadoServicio[servicio.estado] ?? 'slate'}>
                    {etiquetaEstadoServicio[servicio.estado] ?? servicio.estado}
                  </Insignia>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => abrirEdicion(servicio)}
                    title="Editar"
                    className="rounded-lg p-2 text-tinta-tenue transition-colors hover:bg-superficie-2 hover:text-tinta-suave"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPorEliminar(servicio)}
                    title="Eliminar"
                    className="rounded-lg p-2 text-tinta-tenue transition-colors hover:bg-red-400/10 hover:text-red-300"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? 'Editar servicio' : 'Nuevo servicio'}
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
            <p className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-300 sm:col-span-2">
              Todavía no hay clientes. Crea uno primero en la sección «Clientes».
            </p>
          )}
          <Campo etiqueta="Título *" className="sm:col-span-2">
            <Entrada
              required
              value={formulario.titulo}
              onChange={(evento) => setFormulario({ ...formulario, titulo: evento.target.value })}
              placeholder="Ej. Auditoría fiscal 2026"
            />
          </Campo>
          <Campo etiqueta="Tipo">
            <Selector value={formulario.tipo} onChange={(evento) => setFormulario({ ...formulario, tipo: evento.target.value })}>
              {TIPOS_SERVICIO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {etiquetaTipoServicio[tipo]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Estado">
            <Selector
              value={formulario.estado}
              onChange={(evento) => setFormulario({ ...formulario, estado: evento.target.value })}
            >
              {ESTADOS_SERVICIO.map((estado) => (
                <option key={estado} value={estado}>
                  {etiquetaEstadoServicio[estado]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Monto (RD$)">
            <Entrada
              type="number"
              min="0"
              step="0.01"
              value={formulario.monto}
              onChange={(evento) => setFormulario({ ...formulario, monto: evento.target.value })}
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
            <Campo etiqueta="Fin">
              <Entrada
                type="date"
                value={formulario.fecha_fin}
                onChange={(evento) => setFormulario({ ...formulario, fecha_fin: evento.target.value })}
              />
            </Campo>
          </div>
          <Campo etiqueta="Notas" className="sm:col-span-2">
            <AreaTexto
              value={formulario.notas}
              onChange={(evento) => setFormulario({ ...formulario, notas: evento.target.value })}
              placeholder="Alcance, entregables, detalles…"
            />
          </Campo>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Crear servicio'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar servicio"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          if (porEliminar) void eliminar(porEliminar.id)
          setPorEliminar(null)
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar <strong className="text-tinta">{porEliminar.titulo}</strong>? Esta acción no
              se puede deshacer.
            </>
          ) : null
        }
      />
    </section>
  )
}
