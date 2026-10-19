import { CalendarClock, CheckCircle2, Circle, ClipboardCheck, Mail, Pencil, Phone, Plus, Search, StickyNote, Trash2, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { cx } from '../../lib/estilos'
import { TIPOS_ACTIVIDAD_CRM, etiquetaTipoActividadCrm } from '../../lib/etiquetas'
import { formatoFecha, hoyISO } from '../../lib/formato'
import type { ActividadCrm } from '../../types/crm'
import {
  AreaTexto,
  Boton,
  BotonIcono,
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
} from '../ui'
import type { PropsActividades } from './tipos'

const ICONO_TIPO: Record<string, LucideIcon> = {
  llamada: Phone,
  correo: Mail,
  reunion: Users,
  tarea: ClipboardCheck,
  nota: StickyNote,
}

interface FormularioActividad {
  tipo: string
  titulo: string
  detalle: string
  fecha: string
  oportunidad_id: string
  contacto_id: string
  completada: boolean
}

const FORMULARIO_VACIO: FormularioActividad = {
  tipo: 'tarea',
  titulo: '',
  detalle: '',
  fecha: '',
  oportunidad_id: '',
  contacto_id: '',
  completada: false,
}

type FiltroActividades = 'pendientes' | 'completadas' | 'todas'

export function Actividades({ actividades, oportunidades, contactos }: PropsActividades) {
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroActividades>('pendientes')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<FormularioActividad>(FORMULARIO_VACIO)
  const [porEliminar, setPorEliminar] = useState<ActividadCrm | null>(null)
  const [guardando, setGuardando] = useState(false)

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return actividades.filas.filter((actividad) => {
      const coincideFiltro =
        filtro === 'todas' ? true : filtro === 'pendientes' ? !actividad.completada : actividad.completada
      if (!coincideFiltro) return false
      if (!texto) return true
      return [
        actividad.titulo,
        actividad.detalle,
        actividad.crm_oportunidades?.titulo,
        actividad.crm_oportunidades?.crm_empresas?.nombre,
        actividad.crm_contactos?.nombre,
      ].some((valor) => valor?.toLowerCase().includes(texto))
    })
  }, [actividades.filas, filtro, busqueda])

  const ordenadas = useMemo(() => {
    return [...filtradas].sort((a, b) => {
      if (a.completada !== b.completada) return a.completada ? 1 : -1
      return a.fecha.localeCompare(b.fecha)
    })
  }, [filtradas])

  const contactosDisponibles = useMemo(() => {
    const oportunidad = oportunidades.find((fila) => fila.id === formulario.oportunidad_id)
    if (!oportunidad?.empresa_id) return contactos
    return contactos.filter((contacto) => contacto.empresa_id === oportunidad.empresa_id)
  }, [contactos, oportunidades, formulario.oportunidad_id])

  function abrirNuevo() {
    setEditandoId(null)
    setFormulario({ ...FORMULARIO_VACIO, fecha: hoyISO() })
    setModalAbierto(true)
  }

  function abrirEdicion(actividad: ActividadCrm) {
    setEditandoId(actividad.id)
    setFormulario({
      tipo: actividad.tipo,
      titulo: actividad.titulo,
      detalle: actividad.detalle ?? '',
      fecha: actividad.fecha,
      oportunidad_id: actividad.oportunidad_id ?? '',
      contacto_id: actividad.contacto_id ?? '',
      completada: actividad.completada,
    })
    setModalAbierto(true)
  }

  function cambiarOportunidad(valor: string) {
    const oportunidad = oportunidades.find((fila) => fila.id === valor)
    const disponibles = oportunidad?.empresa_id
      ? contactos.filter((contacto) => contacto.empresa_id === oportunidad.empresa_id)
      : contactos
    setFormulario((actual) => ({
      ...actual,
      oportunidad_id: valor,
      contacto_id: disponibles.some((contacto) => contacto.id === actual.contacto_id) ? actual.contacto_id : '',
    }))
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando || !formulario.titulo.trim()) return
    setGuardando(true)
    const guardado = await actividades.guardar(
      {
        oportunidad_id: formulario.oportunidad_id || null,
        contacto_id: formulario.contacto_id || null,
        tipo: formulario.tipo,
        titulo: formulario.titulo.trim(),
        detalle: formulario.detalle.trim() || null,
        fecha: formulario.fecha || hoyISO(),
        completada: formulario.completada,
      },
      editandoId ?? undefined,
    )
    setGuardando(false)
    if (guardado) setModalAbierto(false)
  }

  function alternar(actividad: ActividadCrm) {
    void actividades.guardar({ completada: !actividad.completada }, actividad.id)
  }

  async function eliminarActividad() {
    if (!porEliminar) return
    await actividades.eliminar(porEliminar.id)
    setPorEliminar(null)
  }

  function limpiarFiltros() {
    setBusqueda('')
    setFiltro('todas')
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por título, empresa o contacto…"
            className="pl-9"
          />
        </div>
        <Selector
          value={filtro}
          onChange={(evento) => setFiltro(evento.target.value as FiltroActividades)}
          className="sm:w-44"
        >
          <option value="pendientes">Pendientes</option>
          <option value="completadas">Completadas</option>
          <option value="todas">Todas</option>
        </Selector>
        <Boton onClick={abrirNuevo}>
          <Plus size={16} /> Nueva actividad
        </Boton>
      </div>

      <p aria-live="polite" className="sr-only">
        {ordenadas.length} actividad{ordenadas.length === 1 ? '' : 'es'} en pantalla
      </p>

      <Tarjeta>
        {actividades.error && <ErrorTabla mensaje={actividades.error} />}
        {actividades.cargando && !actividades.error && <FilasCargando />}
        {!actividades.cargando && !actividades.error && ordenadas.length === 0 && (
          actividades.filas.length === 0 ? (
            <Vacio
              icono={<CalendarClock size={22} />}
              titulo="Todavía no hay actividades"
              texto="Agenda llamadas, correos, reuniones y tareas para no perder el seguimiento."
              accion={
                <Boton variante="secundario" onClick={abrirNuevo}>
                  <Plus size={16} /> Nueva actividad
                </Boton>
              }
            />
          ) : (
            <Vacio
              icono={<Search size={22} />}
              titulo="Sin resultados"
              texto="No hay actividades con este filtro o búsqueda."
              accion={
                <Boton variante="secundario" onClick={limpiarFiltros}>
                  Limpiar filtros
                </Boton>
              }
            />
          )
        )}
        {!actividades.cargando && !actividades.error && ordenadas.length > 0 && (
          <ul className="divide-y divide-borde-suave">
            {ordenadas.map((actividad) => {
              const Icono = ICONO_TIPO[actividad.tipo] ?? ClipboardCheck
              const atrasada = !actividad.completada && actividad.fecha < hoyISO()
              return (
                <li
                  key={actividad.id}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-superficie-2"
                >
                  <button
                    type="button"
                    aria-pressed={actividad.completada}
                    aria-label={actividad.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
                    onClick={() => alternar(actividad)}
                    className={cx(
                      'mt-0.5 shrink-0 rounded-full p-0.5 transition-colors',
                      actividad.completada
                        ? 'text-emerald-300 hover:text-emerald-200'
                        : 'text-tinta-tenue hover:text-indigo-300',
                    )}
                  >
                    {actividad.completada ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                  </button>
                  <span
                    className={cx(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      actividad.completada ? 'bg-superficie-2 text-tinta-tenue' : 'bg-indigo-400/10 text-indigo-300',
                    )}
                  >
                    <Icono size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cx(
                        'truncate text-sm font-medium',
                        actividad.completada ? 'text-tinta-tenue line-through' : 'text-tinta',
                      )}
                    >
                      {actividad.titulo}
                    </p>
                    <p className="truncate text-xs text-tinta-suave">
                      {[
                        etiquetaTipoActividadCrm[actividad.tipo] ?? actividad.tipo,
                        actividad.crm_oportunidades?.titulo,
                        actividad.crm_oportunidades?.crm_empresas?.nombre,
                        actividad.crm_contactos?.nombre,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'General'}
                    </p>
                    {actividad.detalle && (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-tinta-tenue">{actividad.detalle}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={cx('text-xs', atrasada ? 'font-medium text-red-300' : 'text-tinta-tenue')}>
                      {formatoFecha(actividad.fecha)}
                    </span>
                    {atrasada && <Insignia color="red">Atrasada</Insignia>}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <BotonIcono etiqueta="Editar" onClick={() => abrirEdicion(actividad)}>
                      <Pencil size={15} />
                    </BotonIcono>
                    <BotonIcono
                      etiqueta="Eliminar"
                      onClick={() => setPorEliminar(actividad)}
                      className="hover:bg-red-400/10 hover:text-red-300"
                    >
                      <Trash2 size={15} />
                    </BotonIcono>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Tarjeta>

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? 'Editar actividad' : 'Nueva actividad'}
        onCerrar={() => setModalAbierto(false)}
      >
        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Tipo">
            <Selector
              value={formulario.tipo}
              onChange={(evento) => setFormulario({ ...formulario, tipo: evento.target.value })}
            >
              {TIPOS_ACTIVIDAD_CRM.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {etiquetaTipoActividadCrm[tipo]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Fecha">
            <Entrada
              required
              type="date"
              value={formulario.fecha}
              onChange={(evento) => setFormulario({ ...formulario, fecha: evento.target.value })}
            />
          </Campo>
          <Campo etiqueta="Título *" className="sm:col-span-2">
            <Entrada
              required
              value={formulario.titulo}
              onChange={(evento) => setFormulario({ ...formulario, titulo: evento.target.value })}
              placeholder="Ej. Llamar para confirmar la propuesta"
            />
          </Campo>
          <Campo etiqueta="Oportunidad">
            <Selector value={formulario.oportunidad_id} onChange={(evento) => cambiarOportunidad(evento.target.value)}>
              <option value="">Sin oportunidad</option>
              {oportunidades.map((oportunidad) => (
                <option key={oportunidad.id} value={oportunidad.id}>
                  {oportunidad.titulo}
                  {oportunidad.crm_empresas?.nombre ? ` — ${oportunidad.crm_empresas.nombre}` : ''}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Contacto">
            <Selector
              value={formulario.contacto_id}
              onChange={(evento) => setFormulario({ ...formulario, contacto_id: evento.target.value })}
            >
              <option value="">Sin contacto</option>
              {contactosDisponibles.map((contacto) => (
                <option key={contacto.id} value={contacto.id}>
                  {contacto.nombre}
                  {contacto.crm_empresas?.nombre ? ` — ${contacto.crm_empresas.nombre}` : ''}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Detalle" className="sm:col-span-2">
            <AreaTexto
              value={formulario.detalle}
              onChange={(evento) => setFormulario({ ...formulario, detalle: evento.target.value })}
              placeholder="Qué hay que hacer, con quién y para cuándo…"
            />
          </Campo>
          <label className="flex items-center gap-2 text-sm text-tinta-suave sm:col-span-2">
            <input
              type="checkbox"
              checked={formulario.completada}
              onChange={(evento) => setFormulario({ ...formulario, completada: evento.target.checked })}
              className="h-4 w-4 rounded border-borde bg-superficie-2 accent-indigo-500"
            />
            Marcar como completada
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Crear actividad'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar actividad"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          void eliminarActividad()
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar la actividad{' '}
              <strong className="text-tinta">{porEliminar.titulo}</strong>? Esta acción no se puede deshacer.
            </>
          ) : null
        }
      />
    </div>
  )
}
