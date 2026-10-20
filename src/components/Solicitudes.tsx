import {
  Bot,
  Building2,
  CalendarDays,
  Check,
  ClipboardCopy,
  ClipboardList,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  TriangleAlert,
  UserRound,
} from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useAvisos } from '../lib/avisos'
import { descargarTexto } from '../lib/descargas'
import {
  CANALES_SOLICITUD,
  ESTADOS_SOLICITUD,
  TIPOS_SERVICIO,
  URGENCIAS_SOLICITUD,
  colorEstadoSolicitud,
  colorUrgenciaSolicitud,
  etiquetaCanalSolicitud,
  etiquetaEstadoSolicitud,
  etiquetaOrigenSolicitud,
  etiquetaTipoServicio,
  etiquetaUrgenciaSolicitud,
} from '../lib/etiquetas'
import { formatoDinero, formatoFecha } from '../lib/formato'
import { supabase } from '../lib/supabase'
import { useTabla } from '../lib/useTabla'
import type { SolicitudServicio } from '../types/solicitud'
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

interface FormularioSolicitud {
  nombre: string
  empresa: string
  email: string
  telefono: string
  sitio_web: string
  tipo: string
  titulo: string
  descripcion: string
  objetivos: string
  presupuesto: string
  urgencia: string
  fecha_deseada: string
  canal: string
  auto: boolean
}

const FORMULARIO_VACIO: FormularioSolicitud = {
  nombre: '',
  empresa: '',
  email: '',
  telefono: '',
  sitio_web: '',
  tipo: 'consultoria',
  titulo: '',
  descripcion: '',
  objetivos: '',
  presupuesto: '',
  urgencia: 'media',
  fecha_deseada: '',
  canal: 'whatsapp',
  auto: true,
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold tracking-wide text-tinta-tenue uppercase">{etiqueta}</dt>
      <dd className="mt-0.5 truncate text-sm text-tinta" title={valor}>
        {valor || '—'}
      </dd>
    </div>
  )
}

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-borde-suave bg-superficie-2/40 p-3.5">
      <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-tinta-suave uppercase">{titulo}</h4>
      <div className="text-sm text-tinta-suave">{children}</div>
    </section>
  )
}

function Lista({ elementos }: { elementos: string[] }) {
  if (elementos.length === 0) return <p className="text-tinta-tenue">Sin elementos todavía.</p>
  return (
    <ul className="space-y-1">
      {elementos.map((elemento, indice) => (
        <li key={`${elemento}-${indice}`} className="flex gap-2">
          <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden />
          <span>{elemento}</span>
        </li>
      ))}
    </ul>
  )
}

