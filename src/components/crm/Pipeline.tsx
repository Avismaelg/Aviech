import { Building2, CalendarDays, Plus, Search, Trash2, UserPlus } from 'lucide-react'
import { useMemo, useState, type DragEvent, type FormEvent } from 'react'
import { useAvisos } from '../../lib/avisos'
import { convertirEmpresaEnCliente } from '../../lib/crm'
import { cx } from '../../lib/estilos'
import { ETAPAS_CRM, etiquetaEtapaCrm } from '../../lib/etiquetas'
import { formatoDinero, formatoFecha } from '../../lib/formato'
import type { OportunidadCrm } from '../../types/crm'
import {
  AreaTexto,
  Boton,
  Campo,
  Confirmar,
  Entrada,
  ErrorTabla,
  FilasCargando,
  Modal,
  Selector,
  Tarjeta,
  Vacio,
} from '../ui'
import type { PropsPipeline } from './tipos'

interface FormularioOportunidad {
  titulo: string
  empresa_id: string
  contacto_id: string
  etapa: string
  monto: string
  probabilidad: string
  fecha_cierre: string
  notas: string
}

const FORMULARIO_VACIO: FormularioOportunidad = {
  titulo: '',
  empresa_id: '',
  contacto_id: '',
  etapa: 'prospecto',
  monto: '',
  probabilidad: '20',
  fecha_cierre: '',
  notas: '',
}

const ACENTO_ETAPA: Record<string, string> = {
  prospecto: 'bg-slate-400',
  contactado: 'bg-sky-400',
  reunion: 'bg-blue-400',
  propuesta: 'bg-amber-400',
  negociacion: 'bg-cyan-400',
  ganado: 'bg-emerald-400',
  perdido: 'bg-red-400',
}

