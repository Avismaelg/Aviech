import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCopy,
  ExternalLink,
  FileText,
  Gauge,
  Inbox,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react'
import { useCallback, useMemo, useState, type KeyboardEvent } from 'react'
import { useAvisos } from '../../lib/avisos'
import {
  ETAPAS_TALENTO,
  ETAPAS_TALENTO_ABIERTAS,
  colorEtapaTalento,
  etiquetaEtapaTalento,
} from '../../lib/etiquetas'
import { formatoFechaHora, urlPortalTalento } from '../../lib/talento'
import { useTabla } from '../../lib/useTabla'
import type { CandidatoTalento, EmpresaTalento, PostulacionTalento, VacanteTalento } from '../../types/talento'
import { Boton, CabeceraSeccion, Insignia, Tarjeta } from '../ui'
import { Candidatos } from './Candidatos'
import { EmpresasTalento } from './Empresas'
import { MantenimientoCV } from './Mantenimiento'
import { Procesos } from './Procesos'
import type { PestanaTalento, TablaTalento } from './tipos'
import { Vacantes } from './Vacantes'

const PESTANAS: Array<{ id: PestanaTalento; etiqueta: string }> = [
  { id: 'resumen', etiqueta: 'Resumen' },
  { id: 'candidatos', etiqueta: 'Candidatos' },
  { id: 'empresas', etiqueta: 'Empresas' },
  { id: 'vacantes', etiqueta: 'Vacantes' },
  { id: 'procesos', etiqueta: 'Procesos' },
]

const ACENTO_ETAPA: Record<string, string> = {
  recibida: 'bg-tinta-tenue',
  preseleccion: 'bg-acento-claro',
  entrevista: 'bg-info',
  oferta: 'bg-aviso',
  contratada: 'bg-exito',
  rechazada: 'bg-peligro',
}