export function Solicitudes({ onIrAServicios }: { onIrAServicios: () => void }) {
  const aviso = useAvisos()
  const { filas: solicitudes, cargando, error, cargar, eliminar } = useTabla<SolicitudServicio>(
    'solicitudes_servicio',
  )
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [formulario, setFormulario] = useState<FormularioSolicitud>(FORMULARIO_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [detalle, setDetalle] = useState<SolicitudServicio | null>(null)
  const [ejecutandoId, setEjecutandoId] = useState<string | null>(null)
  const [porEliminar, setPorEliminar] = useState<SolicitudServicio | null>(null)
  const [copiado, setCopiado] = useState(false)

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return solicitudes.filter((solicitud) => {
      const coincideEstado = filtroEstado === 'todos' || solicitud.estado === filtroEstado
      const coincideTexto =
        !texto ||
        [
          solicitud.titulo,
          solicitud.solicitante_nombre,
          solicitud.empresa,
          solicitud.email,
          solicitud.telefono,
          solicitud.descripcion,
        ].some((valor) => valor?.toLowerCase().includes(texto))
      return coincideEstado && coincideTexto
    })
  }, [solicitudes, busqueda, filtroEstado])

  const nuevas = solicitudes.filter((solicitud) => solicitud.estado === 'nueva').length
  const completadas = solicitudes.filter((solicitud) => solicitud.estado === 'completada').length
  const publicas = solicitudes.filter((solicitud) => solicitud.origen === 'publico').length
  const valorCerrado = solicitudes
    .filter((solicitud) => solicitud.estado === 'completada')
    .reduce((total, solicitud) => total + Number(solicitud.precio_sugerido || 0), 0)

  function abrirNueva() {
    setFormulario(FORMULARIO_VACIO)
    setModalAbierto(true)
  }

  async function copiarEnlacePublico() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/solicitud`)
      setCopiado(true)
      aviso('Enlace público copiado')
      window.setTimeout(() => setCopiado(false), 2500)
    } catch {
      aviso('No se pudo copiar el enlace. Cópialo desde la barra del navegador.', 'error')
    }
  }

  async function copiar(texto: string, que: string) {
    if (!texto) return
    try {
      await navigator.clipboard.writeText(texto)
      aviso(`${que} copiado`)
    } catch {
      aviso('No se pudo copiar. Selecciona el texto y cópialo a mano.', 'error')
    }
  }

  async function ejecutarConIA(solicitud: SolicitudServicio) {
    if (!supabase || ejecutandoId) return
    setEjecutandoId(solicitud.id)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
      const respuesta = await fetch('/api/solicitudes/ejecutar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: solicitud.id }),
      })
      const datos = (await respuesta.json().catch(() => null)) as { error?: string; mensaje?: string } | null
      if (!respuesta.ok) throw new Error(datos?.error || 'La IA no pudo completar la solicitud.')
      aviso(datos?.mensaje || 'La IA completó el servicio')
      setDetalle(null)
      await cargar()
    } catch (fallo) {
      aviso(fallo instanceof Error ? fallo.message : 'La IA no pudo completar la solicitud.', 'error')
      await cargar()
    } finally {
      setEjecutandoId(null)
    }
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!supabase || guardando) return
    if (!formulario.nombre.trim() || !formulario.titulo.trim() || formulario.descripcion.trim().length < 20) {
      aviso('Completa el nombre, el título y una descripción de al menos 20 caracteres.', 'error')
      return
    }
    if (!formulario.email.trim() && !formulario.telefono.trim()) {
      aviso('Deja un correo o un teléfono para contactar al cliente.', 'error')
      return
    }
    setGuardando(true)
    const { data, error: falloGuardar } = await supabase
      .from('solicitudes_servicio')
      .insert({
        origen: 'interno',
        canal: formulario.canal,
        solicitante_nombre: formulario.nombre.trim(),
        empresa: formulario.empresa.trim() || null,
        email: formulario.email.trim() || null,
        telefono: formulario.telefono.trim() || null,
        sitio_web: formulario.sitio_web.trim() || null,
        tipo: formulario.tipo,
        titulo: formulario.titulo.trim(),
        descripcion: formulario.descripcion.trim(),
        objetivos: formulario.objetivos.trim() || null,
        presupuesto: formulario.presupuesto === '' ? null : Number(formulario.presupuesto),
        urgencia: formulario.urgencia,
        fecha_deseada: formulario.fecha_deseada || null,
        estado: 'nueva',
      })
      .select('*')
      .single()
    setGuardando(false)
    if (falloGuardar) {
      aviso(`No se pudo crear la solicitud: ${falloGuardar.message}`, 'error')
      return
    }
    setModalAbierto(false)
    aviso('Solicitud creada')
    await cargar()
    if (formulario.auto && data) {
      await ejecutarConIA(data as SolicitudServicio)
    }
  }

  async function confirmarEliminar() {
    if (!porEliminar) return
    const eliminada = porEliminar
    setPorEliminar(null)
    if (detalle?.id === eliminada.id) setDetalle(null)
    await eliminar(eliminada.id)
  }

  const ejecutando = detalle ? ejecutandoId === detalle.id : false

  return (
    <section>
      <CabeceraSeccion
        titulo="Solicitudes"
        descripcion="El cliente pide un servicio y la IA prepara el alcance, ejecuta el trabajo y lo cierra. Tú revisas."
        acciones={
          <div className="flex flex-wrap gap-2">
            <Boton variante="secundario" onClick={() => void copiarEnlacePublico()}>
              {copiado ? <Check size={16} /> : <ClipboardCopy size={16} />}
              {copiado ? 'Enlace copiado' : 'Enlace público'}
            </Boton>
            <Boton onClick={abrirNueva}>
              <Plus size={16} /> Nueva solicitud
            </Boton>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        {[
          { titulo: 'Nuevas', valor: String(nuevas), detalle: 'esperando a la IA', Icono: ClipboardList, clase: 'bg-sky-50 text-sky-700' },
          { titulo: 'Completadas', valor: String(completadas), detalle: 'servicios cerrados', Icono: Check, clase: 'bg-emerald-50 text-emerald-700' },
          { titulo: 'Formulario público', valor: String(publicas), detalle: 'solicitudes recibidas', Icono: Globe2, clase: 'bg-blue-50 text-blue-700' },
          { titulo: 'Valor sugerido', valor: formatoDinero(valorCerrado), detalle: 'en servicios completados', Icono: Sparkles, clase: 'bg-cyan-50 text-cyan-700' },
        ].map(({ titulo, valor, detalle: texto, Icono, clase }) => (
          <Tarjeta key={titulo} className="flex items-center gap-2.5 p-3 sm:gap-3 sm:p-4">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${clase}`}>
              <Icono size={17} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] text-tinta-suave sm:text-xs">{titulo}</p>
              <p className="truncate text-[13px] font-semibold text-tinta tabular-nums sm:text-lg">{valor}</p>
              <p className="truncate text-[10px] text-tinta-tenue sm:text-[11px]">{texto}</p>
            </div>
          </Tarjeta>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por cliente, empresa, título o correo…"
            className="pl-9"
          />
        </div>
        <Selector value={filtroEstado} onChange={(evento) => setFiltroEstado(evento.target.value)} className="sm:w-48">
          <option value="todos">Todos los estados</option>
          {ESTADOS_SOLICITUD.map((estado) => (
            <option key={estado} value={estado}>
              {etiquetaEstadoSolicitud[estado]}
            </option>
          ))}
        </Selector>
      </div>

      <Tarjeta>
        {error && <ErrorTabla mensaje={error} />}
        {cargando && !error && <FilasCargando />}
        {!cargando && !error && filtradas.length === 0 && (
          solicitudes.length === 0 ? (
            <Vacio
              icono={<ClipboardList size={22} />}
              titulo="Todavía no hay solicitudes"
              texto="Crea la primera o comparte el enlace público para que los clientes pidan un servicio."
              accion={
                <Boton onClick={abrirNueva}>
                  <Plus size={16} /> Nueva solicitud
                </Boton>
              }
            />
          ) : (
            <Vacio icono={<Search size={22} />} titulo="Sin resultados" texto="Prueba otra búsqueda o quita el filtro." />
          )
        )}
        {!cargando && !error && filtradas.length > 0 && (
          <ul className="divide-y divide-borde-suave">
            {filtradas.map((solicitud) => {
              const activa = ejecutandoId === solicitud.id
              const cerrada = solicitud.estado === 'completada'
              return (
                <li key={solicitud.id} className="flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-superficie-2/50 sm:flex-row sm:items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                    {solicitud.origen === 'publico' ? <Globe2 size={15} /> : <ClipboardList size={15} />}
                  </span>
                  <button type="button" onClick={() => setDetalle(solicitud)} className="min-w-0 flex-1 text-left">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-tinta">{solicitud.titulo}</span>
                      <Insignia color={colorEstadoSolicitud[solicitud.estado] ?? 'slate'}>
                        {etiquetaEstadoSolicitud[solicitud.estado] ?? solicitud.estado}
                      </Insignia>
                      <Insignia color={colorUrgenciaSolicitud[solicitud.urgencia] ?? 'slate'}>
                        {etiquetaUrgenciaSolicitud[solicitud.urgencia] ?? solicitud.urgencia}
                      </Insignia>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-tinta-suave">
                      {[solicitud.solicitante_nombre, solicitud.empresa].filter(Boolean).join(' · ')}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-tinta-tenue">
                      {[etiquetaTipoServicio[solicitud.tipo] ?? solicitud.tipo, etiquetaOrigenSolicitud[solicitud.origen] ?? solicitud.origen, formatoFecha(solicitud.created_at)]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </button>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    {!cerrada && (
                      <Boton
                        variante={solicitud.estado === 'error' ? 'secundario' : 'primario'}
                        onClick={() => void ejecutarConIA(solicitud)}
                        disabled={activa || Boolean(ejecutandoId)}
                        className="text-xs"
                      >
                        {activa ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                        ) : solicitud.estado === 'error' ? (
                          <RefreshCw size={14} />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        {activa ? 'Ejecutando…' : solicitud.estado === 'error' ? 'Reintentar' : 'Ejecutar IA'}
                      </Boton>
                    )}
                    <BotonIcono etiqueta="Ver detalle" onClick={() => setDetalle(solicitud)}>
                      <FileText size={15} />
                    </BotonIcono>
                    <BotonIcono
                      etiqueta="Eliminar solicitud"
                      onClick={() => setPorEliminar(solicitud)}
                      className="hover:bg-red-50 hover:text-red-700"
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
        titulo="Nueva solicitud de servicio"
        onCerrar={() => setModalAbierto(false)}
        ancho="sm:max-w-3xl"
      >
        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre del solicitante *">
            <Entrada
              required
              value={formulario.nombre}
              onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
              placeholder="Ej. Ana Pérez"
            />
          </Campo>
          <Campo etiqueta="Empresa">
            <Entrada
              value={formulario.empresa}
              onChange={(evento) => setFormulario({ ...formulario, empresa: evento.target.value })}
              placeholder="Ej. Grupo del Norte"
            />
          </Campo>
          <Campo etiqueta="Correo">
            <Entrada
              type="email"
              value={formulario.email}
              onChange={(evento) => setFormulario({ ...formulario, email: evento.target.value })}
              placeholder="cliente@empresa.com"
            />
          </Campo>
          <Campo etiqueta="Teléfono">
            <Entrada
              value={formulario.telefono}
              onChange={(evento) => setFormulario({ ...formulario, telefono: evento.target.value })}
              placeholder="809 555 0101"
            />
          </Campo>
          <Campo etiqueta="Sitio web" className="sm:col-span-2">
            <Entrada
              value={formulario.sitio_web}
              onChange={(evento) => setFormulario({ ...formulario, sitio_web: evento.target.value })}
              placeholder="https://empresa.com (opcional; necesario para Auditoría SEO)"
            />
          </Campo>
          <Campo etiqueta="Tipo de servicio">
            <Selector
              value={formulario.tipo}
              onChange={(evento) => setFormulario({ ...formulario, tipo: evento.target.value })}
            >
              {TIPOS_SERVICIO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {etiquetaTipoServicio[tipo]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Canal de entrada">
            <Selector
              value={formulario.canal}
              onChange={(evento) => setFormulario({ ...formulario, canal: evento.target.value })}
            >
              {CANALES_SOLICITUD.map((canal) => (
                <option key={canal} value={canal}>
                  {etiquetaCanalSolicitud[canal]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Urgencia">
            <Selector
              value={formulario.urgencia}
              onChange={(evento) => setFormulario({ ...formulario, urgencia: evento.target.value })}
            >
              {URGENCIAS_SOLICITUD.map((urgencia) => (
                <option key={urgencia} value={urgencia}>
                  {etiquetaUrgenciaSolicitud[urgencia]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Presupuesto estimado (RD$)">
            <Entrada
              type="number"
              min="0"
              step="0.01"
              value={formulario.presupuesto}
              onChange={(evento) => setFormulario({ ...formulario, presupuesto: evento.target.value })}
              placeholder="Opcional"
            />
          </Campo>
          <Campo etiqueta="Fecha deseada">
            <Entrada
              type="date"
              value={formulario.fecha_deseada}
              onChange={(evento) => setFormulario({ ...formulario, fecha_deseada: evento.target.value })}
            />
          </Campo>
          <Campo etiqueta="Título de la solicitud *" className="sm:col-span-2">
            <Entrada
              required
              value={formulario.titulo}
              onChange={(evento) => setFormulario({ ...formulario, titulo: evento.target.value })}
              placeholder="Ej. Auditoría SEO y plan de contenidos"
            />
          </Campo>
          <Campo etiqueta="¿Qué necesita? *" className="sm:col-span-2">
            <AreaTexto
              required
              minLength={20}
              value={formulario.descripcion}
              onChange={(evento) => setFormulario({ ...formulario, descripcion: evento.target.value })}
              placeholder="Describe la situación, el problema y lo que el cliente espera lograr."
              className="min-h-28"
            />
          </Campo>
          <Campo etiqueta="Objetivos o datos adicionales" className="sm:col-span-2">
            <AreaTexto
              value={formulario.objetivos}
              onChange={(evento) => setFormulario({ ...formulario, objetivos: evento.target.value })}
              placeholder="Fechas, documentos disponibles, alcance esperado, restricciones…"
            />
          </Campo>
          <label className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-sm text-blue-900 sm:col-span-2">
            <input
              type="checkbox"
              checked={formulario.auto}
              onChange={(evento) => setFormulario({ ...formulario, auto: evento.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <strong>Ejecutar con IA al guardar.</strong> La IA crea el cliente, la oportunidad, el servicio, el
              informe y lo cierra. Luego puedes revisar y corregir.
            </span>
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : formulario.auto ? 'Guardar y ejecutar' : 'Guardar solicitud'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={detalle !== null}
        titulo={detalle?.titulo ?? 'Solicitud'}
        onCerrar={() => setDetalle(null)}
        ancho="sm:max-w-4xl"
      >
        {detalle && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Insignia color={colorEstadoSolicitud[detalle.estado] ?? 'slate'}>
                {etiquetaEstadoSolicitud[detalle.estado] ?? detalle.estado}
              </Insignia>
              <Insignia color={colorUrgenciaSolicitud[detalle.urgencia] ?? 'slate'}>
                Urgencia {etiquetaUrgenciaSolicitud[detalle.urgencia] ?? detalle.urgencia}
              </Insignia>
              <Insignia color={detalle.origen === 'publico' ? 'cyan' : 'slate'}>
                {etiquetaOrigenSolicitud[detalle.origen] ?? detalle.origen}
              </Insignia>
              {detalle.precio_sugerido != null && detalle.estado === 'completada' && (
                <Insignia color="emerald">Precio IA: {formatoDinero(detalle.precio_sugerido)}</Insignia>
              )}
            </div>

            <dl className="grid gap-3 rounded-xl border border-borde-suave p-4 sm:grid-cols-2 lg:grid-cols-3">
              <Dato etiqueta="Solicitante" valor={detalle.solicitante_nombre} />
              <Dato etiqueta="Empresa" valor={detalle.empresa ?? ''} />
              <Dato etiqueta="Correo" valor={detalle.email ?? ''} />
              <Dato etiqueta="Teléfono" valor={detalle.telefono ?? ''} />
              <Dato etiqueta="Sitio web" valor={detalle.sitio_web ?? ''} />
              <Dato etiqueta="Canal" valor={etiquetaCanalSolicitud[detalle.canal] ?? detalle.canal} />
              <Dato etiqueta="Tipo" valor={etiquetaTipoServicio[detalle.tipo] ?? detalle.tipo} />
              <Dato etiqueta="Fecha deseada" valor={formatoFecha(detalle.fecha_deseada)} />
              <Dato etiqueta="Presupuesto declarado" valor={detalle.presupuesto == null ? '' : formatoDinero(detalle.presupuesto)} />
              <Dato etiqueta="Recibida" valor={formatoFecha(detalle.created_at)} />
              <Dato etiqueta="Ejecutada" valor={detalle.ejecutado_en ? formatoFecha(detalle.ejecutado_en) : ''} />
            </dl>

            <Bloque titulo="Lo que pidió el cliente">
              <p className="whitespace-pre-wrap">{detalle.descripcion}</p>
              {detalle.objetivos && (
                <p className="mt-2 whitespace-pre-wrap border-t border-borde-suave pt-2 text-tinta-suave">
                  <strong className="text-tinta">Objetivos:</strong> {detalle.objetivos}
                </p>
              )}
            </Bloque>

            {detalle.error_ia && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
                <TriangleAlert size={17} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">La IA no pudo completar la solicitud</p>
                  <p className="mt-0.5">{detalle.error_ia}</p>
                  <p className="mt-1 text-xs text-red-700/80">La solicitud quedó guardada. Puedes reintentarla.</p>
                </div>
              </div>
            )}

            {detalle.plan_ia && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-tinta">
                    <Bot size={16} className="text-blue-600" /> Plan preparado por la IA
                  </h3>
                  <Insignia
                    color={
                      detalle.plan_ia.nivel_confianza === 'alto'
                        ? 'emerald'
                        : detalle.plan_ia.nivel_confianza === 'bajo'
                          ? 'red'
                          : 'amber'
                    }
                  >
                    Confianza {detalle.plan_ia.nivel_confianza}
                  </Insignia>
                </div>
                {detalle.plan_ia.resumen && (
                  <Bloque titulo="Resumen ejecutivo">
                    <p className="whitespace-pre-wrap">{detalle.plan_ia.resumen}</p>
                  </Bloque>
                )}
                {detalle.plan_ia.alcance && (
                  <Bloque titulo="Alcance">
                    <p className="whitespace-pre-wrap">{detalle.plan_ia.alcance}</p>
                  </Bloque>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Bloque titulo="Entregables">
                    <Lista elementos={detalle.plan_ia.entregables} />
                  </Bloque>
                  <Bloque titulo="Tareas">
                    <Lista elementos={detalle.plan_ia.tareas} />
                  </Bloque>
                </div>
                {detalle.plan_ia.cronograma.length > 0 && (
                  <Bloque titulo="Cronograma">
                    <Lista elementos={detalle.plan_ia.cronograma} />
                  </Bloque>
                )}
                {detalle.plan_ia.datos_pendientes.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">
                    <p className="font-semibold">Datos pendientes para validar</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5">
                      {detalle.plan_ia.datos_pendientes.map((dato, indice) => (
                        <li key={`${dato}-${indice}`}>{dato}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {detalle.plan_ia.propuesta && (
                  <details className="rounded-xl border border-borde-suave">
                    <summary className="cursor-pointer px-3.5 py-3 text-sm font-semibold text-tinta">
                      Propuesta comercial
                    </summary>
                    <div className="border-t border-borde-suave p-3.5">
                      <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap font-sans text-sm text-tinta-suave">
                        {detalle.plan_ia.propuesta}
                      </pre>
                      <Boton
                        variante="secundario"
                        type="button"
                        className="mt-2 text-xs"
                        onClick={() => void copiar(detalle.plan_ia?.propuesta ?? '', 'Propuesta')}
                      >
                        <Copy size={14} /> Copiar propuesta
                      </Boton>
                    </div>
                  </details>
                )}
                {detalle.plan_ia.correo && (
                  <details className="rounded-xl border border-borde-suave">
                    <summary className="cursor-pointer px-3.5 py-3 text-sm font-semibold text-tinta">
                      Correo para el cliente
                    </summary>
                    <div className="border-t border-borde-suave p-3.5">
                      <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap font-sans text-sm text-tinta-suave">
                        {detalle.plan_ia.correo}
                      </pre>
                      <Boton
                        variante="secundario"
                        type="button"
                        className="mt-2 text-xs"
                        onClick={() => void copiar(detalle.plan_ia?.correo ?? '', 'Correo')}
                      >
                        <Copy size={14} /> Copiar correo
                      </Boton>
                    </div>
                  </details>
                )}
                {detalle.plan_ia.informe && (
                  <details open={detalle.estado === 'completada'} className="rounded-xl border border-borde-suave">
                    <summary className="cursor-pointer px-3.5 py-3 text-sm font-semibold text-tinta">
                      Informe de entrega
                    </summary>
                    <div className="border-t border-borde-suave p-3.5">
                      <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-tinta-suave">
                        {detalle.plan_ia.informe}
                      </pre>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Boton
                          variante="secundario"
                          type="button"
                          className="text-xs"
                          onClick={() => void copiar(detalle.plan_ia?.informe ?? '', 'Informe')}
                        >
                          <Copy size={14} /> Copiar informe
                        </Boton>
                        <Boton
                          variante="secundario"
                          type="button"
                          className="text-xs"
                          onClick={() =>
                            descargarTexto(
                              `informe-${detalle.solicitante_nombre.replace(/\s+/g, '-').toLowerCase()}.txt`,
                              detalle.plan_ia?.informe ?? '',
                            )
                          }
                        >
                          <Download size={14} /> Descargar
                        </Boton>
                      </div>
                    </div>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-borde-suave pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Boton
                variante="fantasma"
                type="button"
                onClick={() => setPorEliminar(detalle)}
                className="justify-start text-red-700 hover:bg-red-50"
              >
                <Trash2 size={15} /> Eliminar
              </Boton>
              <div className="flex flex-wrap justify-end gap-2">
                {detalle.estado === 'completada' ? (
                  <>
                    <Boton variante="secundario" type="button" onClick={() => setDetalle(null)}>
                      Cerrar
                    </Boton>
                    <Boton
                      type="button"
                      onClick={() => {
                        setDetalle(null)
                        onIrAServicios()
                      }}
                    >
                      <ExternalLink size={15} /> Ir a Servicios
                    </Boton>
                  </>
                ) : (
                  <>
                    <Boton variante="secundario" type="button" onClick={() => setDetalle(null)}>
                      Cerrar
                    </Boton>
                    <Boton
                      type="button"
                      disabled={ejecutando}
                      onClick={() => void ejecutarConIA(detalle)}
                    >
                      {ejecutando ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : detalle.estado === 'error' ? (
                        <RefreshCw size={15} />
                      ) : (
                        <Sparkles size={15} />
                      )}
                      {ejecutando ? 'Trabajando…' : detalle.estado === 'error' ? 'Reintentar y cerrar' : 'Ejecutar con IA y cerrar'}
                    </Boton>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-2 text-xs text-tinta-tenue sm:grid-cols-3">
              <span className="flex items-center gap-1.5">
                <UserRound size={13} /> {detalle.cliente_creado ? 'Cliente creado por la IA' : 'Cliente existente o pendiente'}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 size={13} /> {detalle.servicio_id ? 'Servicio enlazado' : 'Sin servicio todavía'}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} /> {detalle.oportunidad_id ? 'Oportunidad cerrada en CRM' : 'Sin oportunidad todavía'}
              </span>
            </div>
          </div>
        )}
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar solicitud"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => void confirmarEliminar()}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar <strong className="text-tinta">{porEliminar.titulo}</strong>? El servicio y
              la oportunidad ya creados no se eliminan.
            </>
          ) : null
        }
      />
    </section>
  )
}
