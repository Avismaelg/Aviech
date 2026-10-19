import { Pencil, Plus, Search, Trash2, UserRound } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { ESTADOS_CLIENTE, colorEstadoCliente, etiquetaEstadoCliente } from '../lib/etiquetas'
import { formatoFecha, iniciales } from '../lib/formato'
import { useTabla } from '../lib/useTabla'
import type { Cliente } from '../types/cliente'
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

interface FormularioCliente {
  nombre: string
  empresa: string
  email: string
  telefono: string
  estado: string
  notas: string
}

const FORMULARIO_VACIO: FormularioCliente = {
  nombre: '',
  empresa: '',
  email: '',
  telefono: '',
  estado: 'activo',
  notas: '',
}

export function Clientes() {
  const { filas: clientes, cargando, error, guardar, eliminar } = useTabla<Cliente>('clientes')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<FormularioCliente>(FORMULARIO_VACIO)
  const [porEliminar, setPorEliminar] = useState<Cliente | null>(null)
  const [guardando, setGuardando] = useState(false)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return clientes.filter((cliente) => {
      const coincideEstado = filtroEstado === 'todos' || cliente.estado === filtroEstado
      const coincideTexto =
        !texto ||
        [cliente.nombre, cliente.empresa, cliente.email, cliente.telefono].some((valor) =>
          valor?.toLowerCase().includes(texto),
        )
      return coincideEstado && coincideTexto
    })
  }, [clientes, busqueda, filtroEstado])

  function abrirNuevo() {
    setEditandoId(null)
    setFormulario(FORMULARIO_VACIO)
    setModalAbierto(true)
  }

  function abrirEdicion(cliente: Cliente) {
    setEditandoId(cliente.id)
    setFormulario({
      nombre: cliente.nombre,
      empresa: cliente.empresa ?? '',
      email: cliente.email ?? '',
      telefono: cliente.telefono ?? '',
      estado: cliente.estado,
      notas: cliente.notas ?? '',
    })
    setModalAbierto(true)
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando || !formulario.nombre.trim()) return
    setGuardando(true)
    const guardado = await guardar(
      {
        nombre: formulario.nombre.trim(),
        empresa: formulario.empresa.trim() || null,
        email: formulario.email.trim() || null,
        telefono: formulario.telefono.trim() || null,
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
        titulo="Clientes"
        descripcion={`${clientes.length} registrado${clientes.length === 1 ? '' : 's'}`}
        acciones={
          <Boton onClick={abrirNuevo}>
            <Plus size={16} /> Nuevo cliente
          </Boton>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por nombre, empresa, correo…"
            className="pl-9"
          />
        </div>
        <Selector value={filtroEstado} onChange={(evento) => setFiltroEstado(evento.target.value)} className="sm:w-44">
          <option value="todos">Todos los estados</option>
          {ESTADOS_CLIENTE.map((estado) => (
            <option key={estado} value={estado}>
              {etiquetaEstadoCliente[estado]}
            </option>
          ))}
        </Selector>
      </div>

      <Tarjeta>
        {error && <ErrorTabla mensaje={error} />}
        {cargando && !error && <FilasCargando />}
        {!cargando && !error && filtrados.length === 0 && (
          clientes.length === 0 ? (
            <Vacio
              icono={<UserRound size={22} />}
              titulo="Todavía no hay clientes"
              texto="Agrega tu primer cliente con el botón «Nuevo cliente»."
            />
          ) : (
            <Vacio icono={<Search size={22} />} titulo="Sin resultados" texto="Prueba otra búsqueda o quita el filtro." />
          )
        )}
        {!cargando && !error && filtrados.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {filtrados.map((cliente) => (
              <li key={cliente.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
                  {iniciales(cliente.nombre)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{cliente.nombre}</p>
                  <p className="truncate text-xs text-slate-500">
                    {[cliente.empresa, cliente.email, cliente.telefono].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
                  </p>
                </div>
                <div className="hidden shrink-0 sm:block">
                  <Insignia color={colorEstadoCliente[cliente.estado] ?? 'slate'}>
                    {etiquetaEstadoCliente[cliente.estado] ?? cliente.estado}
                  </Insignia>
                </div>
                <time className="hidden shrink-0 text-xs text-slate-400 lg:block">{formatoFecha(cliente.created_at)}</time>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => abrirEdicion(cliente)}
                    title="Editar"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPorEliminar(cliente)}
                    title="Eliminar"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
        titulo={editandoId ? 'Editar cliente' : 'Nuevo cliente'}
        onCerrar={() => setModalAbierto(false)}
      >
        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre *" className="sm:col-span-2">
            <Entrada
              required
              value={formulario.nombre}
              onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
              placeholder="Nombre y apellidos"
            />
          </Campo>
          <Campo etiqueta="Empresa">
            <Entrada
              value={formulario.empresa}
              onChange={(evento) => setFormulario({ ...formulario, empresa: evento.target.value })}
              placeholder="Nombre de la empresa"
            />
          </Campo>
          <Campo etiqueta="Estado">
            <Selector
              value={formulario.estado}
              onChange={(evento) => setFormulario({ ...formulario, estado: evento.target.value })}
            >
              {ESTADOS_CLIENTE.map((estado) => (
                <option key={estado} value={estado}>
                  {etiquetaEstadoCliente[estado]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Correo">
            <Entrada
              type="email"
              value={formulario.email}
              onChange={(evento) => setFormulario({ ...formulario, email: evento.target.value })}
              placeholder="nombre@correo.com"
            />
          </Campo>
          <Campo etiqueta="Teléfono">
            <Entrada
              value={formulario.telefono}
              onChange={(evento) => setFormulario({ ...formulario, telefono: evento.target.value })}
              placeholder="55 1234 5678"
            />
          </Campo>
          <Campo etiqueta="Notas" className="sm:col-span-2">
            <AreaTexto
              value={formulario.notas}
              onChange={(evento) => setFormulario({ ...formulario, notas: evento.target.value })}
              placeholder="Detalles importantes del cliente…"
            />
          </Campo>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Crear cliente'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar cliente"
        textoBoton="Eliminar"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          if (porEliminar) void eliminar(porEliminar.id)
          setPorEliminar(null)
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar a <strong className="text-slate-900">{porEliminar.nombre}</strong>? También se
              eliminarán sus servicios y pagos registrados. Esta acción no se puede deshacer.
            </>
          ) : null
        }
      />
    </section>
  )
}