export function Talento() {
  const aviso = useAvisos()
  const candidatosHook = useTabla<CandidatoTalento>('talento_candidatos')
  const empresasHook = useTabla<EmpresaTalento>('talento_empresas')
  const vacantesHook = useTabla<VacanteTalento>('talento_vacantes', '*, talento_empresas(id, nombre)')
  const postulacionesHook = useTabla<PostulacionTalento>(
    'talento_postulaciones',
    '*, talento_candidatos(id, nombre, email, telefono, puesto_objetivo, seniority, modalidad, ubicacion, habilidades, disponibilidad, expectativa_salarial, cv_path, cv_url, cv_nombre), talento_empresas(id, nombre), talento_vacantes(id, titulo)',
  )

  const [pestana, setPestana] = useState<PestanaTalento>('resumen')
  const [copiado, setCopiado] = useState(false)
  const [ahora] = useState(() => Date.now())

  const cargarCandidatos = candidatosHook.cargar
  const cargarEmpresas = empresasHook.cargar
  const cargarVacantes = vacantesHook.cargar
  const cargarPostulaciones = postulacionesHook.cargar

  const candidatos = useMemo(
    () => [...candidatosHook.filas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [candidatosHook.filas],
  )
  const empresas = useMemo(
    () => [...empresasHook.filas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [empresasHook.filas],
  )

  const activos = useMemo(
    () => candidatos.filter((candidato) => !['descartado', 'contratado'].includes(candidato.estado)),
    [candidatos],
  )
  const vacantesAbiertas = useMemo(
    () => vacantesHook.filas.filter((vacante) => vacante.estado === 'abierta'),
    [vacantesHook.filas],
  )
  const procesosAbiertos = useMemo(
    () =>
      postulacionesHook.filas.filter((proceso) =>
        (ETAPAS_TALENTO_ABIERTAS as readonly string[]).includes(proceso.etapa),
      ),
    [postulacionesHook.filas],
  )
  const entrevistas = useMemo(() => {
    return postulacionesHook.filas
      .filter(
        (proceso) =>
          proceso.fecha_entrevista &&
          new Date(proceso.fecha_entrevista).getTime() >= ahora &&
          proceso.etapa !== 'rechazada' &&
          proceso.etapa !== 'contratada',
      )
      .sort(
        (a, b) =>
          new Date(a.fecha_entrevista ?? 0).getTime() - new Date(b.fecha_entrevista ?? 0).getTime(),
      )
      .slice(0, 6)
  }, [postulacionesHook.filas, ahora])
  const contratadas = useMemo(
    () => postulacionesHook.filas.filter((proceso) => proceso.etapa === 'contratada'),
    [postulacionesHook.filas],
  )
  const ultimos = useMemo(
    () =>
      [...postulacionesHook.filas]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6),
    [postulacionesHook.filas],
  )

  const refrescar = useCallback(async () => {
    await Promise.all([cargarCandidatos(), cargarEmpresas(), cargarVacantes(), cargarPostulaciones()])
  }, [cargarCandidatos, cargarEmpresas, cargarVacantes, cargarPostulaciones])

  const tablaCandidatos: TablaTalento<CandidatoTalento> = {
    filas: candidatos,
    cargando: candidatosHook.cargando,
    error: candidatosHook.error,
    cargar: candidatosHook.cargar,
    guardar: candidatosHook.guardar,
    eliminar: candidatosHook.eliminar,
  }
  const tablaEmpresas: TablaTalento<EmpresaTalento> = {
    filas: empresas,
    cargando: empresasHook.cargando,
    error: empresasHook.error,
    cargar: empresasHook.cargar,
    guardar: empresasHook.guardar,
    eliminar: empresasHook.eliminar,
  }
  const tablaVacantes: TablaTalento<VacanteTalento> = {
    filas: vacantesHook.filas,
    cargando: vacantesHook.cargando,
    error: vacantesHook.error,
    cargar: vacantesHook.cargar,
    guardar: vacantesHook.guardar,
    eliminar: vacantesHook.eliminar,
  }
  const tablaPostulaciones: TablaTalento<PostulacionTalento> = {
    filas: postulacionesHook.filas,
    cargando: postulacionesHook.cargando,
    error: postulacionesHook.error,
    cargar: postulacionesHook.cargar,
    guardar: postulacionesHook.guardar,
    eliminar: postulacionesHook.eliminar,
  }

  const contadores: Record<PestanaTalento, number> = {
    resumen: procesosAbiertos.length,
    candidatos: activos.length,
    empresas: empresas.length,
    vacantes: vacantesAbiertas.length,
    procesos: procesosAbiertos.length,
  }

  const descripcion = `${activos.length} candidato${activos.length === 1 ? '' : 's'} activo${
    activos.length === 1 ? '' : 's'
  } · ${vacantesAbiertas.length} vacante${vacantesAbiertas.length === 1 ? '' : 's'} abierta${
    vacantesAbiertas.length === 1 ? '' : 's'
  } · ${procesosAbiertos.length} proceso${procesosAbiertos.length === 1 ? '' : 's'} en marcha`

  function alTeclearPestana(evento: KeyboardEvent<HTMLDivElement>) {
    const actual = PESTANAS.findIndex((fila) => fila.id === pestana)
    let destino = actual
    if (evento.key === 'ArrowRight') destino = (actual + 1) % PESTANAS.length
    else if (evento.key === 'ArrowLeft') destino = (actual - 1 + PESTANAS.length) % PESTANAS.length
    else if (evento.key === 'Home') destino = 0
    else if (evento.key === 'End') destino = PESTANAS.length - 1
    else return
    evento.preventDefault()
    const id = PESTANAS[destino].id
    setPestana(id)
    window.setTimeout(() => document.getElementById(`pestana-talento-${id}`)?.focus(), 0)
  }

  async function copiarPortal() {
    try {
      await navigator.clipboard.writeText(urlPortalTalento())
      setCopiado(true)
      aviso('Enlace del portal copiado')
      window.setTimeout(() => setCopiado(false), 2500)
    } catch {
      aviso('No se pudo copiar el enlace. Cópialo desde la barra del navegador.', 'error')
    }
  }

  return (
    <section>
      <CabeceraSeccion
        titulo="Talento"
        descripcion={descripcion}
        acciones={
          <div className="flex flex-wrap gap-2">
            <Boton variante="secundario" onClick={() => void copiarPortal()}>
              {copiado ? <CheckCircle2 size={16} /> : <ClipboardCopy size={16} />}
              {copiado ? 'Copiado' : 'Copiar portal'}
            </Boton>
            <a
              href="/talento"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-[20px] border border-accion bg-accion px-5 py-2.5 text-sm font-medium text-superficie transition-colors hover:border-accion-hover hover:bg-accion-hover"
            >
              <ExternalLink size={16} /> Abrir portal
            </a>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[18px] bg-arena text-clay">
            <Users size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Candidatos activos</p>
            <p className="text-base font-semibold text-tinta">{activos.length}</p>
            <p className="text-xs text-tinta-tenue">{candidatos.length} perfiles en total</p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[18px] bg-info-suave text-info">
            <BriefcaseBusiness size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Vacantes abiertas</p>
            <p className="text-base font-semibold text-tinta">{vacantesAbiertas.length}</p>
            <p className="text-xs text-tinta-tenue">
              {vacantesHook.filas.filter((vacante) => vacante.publica).length} visibles en el portal
            </p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[18px] bg-exito-suave text-exito">
            <Gauge size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Procesos en marcha</p>
            <p className="text-base font-semibold text-tinta">{procesosAbiertos.length}</p>
            <p className="text-xs text-tinta-tenue">
              {contratadas.length} colocaci{contratadas.length === 1 ? 'ón' : 'ones'} cerrada
              {contratadas.length === 1 ? '' : 's'}
            </p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[18px] bg-aviso-suave text-aviso">
            <CalendarClock size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Próximas entrevistas</p>
            <p className="text-base font-semibold text-tinta">{entrevistas.length}</p>
            <p className="text-xs text-tinta-tenue">
              {entrevistas[0] ? formatoFechaHora(entrevistas[0].fecha_entrevista) : 'Sin entrevistas agendadas'}
            </p>
          </div>
        </Tarjeta>
      </div>

      <div
        role="tablist"
        aria-label="Secciones de Talento"
        onKeyDown={alTeclearPestana}
        className="mb-4 flex gap-1 overflow-x-auto rounded-[28px] border border-borde bg-superficie p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        {PESTANAS.map(({ id, etiqueta }) => {
          const activa = pestana === id
          return (
            <button
              key={id}
              id={`pestana-talento-${id}`}
              type="button"
              role="tab"
              aria-selected={activa}
              aria-controls={`panel-talento-${id}`}
              tabIndex={activa ? 0 : -1}
              onClick={() => setPestana(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
                activa ? 'bg-accion text-superficie shadow-sm shadow-accion/20' : 'text-tinta-suave hover:bg-superficie-2 hover:text-tinta'
              }`}
            >
              {etiqueta}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                  activa ? 'bg-superficie/20 text-superficie' : 'bg-superficie-2 text-tinta-tenue'
                }`}
              >
                {contadores[id]}
              </span>
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={`panel-talento-${pestana}`} aria-labelledby={`pestana-talento-${pestana}`}>
        {pestana === 'resumen' && (
          <Resumen
            candidatos={candidatos}
            vacantes={vacantesHook.filas}
            procesos={postulacionesHook.filas}
            entrevistas={entrevistas}
            ultimos={ultimos}
            onIr={setPestana}
          />
        )}
        {pestana === 'candidatos' && (
          <Candidatos
            candidatos={tablaCandidatos}
            postulaciones={postulacionesHook.filas}
            refrescar={refrescar}
            onIrAProcesos={() => setPestana('procesos')}
          />
        )}
        {pestana === 'empresas' && (
          <EmpresasTalento
            empresas={tablaEmpresas}
            vacantes={vacantesHook.filas}
            postulaciones={postulacionesHook.filas}
            refrescar={refrescar}
            onIrAVacantes={() => setPestana('vacantes')}
          />
        )}
        {pestana === 'vacantes' && (
          <Vacantes
            vacantes={tablaVacantes}
            empresas={empresas}
            candidatos={candidatos}
            postulaciones={tablaPostulaciones}
            refrescar={refrescar}
            onIrAProcesos={() => setPestana('procesos')}
            onIrACandidatos={() => setPestana('candidatos')}
          />
        )}
        {pestana === 'procesos' && (
          <Procesos
            postulaciones={tablaPostulaciones}
            candidatos={tablaCandidatos}
            empresas={empresas}
            vacantes={vacantesHook.filas}
            refrescar={refrescar}
          />
        )}
      </div>
    </section>
  )
}

function Resumen({
  candidatos,
  vacantes,
  procesos,
  entrevistas,
  ultimos,
  onIr,
}: {
  candidatos: CandidatoTalento[]
  vacantes: VacanteTalento[]
  procesos: PostulacionTalento[]
  entrevistas: PostulacionTalento[]
  ultimos: PostulacionTalento[]
  onIr: (pestana: PestanaTalento) => void
}) {
  const total = procesos.filter((proceso) => proceso.etapa !== 'rechazada').length
  const maximo = Math.max(1, ...ETAPAS_TALENTO.map((etapa) => procesos.filter((p) => p.etapa === etapa).length))
  const solicitudesEmpresa = procesos
    .filter((proceso) => proceso.origen === 'empresa' && proceso.etapa === 'recibida')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <Tarjeta className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-tinta">
              <Inbox size={16} className="text-clay" /> Solicitudes de empresas
            </p>
            <Boton variante="secundario" onClick={() => onIr('procesos')}>
              Ver procesos
            </Boton>
          </div>
          {solicitudesEmpresa.length === 0 ? (
            <p className="mt-4 rounded-[18px] border border-borde bg-superficie-2/50 p-4 text-sm text-tinta-suave">
              No hay solicitudes nuevas del portal. Cuando una empresa pida entrevistar o contratar un perfil, aparece
              aquí para que el equipo la atienda.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-borde-suave">
              {solicitudesEmpresa.map((solicitud) => (
                <li key={solicitud.id} className="py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-tinta">
                      {solicitud.talento_candidatos?.nombre ?? 'Candidato'}
                    </p>
                    <Insignia color={solicitud.solicitud_tipo === 'contratacion' ? 'emerald' : 'sky'}>
                      {solicitud.solicitud_tipo === 'contratacion' ? 'Contratación' : 'Entrevista'}
                    </Insignia>
                  </div>
                  <p className="truncate text-xs text-tinta-suave">
                    {solicitud.talento_empresas?.nombre ?? 'Empresa'} · {formatoFechaHora(solicitud.created_at)}
                  </p>
                  {solicitud.notas && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-tinta-tenue">
                      «{solicitud.notas}»
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-tinta">Embudo de selección</p>
              <p className="text-xs text-tinta-suave">
                {total} proceso{total === 1 ? '' : 's'} activo{total === 1 ? '' : 's'} o cerrado
                {total === 1 ? '' : 's'} sin contar rechazos.
              </p>
            </div>
            <Boton variante="secundario" onClick={() => onIr('procesos')}>
              Ver pipeline <ArrowRight size={15} />
            </Boton>
          </div>
          <div className="mt-4 space-y-3">
            {ETAPAS_TALENTO.map((etapa) => {
              const cantidad = procesos.filter((proceso) => proceso.etapa === etapa).length
              return (
                <div key={etapa}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-tinta">
                      <span className={`h-2 w-2 rounded-full ${ACENTO_ETAPA[etapa]}`} />
                      {etiquetaEtapaTalento[etapa]}
                    </span>
                    <span className="tabular-nums text-tinta-tenue">{cantidad}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-superficie-2">
                    <div
                      className={`h-full rounded-full ${ACENTO_ETAPA[etapa]} transition-all`}
                      style={{ width: `${Math.max(cantidad > 0 ? 8 : 0, (cantidad / maximo) * 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Tarjeta>

        <Tarjeta className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-tinta">Últimos procesos</p>
            <Boton variante="secundario" onClick={() => onIr('procesos')}>
              Abrir procesos
            </Boton>
          </div>
          {ultimos.length === 0 ? (
            <p className="mt-4 rounded-[18px] border border-borde bg-superficie-2/50 p-4 text-sm text-tinta-suave">
              Todavía no hay procesos. Comparte el portal o crea el primero manualmente.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-borde-suave">
              {ultimos.map((proceso) => (
                <li key={proceso.id} className="flex flex-wrap items-center gap-2 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-arena text-[10px] font-semibold text-clay">
                    {proceso.talento_candidatos?.nombre
                      ?.split(/\s+/)
                      .slice(0, 2)
                      .map((parte) => parte.charAt(0).toUpperCase())
                      .join('') ?? '?'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-tinta">
                      {proceso.talento_candidatos?.nombre ?? 'Candidato'}
                    </p>
                    <p className="truncate text-xs text-tinta-suave">
                      {proceso.talento_empresas?.nombre ?? 'Empresa'} ·{' '}
                      {proceso.talento_vacantes?.titulo ?? 'Solicitud directa'}
                    </p>
                  </div>
                  <Insignia color={colorEtapaTalento[proceso.etapa]}>
                    {etiquetaEtapaTalento[proceso.etapa] ?? proceso.etapa}
                  </Insignia>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>

      <div className="space-y-4">
        <Tarjeta className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-tinta">
              <CalendarClock size={16} className="text-info" /> Próximas entrevistas
            </p>
            <Boton variante="secundario" onClick={() => onIr('procesos')}>
              Agenda
            </Boton>
          </div>
          {entrevistas.length === 0 ? (
            <p className="mt-4 rounded-[18px] border border-borde bg-superficie-2/50 p-4 text-sm text-tinta-suave">
              No hay entrevistas agendadas. Abre un proceso y define fecha y hora.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {entrevistas.map((proceso) => (
                <li key={proceso.id} className="rounded-[18px] border border-borde bg-superficie-2/50 p-3">
                  <p className="text-sm font-medium text-tinta">
                    {proceso.talento_candidatos?.nombre ?? 'Candidato'}
                  </p>
                  <p className="truncate text-xs text-tinta-suave">
                    {proceso.talento_empresas?.nombre ?? 'Empresa'} ·{' '}
                    {proceso.talento_vacantes?.titulo ?? 'Solicitud directa'}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-info">
                    <CalendarClock size={11} /> {formatoFechaHora(proceso.fecha_entrevista)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta className="overflow-hidden">
          <div className="bg-tinta p-5 text-superficie">
            <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-acento-claro uppercase">
              <Sparkles size={12} /> Portal público
            </p>
            <p className="mt-2 text-lg leading-tight font-medium tracking-[-0.02em]">
              Comparte una sola página con candidatos y empresas.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-superficie/65">
              Perfil rápido, CV privado y una experiencia de selección tipo marketplace. Las empresas exploran perfiles
              anónimos y solicitan la entrevista o la contratación.
            </p>
            <Boton
              variante="secundario"
              className="mt-4 border-superficie/20 bg-superficie/10 text-superficie hover:border-superficie/40 hover:bg-superficie/15"
              onClick={() => {
                window.open('/talento', '_blank', 'noopener,noreferrer')
              }}
            >
              <ExternalLink size={15} /> Abrir portal
            </Boton>
          </div>
          <div className="grid gap-3 p-5 text-xs text-tinta-suave sm:grid-cols-2">
            <div>
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-tinta">
                <UserRound size={14} className="text-clay" /> Busco empleo
              </p>
              El candidato crea su perfil, sube su CV en PDF y se postula a una vacante o deja que la IA lo haga por él.
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-tinta">
                <Building2 size={14} className="text-clay" /> Busco talento
              </p>
              La empresa explora perfiles anónimos, arma su shortlist y solicita entrevista.
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-tinta">
                <FileText size={14} className="text-clay" /> CV privado
              </p>
              El PDF queda en un bucket privado; solo el personal puede abrirlo con enlace firmado.
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-tinta">
                <Sparkles size={14} className="text-clay" /> IA en Talento
              </p>
              El equipo pide sugerencias desde una vacante; el candidato puede autorizar que la IA postule por él.
            </div>
          </div>
        </Tarjeta>

        <MantenimientoCV candidatos={candidatos} />
      </div>
      <span className="sr-only">
        {candidatos.length} candidatos, {vacantes.length} vacantes y {procesos.length} procesos.
      </span>
    </div>
  )
}
