import { Bot, Briefcase, Download, FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { descargarTexto } from '../lib/descargas'
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
  const [detalle, setDetalle] = useState<Servicio | null>(null)
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
              <li key={servicio.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                  <Briefcase size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-tinta">{servicio.titulo}</p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-tinta-suave">
                    <span className="truncate">
                      {[servicio.clientes?.nombre ?? 'Cliente', etiquetaTipoServicio[servicio.tipo] ?? servicio.tipo].join(
                        ' · ',
                      )}
                    </span>
                    {servicio.ejecutado_por_ia && <Insignia color="blue">IA</Insignia>}
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
                  {(servicio.informe || servicio.plan_ia) && (
                    <BotonIcono etiqueta="Ver informe de la IA" onClick={() => setDetalle(servicio)}>
                      <FileText size={15} />
                    </BotonIcono>
                  )}
                  <BotonIcono etiqueta="Editar" onClick={() => abrirEdicion(servicio)}>
                    <Pencil size={15} />
                  </BotonIcono>
                  <BotonIcono
                    etiqueta="Eliminar"
                    onClick={() => setPorEliminar(servicio)}
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
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 sm:col-span-2">
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

      <Modal
        abierto={detalle !== null}
        titulo={detalle?.titulo ?? 'Detalle del servicio'}
        onCerrar={() => setDetalle(null)}
        ancho="sm:max-w-3xl"
      >
        {detalle && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Insignia color={colorEstadoServicio[detalle.estado] ?? 'slate'}>
                {etiquetaEstadoServicio[detalle.estado] ?? detalle.estado}
              </Insignia>
              <Insignia color="sky">{etiquetaTipoServicio[detalle.tipo] ?? detalle.tipo}</Insignia>
              {detalle.ejecutado_por_ia && <Insignia color="blue">Completado por IA</Insignia>}
              <Insignia color="slate">{formatoDinero(detalle.monto)}</Insignia>
            </div>

            <dl className="grid gap-3 rounded-xl border border-borde-suave p-4 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-semibold tracking-wide text-tinta-tenue uppercase">Cliente</dt>
                <dd className="mt-0.5 text-sm text-tinta">{detalle.clientes?.nombre ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold tracking-wide text-tinta-tenue uppercase">Fechas</dt>
                <dd className="mt-0.5 text-sm text-tinta">
                  {[formatoFecha(detalle.fecha_inicio), formatoFecha(detalle.fecha_fin)].join(' → ')}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold tracking-wide text-tinta-tenue uppercase">Progreso</dt>
                <dd className="mt-0.5 text-sm text-tinta">{detalle.progreso ?? 0}%</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold tracking-wide text-tinta-tenue uppercase">Origen</dt>
                <dd className="mt-0.5 text-sm text-tinta">{detalle.solicitud_id ? 'Solicitud automatizada' : 'Registro manual'}</dd>
              </div>
            </dl>

            {detalle.descripcion && (
              <section className="rounded-xl border border-borde-suave bg-superficie-2/40 p-3.5">
                <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-tinta-suave uppercase">Solicitud original</h4>
                <p className="whitespace-pre-wrap text-sm text-tinta-suave">{detalle.descripcion}</p>
              </section>
            )}

            {detalle.entregables && (
              <section className="rounded-xl border border-borde-suave p-3.5">
                <h4 className="mb-2 text-xs font-semibold tracking-wide text-tinta-suave uppercase">Entregables</h4>
                <ul className="space-y-1">
                  {detalle.entregables.split('\n').filter(Boolean).map((entregable, indice) => (
                    <li key={`${entregable}-${indice}`} className="flex gap-2 text-sm text-tinta-suave">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {entregable}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {detalle.plan_ia && (detalle.plan_ia.tareas.length > 0 || detalle.plan_ia.cronograma.length > 0) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {detalle.plan_ia.tareas.length > 0 && (
                  <section className="rounded-xl border border-borde-suave p-3.5">
                    <h4 className="mb-2 text-xs font-semibold tracking-wide text-tinta-suave uppercase">Tareas ejecutadas</h4>
                    <ul className="space-y-1">
                      {detalle.plan_ia.tareas.map((tarea, indice) => (
                        <li key={`${tarea}-${indice}`} className="flex gap-2 text-sm text-tinta-suave">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                          {tarea}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {detalle.plan_ia.cronograma.length > 0 && (
                  <section className="rounded-xl border border-borde-suave p-3.5">
                    <h4 className="mb-2 text-xs font-semibold tracking-wide text-tinta-suave uppercase">Cronograma</h4>
                    <ul className="space-y-1">
                      {detalle.plan_ia.cronograma.map((fase, indice) => (
                        <li key={`${fase}-${indice}`} className="flex gap-2 text-sm text-tinta-suave">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                          {fase}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}

            {detalle.informe && (
              <section className="rounded-xl border border-borde-suave">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-borde-suave px-3.5 py-3">
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold text-tinta">
                    <Bot size={15} className="text-blue-600" /> Informe de entrega
                  </h4>
                  <Boton
                    variante="secundario"
                    type="button"
                    className="text-xs"
                    onClick={() => descargarTexto(`informe-${detalle.titulo.replace(/\s+/g, '-').toLowerCase()}.txt`, detalle.informe ?? '')}
                  >
                    <Download size={14} /> Descargar
                  </Boton>
                </div>
                <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap p-3.5 font-sans text-sm leading-relaxed text-tinta-suave">
                  {detalle.informe}
                </pre>
              </section>
            )}

            {detalle.plan_ia?.datos_pendientes && detalle.plan_ia.datos_pendientes.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">
                <p className="font-semibold">Pendiente de validar</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {detalle.plan_ia.datos_pendientes.map((dato, indice) => (
                    <li key={`${dato}-${indice}`}>{dato}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 border-t border-borde-suave pt-4">
              <Boton variante="secundario" type="button" onClick={() => setDetalle(null)}>
                Cerrar
              </Boton>
              <Boton
                type="button"
                onClick={() => {
                  const servicio = detalle
                  setDetalle(null)
                  abrirEdicion(servicio)
                }}
              >
                <Pencil size={15} /> Editar servicio
              </Boton>
            </div>
          </div>
        )}
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