export function Pipeline({ oportunidades, empresas, contactos, refrescar, onIrAEmpresas }: PropsPipeline) {
  const aviso = useAvisos()
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<FormularioOportunidad>(FORMULARIO_VACIO)
  const [porEliminar, setPorEliminar] = useState<OportunidadCrm | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null)
  const [columnaActiva, setColumnaActiva] = useState<string | null>(null)
  const [convirtiendo, setConvirtiendo] = useState(false)

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return oportunidades.filas.filter((oportunidad) => {
      if (!texto) return true
      return [oportunidad.titulo, oportunidad.crm_empresas?.nombre, oportunidad.crm_contactos?.nombre].some((valor) =>
        valor?.toLowerCase().includes(texto),
      )
    })
  }, [oportunidades.filas, busqueda])

  const porEtapa = useMemo(() => {
    const mapa: Record<string, OportunidadCrm[]> = {}
    for (const etapa of ETAPAS_CRM) mapa[etapa] = []
    for (const oportunidad of filtradas) {
      if (!mapa[oportunidad.etapa]) mapa[oportunidad.etapa] = []
      mapa[oportunidad.etapa].push(oportunidad)
    }
    return mapa
  }, [filtradas])

  const empresaSeleccionada = empresas.find((empresa) => empresa.id === formulario.empresa_id) ?? null
  const contactoSeleccionado = contactos.find((contacto) => contacto.id === formulario.contacto_id) ?? null
  const contactosDisponibles = contactos.filter(
    (contacto) => !formulario.empresa_id || contacto.empresa_id === formulario.empresa_id,
  )

  function abrirNuevo() {
    setEditandoId(null)
    setFormulario({ ...FORMULARIO_VACIO, empresa_id: empresas.length === 1 ? empresas[0].id : '' })
    setModalAbierto(true)
  }

  function abrirEdicion(oportunidad: OportunidadCrm) {
    setEditandoId(oportunidad.id)
    setFormulario({
      titulo: oportunidad.titulo,
      empresa_id: oportunidad.empresa_id ?? '',
      contacto_id: oportunidad.contacto_id ?? '',
      etapa: oportunidad.etapa,
      monto: String(oportunidad.monto ?? ''),
      probabilidad: String(oportunidad.probabilidad ?? 10),
      fecha_cierre: oportunidad.fecha_cierre ?? '',
      notas: oportunidad.notas ?? '',
    })
    setModalAbierto(true)
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando || !formulario.titulo.trim() || !formulario.empresa_id) return
    setGuardando(true)
    const guardado = await oportunidades.guardar(
      {
        empresa_id: formulario.empresa_id,
        contacto_id: formulario.contacto_id || null,
        titulo: formulario.titulo.trim(),
        etapa: formulario.etapa,
        monto: Number(formulario.monto) || 0,
        probabilidad: Math.min(100, Math.max(0, Number(formulario.probabilidad) || 0)),
        fecha_cierre: formulario.fecha_cierre || null,
        notas: formulario.notas.trim() || null,
      },
      editandoId ?? undefined,
    )
    setGuardando(false)
    if (guardado) setModalAbierto(false)
  }

  function soltar(evento: DragEvent<HTMLDivElement>, etapa: string) {
    evento.preventDefault()
    setColumnaActiva(null)
    if (!arrastrandoId) return
    const oportunidad = oportunidades.filas.find((fila) => fila.id === arrastrandoId)
    setArrastrandoId(null)
    if (oportunidad && oportunidad.etapa !== etapa) {
      void oportunidades.guardar({ etapa }, oportunidad.id)
    }
  }

  async function eliminarOportunidad() {
    if (!porEliminar) return
    await oportunidades.eliminar(porEliminar.id)
    setPorEliminar(null)
    await refrescar()
  }

  async function convertir() {
    if (!empresaSeleccionada || empresaSeleccionada.cliente_id || convirtiendo) return
    setConvirtiendo(true)
    const resultado = await convertirEmpresaEnCliente(empresaSeleccionada, contactoSeleccionado)
    setConvirtiendo(false)
    if (!resultado.ok) {
      aviso(resultado.error ?? 'No se pudo convertir la empresa en cliente.', 'error')
      return
    }
    aviso(`${empresaSeleccionada.nombre} ahora es cliente`)
    await refrescar()
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por oportunidad, empresa o contacto…"
            className="pl-9"
          />
        </div>
        <Boton onClick={abrirNuevo}>
          <Plus size={16} /> Nueva oportunidad
        </Boton>
      </div>

      <p aria-live="polite" className="sr-only">
        {filtradas.length} oportunidad{filtradas.length === 1 ? '' : 'es'} en pantalla
      </p>

      {oportunidades.error && <ErrorTabla mensaje={oportunidades.error} />}

      {oportunidades.cargando && !oportunidades.error && (
        <Tarjeta>
          <FilasCargando filas={6} />
        </Tarjeta>
      )}

      {!oportunidades.cargando && !oportunidades.error && oportunidades.filas.length === 0 && (
        <Tarjeta>
          <Vacio
            icono={<Building2 size={22} />}
            titulo="Todavía no hay oportunidades"
            texto={
              empresas.length === 0
                ? 'Primero registra una empresa y su contacto; después podrás seguir la oportunidad en el pipeline.'
                : 'Registra tu primera oportunidad y muévela por las etapas hasta ganarla.'
            }
            accion={
              empresas.length === 0 ? (
                <Boton variante="secundario" onClick={onIrAEmpresas}>
                  <Building2 size={16} /> Ir a Empresas
                </Boton>
              ) : (
                <Boton variante="secundario" onClick={abrirNuevo}>
                  <Plus size={16} /> Nueva oportunidad
                </Boton>
              )
            }
          />
        </Tarjeta>
      )}

      {!oportunidades.cargando &&
        !oportunidades.error &&
        oportunidades.filas.length > 0 &&
        filtradas.length === 0 && (
          <Tarjeta>
            <Vacio
              icono={<Search size={22} />}
              titulo="Sin resultados"
              texto="Prueba otra búsqueda."
              accion={
                <Boton variante="secundario" onClick={() => setBusqueda('')}>
                  Limpiar búsqueda
                </Boton>
              }
            />
          </Tarjeta>
        )}

      {!oportunidades.cargando &&
        !oportunidades.error &&
        oportunidades.filas.length > 0 &&
        filtradas.length > 0 && (
          <div className="-mx-1 overflow-x-auto px-1 pb-2">
            <div className="flex min-w-max items-start gap-3">
              {ETAPAS_CRM.map((etapa) => {
                const lista = porEtapa[etapa] ?? []
                const total = lista.reduce((suma, oportunidad) => suma + Number(oportunidad.monto || 0), 0)
                return (
                  <div
                    key={etapa}
                    onDragOver={(evento) => {
                      evento.preventDefault()
                      setColumnaActiva(etapa)
                    }}
                    onDrop={(evento) => soltar(evento, etapa)}
                    className={cx(
                      'w-64 shrink-0 rounded-xl border bg-superficie/60 transition-colors',
                      columnaActiva === etapa ? 'border-blue-200 bg-blue-400/5' : 'border-borde',
                    )}
                  >
                    <div className="flex items-center gap-2 border-b border-borde-suave px-3 py-2.5">
                      <span className={cx('h-2 w-2 shrink-0 rounded-full', ACENTO_ETAPA[etapa])} />
                      <span className="text-xs font-semibold text-tinta">{etiquetaEtapaCrm[etapa]}</span>
                      <span className="rounded-full bg-superficie-2 px-1.5 text-[11px] text-tinta-tenue tabular-nums">
                        {lista.length}
                      </span>
                      <span className="ml-auto text-[11px] text-tinta-tenue tabular-nums">{formatoDinero(total)}</span>
                    </div>
                    <div className="space-y-2 p-2">
                      {lista.length === 0 && (
                        <p className="px-2 py-6 text-center text-xs text-tinta-tenue">Sin oportunidades</p>
                      )}
                      {lista.map((oportunidad) => (
                        <article
                          key={oportunidad.id}
                          draggable
                          onDragStart={(evento) => {
                            setArrastrandoId(oportunidad.id)
                            evento.dataTransfer.effectAllowed = 'move'
                            evento.dataTransfer.setData('text/plain', oportunidad.id)
                          }}
                          onDragEnd={() => {
                            setArrastrandoId(null)
                            setColumnaActiva(null)
                          }}
                          className={cx(
                            'group relative rounded-lg border border-borde-suave bg-superficie-2/80 transition-opacity',
                            arrastrandoId === oportunidad.id && 'opacity-50',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => abrirEdicion(oportunidad)}
                            aria-label={`Editar ${oportunidad.titulo}`}
                            className="block w-full rounded-lg p-3 pr-9 text-left"
                          >
                            <p className="truncate text-sm font-medium text-tinta">{oportunidad.titulo}</p>
                            <p className="mt-0.5 truncate text-xs text-tinta-suave">
                              {oportunidad.crm_empresas?.nombre ?? 'Sin empresa'}
                            </p>
                            <div className="mt-2 flex items-baseline gap-1.5">
                              <span className="text-sm font-semibold text-tinta tabular-nums">
                                {formatoDinero(Number(oportunidad.monto))}
                              </span>
                              <span className="text-[11px] text-tinta-tenue">{Number(oportunidad.probabilidad)}%</span>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-tinta-tenue">
                              <span className="flex items-center gap-1">
                                <CalendarDays size={11} />
                                {oportunidad.fecha_cierre ? formatoFecha(oportunidad.fecha_cierre) : 'Sin cierre'}
                              </span>
                              {oportunidad.crm_contactos?.nombre && (
                                <span className="truncate">{oportunidad.crm_contactos.nombre}</span>
                              )}
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={(evento) => {
                              evento.stopPropagation()
                              setPorEliminar(oportunidad)
                            }}
                            aria-label={`Eliminar ${oportunidad.titulo}`}
                            title="Eliminar"
                            className="absolute top-2 right-2 rounded-md p-1.5 text-tinta-tenue opacity-100 transition-opacity hover:bg-red-50 hover:text-red-700 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </article>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? 'Editar oportunidad' : 'Nueva oportunidad'}
        onCerrar={() => setModalAbierto(false)}
        ancho="sm:max-w-2xl"
      >
        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Título *" className="sm:col-span-2">
            <Entrada
              required
              value={formulario.titulo}
              onChange={(evento) => setFormulario({ ...formulario, titulo: evento.target.value })}
              placeholder="Ej. Iguala contable 2027"
            />
          </Campo>
          <Campo etiqueta="Empresa *">
            <Selector
              required
              value={formulario.empresa_id}
              onChange={(evento) =>
                setFormulario({ ...formulario, empresa_id: evento.target.value, contacto_id: '' })
              }
            >
              <option value="">Selecciona una empresa…</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
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
                </option>
              ))}
            </Selector>
          </Campo>
          {empresas.length === 0 && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 sm:col-span-2">
              No hay empresas registradas. Crea una primero para poder guardar la oportunidad.{' '}
              <button
                type="button"
                onClick={() => {
                  setModalAbierto(false)
                  onIrAEmpresas()
                }}
                className="font-medium underline underline-offset-2"
              >
                Ir a Empresas
              </button>
            </p>
          )}
          <Campo etiqueta="Etapa">
            <Selector
              value={formulario.etapa}
              onChange={(evento) => setFormulario({ ...formulario, etapa: evento.target.value })}
            >
              {ETAPAS_CRM.map((etapa) => (
                <option key={etapa} value={etapa}>
                  {etiquetaEtapaCrm[etapa]}
                </option>
              ))}
            </Selector>
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
          <Campo etiqueta="Probabilidad (%)">
            <Entrada
              type="number"
              min="0"
              max="100"
              value={formulario.probabilidad}
              onChange={(evento) => setFormulario({ ...formulario, probabilidad: evento.target.value })}
            />
          </Campo>
          <Campo etiqueta="Fecha de cierre">
            <Entrada
              type="date"
              value={formulario.fecha_cierre}
              onChange={(evento) => setFormulario({ ...formulario, fecha_cierre: evento.target.value })}
            />
          </Campo>
          <Campo etiqueta="Notas" className="sm:col-span-2">
            <AreaTexto
              value={formulario.notas}
              onChange={(evento) => setFormulario({ ...formulario, notas: evento.target.value })}
              placeholder="Alcance, siguiente paso, condiciones…"
            />
          </Campo>
          {formulario.etapa === 'ganado' && empresaSeleccionada && !empresaSeleccionada.cliente_id && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 sm:col-span-2">
              <p className="text-sm font-medium text-emerald-700">Oportunidad ganada</p>
              <p className="mt-0.5 text-xs text-emerald-700/80">
                Convierte {empresaSeleccionada.nombre} en cliente para empezar a facturarle.
              </p>
              <Boton
                variante="secundario"
                type="button"
                className="mt-2"
                onClick={() => void convertir()}
                disabled={convirtiendo}
              >
                <UserPlus size={15} /> {convirtiendo ? 'Convirtiendo…' : 'Convertir en cliente'}
              </Boton>
            </div>
          )}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Crear oportunidad'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar oportunidad"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          void eliminarOportunidad()
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar la oportunidad{' '}
              <strong className="text-tinta">{porEliminar.titulo}</strong>? También se eliminarán sus actividades. Esta
              acción no se puede deshacer.
            </>
          ) : null
        }
      />
    </div>
  )
}
