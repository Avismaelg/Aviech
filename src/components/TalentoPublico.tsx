import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleCheck,
  FileText,
  Loader2,
  LockKeyhole,
  MapPin,
  Plus,
  Search,
  Send,
  Sparkles,
  Upload,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  DISPONIBILIDADES,
  MODALIDADES_TALENTO,
  SENIORITIES,
  TIPOS_CONTRATO,
  etiquetaDisponibilidad,
  etiquetaModalidad,
  etiquetaSeniority,
  etiquetaTipoContrato,
} from '../lib/etiquetas'
import { formatoFecha } from '../lib/formato'
import { habilidadesDesdeTexto, LIMITE_CV_BYTES, rangoSalario, subirCV } from '../lib/talento'
import type { CandidatoPublico, VacantePublica } from '../types/talento'
import { AreaTexto, Boton, Campo, Entrada, Insignia, Modal, Selector, Tarjeta } from './ui'

type ModoTalento = 'empleo' | 'talento'
type ModoEmpresa = 'explorar' | 'publicar'
type TipoSolicitud = 'entrevista' | 'contratacion'

interface FormularioCandidato {
  nombre: string
  email: string
  telefono: string
  ubicacion: string
  puesto_objetivo: string
  seniority: string
  modalidad: string
  habilidades: string
  experiencia: string
  educacion: string
  disponibilidad: string
  expectativa_salarial: string
  cv_url: string
  vacante_id: string
}

const FORMULARIO_CANDIDATO_VACIO: FormularioCandidato = {
  nombre: '',
  email: '',
  telefono: '',
  ubicacion: '',
  puesto_objetivo: '',
  seniority: 'mid',
  modalidad: 'hibrido',
  habilidades: '',
  experiencia: '',
  educacion: '',
  disponibilidad: '',
  expectativa_salarial: '',
  cv_url: '',
  vacante_id: '',
}

interface FormularioEmpresa {
  empresa_nombre: string
  sector: string
  sitio_web: string
  ubicacion: string
  contacto_nombre: string
  contacto_email: string
  contacto_telefono: string
}

const FORMULARIO_EMPRESA_VACIO: FormularioEmpresa = {
  empresa_nombre: '',
  sector: '',
  sitio_web: '',
  ubicacion: '',
  contacto_nombre: '',
  contacto_email: '',
  contacto_telefono: '',
}

interface FormularioVacante extends FormularioEmpresa {
  titulo: string
  descripcion: string
  requisitos: string
  ubicacion_vacante: string
  modalidad: string
  seniority: string
  tipo_contrato: string
  salario_min: string
  salario_max: string
}

const FORMULARIO_VACANTE_VACIO: FormularioVacante = {
  ...FORMULARIO_EMPRESA_VACIO,
  titulo: '',
  descripcion: '',
  requisitos: '',
  ubicacion_vacante: '',
  modalidad: 'hibrido',
  seniority: 'mid',
  tipo_contrato: 'tiempo_completo',
  salario_min: '',
  salario_max: '',
}

interface RespuestaPublica {
  ok?: boolean
  error?: string
  mensaje?: string
  existente?: boolean
  postulacion_id?: string | null
  solicitudes?: number
  existentes?: number
}

interface ExitoCandidato {
  nombre: string
  vacante: VacantePublica | null
  existente: boolean
}

interface ExitoSolicitud {
  tipo: TipoSolicitud
  cantidad: number
  existentes: number
  empresa: string
}

interface ExitoVacante {
  titulo: string
  empresa: string
}

export function TalentoPublico() {
  const [modo, setModo] = useState<ModoTalento>('empleo')
  const [vacantes, setVacantes] = useState<VacantePublica[]>([])
  const [candidatos, setCandidatos] = useState<CandidatoPublico[]>([])
  const [cargandoVacantes, setCargandoVacantes] = useState(true)
  const [cargandoCandidatos, setCargandoCandidatos] = useState(true)
  const [errorVacantes, setErrorVacantes] = useState<string | null>(null)
  const [errorCandidatos, setErrorCandidatos] = useState<string | null>(null)
  const errorDatos = errorVacantes || errorCandidatos

  const cargarVacantes = useCallback(async () => {
    try {
      const respuesta = await fetch('/api/talento/vacantes')
      const datos = (await respuesta.json().catch(() => null)) as
        | { ok?: boolean; vacantes?: VacantePublica[]; error?: string }
        | null
      if (!respuesta.ok || !datos?.ok) throw new Error(datos?.error || 'No se pudieron cargar las vacantes.')
      setVacantes(datos.vacantes ?? [])
      setErrorVacantes(null)
    } catch (fallo) {
      setErrorVacantes(fallo instanceof Error ? fallo.message : 'No se pudieron cargar las vacantes.')
    } finally {
      setCargandoVacantes(false)
    }
  }, [])

  const cargarCandidatos = useCallback(async () => {
    try {
      const respuesta = await fetch('/api/talento/candidatos')
      const datos = (await respuesta.json().catch(() => null)) as
        | { ok?: boolean; candidatos?: CandidatoPublico[]; error?: string }
        | null
      if (!respuesta.ok || !datos?.ok) throw new Error(datos?.error || 'No se pudieron cargar los perfiles.')
      setCandidatos(datos.candidatos ?? [])
      setErrorCandidatos(null)
    } catch (fallo) {
      setErrorCandidatos(fallo instanceof Error ? fallo.message : 'No se pudieron cargar los perfiles.')
    } finally {
      setCargandoCandidatos(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Talento · AviTech Solutions Group'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => {
      meta.remove()
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- la carga inicial consulta la API y actualiza el estado
    void cargarVacantes()
    void cargarCandidatos()
  }, [cargarVacantes, cargarCandidatos])

  return (
    <div className="min-h-screen bg-fondo px-4 py-5 sm:px-6 lg:px-8">
      <div className="animar-entrada mx-auto w-full max-w-7xl">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <a href="/" className="flex min-w-0 items-center gap-3" aria-label="AviTech Solutions Group">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accion text-sm font-semibold text-superficie">
              A
              <span aria-hidden className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-fondo bg-acento" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="font-display block truncate text-[15px] font-semibold tracking-[-0.025em] text-tinta">
                AviTech Solutions Group
              </span>
              <span className="block text-[10px] tracking-[0.08em] text-tinta-tenue uppercase">Portal de talento</span>
            </span>
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-borde bg-superficie px-3 py-1.5 text-xs font-medium text-tinta-suave transition-colors hover:bg-arena hover:text-tinta"
          >
            Panel interno <ArrowUpRight size={13} />
          </a>
        </header>

        <section className="relative overflow-hidden rounded-[36px] bg-tinta px-5 py-8 text-superficie shadow-[0_40px_90px_-54px_rgba(20,20,19,0.7)] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <svg
            aria-hidden
            viewBox="0 0 620 620"
            className="pointer-events-none absolute -top-56 -right-44 h-[640px] w-[640px] text-acento-claro"
            fill="none"
          >
            <circle cx="310" cy="310" r="246" stroke="currentColor" strokeOpacity="0.14" />
            <circle cx="310" cy="310" r="176" stroke="currentColor" strokeOpacity="0.1" />
            <path d="M62 348C160 166 396 116 566 246" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
            <circle cx="566" cy="246" r="6" fill="currentColor" />
          </svg>
          <span
            aria-hidden
            className="font-display pointer-events-none absolute -right-6 -bottom-24 text-[16rem] leading-none font-semibold text-superficie/[0.035] select-none"
          >
            A
          </span>
          <div className="relative max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-superficie/15 bg-superficie/10 px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-acento-claro uppercase">
              <Sparkles size={12} /> Talento sin fricción
            </p>
            <h1 className="max-w-3xl text-[34px] leading-[1.03] font-medium tracking-[-0.035em] text-superficie sm:text-[46px] lg:text-[54px]">
              El talento correcto, sin vueltas.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-superficie/70 sm:text-base">
              Candidatos que encuentran su próxima oportunidad y empresas que descubren a la persona correcta. Perfiles
              rápidos, CV privado y solicitudes sin costo.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-medium text-superficie/80">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-superficie/15 bg-superficie/10 px-3 py-1.5">
                <UserRound size={12} /> Perfil en 2 minutos
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-superficie/15 bg-superficie/10 px-3 py-1.5">
                <LockKeyhole size={12} /> CV privado
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-superficie/15 bg-superficie/10 px-3 py-1.5">
                <CheckCircle2 size={12} /> Sin costo
              </span>
            </div>
          </div>
        </section>

        <div className="sticky top-3 z-30 mt-4 rounded-[28px] border border-borde bg-superficie/95 p-1 shadow-[0_16px_40px_-30px_rgba(20,20,19,0.45)] backdrop-blur">
          <div role="tablist" aria-label="Elige tu perfil" className="grid grid-cols-2 gap-1">
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'empleo'}
              onClick={() => setModo('empleo')}
              className={`flex items-center justify-center gap-2 rounded-[22px] px-3 py-2.5 text-sm font-semibold transition-colors ${
                modo === 'empleo' ? 'bg-accion text-superficie' : 'text-tinta-suave hover:bg-superficie-2 hover:text-tinta'
              }`}
            >
              <UserRound size={16} /> Busco empleo
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'talento'}
              onClick={() => setModo('talento')}
              className={`flex items-center justify-center gap-2 rounded-[22px] px-3 py-2.5 text-sm font-semibold transition-colors ${
                modo === 'talento' ? 'bg-accion text-superficie' : 'text-tinta-suave hover:bg-superficie-2 hover:text-tinta'
              }`}
            >
              <Building2 size={16} /> Busco talento
            </button>
          </div>
        </div>

        {errorDatos && (
          <p role="alert" className="mt-4 rounded-[20px] border border-aviso-borde bg-aviso-suave px-4 py-3 text-sm text-aviso">
            {errorDatos}
          </p>
        )}

        <div className="mt-4">
          {modo === 'empleo' ? (
            <PanelCandidato
              vacantes={vacantes}
              cargandoVacantes={cargandoVacantes}
              onRefrescarCandidatos={() => void cargarCandidatos()}
            />
          ) : (
            <PanelEmpresa
              candidatos={candidatos}
              cargandoCandidatos={cargandoCandidatos}
              onRefrescarVacantes={() => void cargarVacantes()}
            />
          )}
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-borde px-1 pt-5 pb-2 text-xs text-tinta-tenue">
          <p>AviTech Solutions Group · Talento</p>
          <div className="flex flex-wrap gap-4">
            <a href="/solicitud" className="font-medium text-tinta-suave transition-colors hover:text-clay">
              ¿Necesitas un servicio?
            </a>
            <a href="/" className="font-medium text-tinta-suave transition-colors hover:text-clay">
              Entrar al panel
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}

function PanelCandidato({
  vacantes,
  cargandoVacantes,
  onRefrescarCandidatos,
}: {
  vacantes: VacantePublica[]
  cargandoVacantes: boolean
  onRefrescarCandidatos: () => void
}) {
  const [formulario, setFormulario] = useState<FormularioCandidato>(FORMULARIO_CANDIDATO_VACIO)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [consentimiento, setConsentimiento] = useState(false)
  const [visible, setVisible] = useState(true)
  const [website, setWebsite] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<ExitoCandidato | null>(null)

  const vacanteSeleccionada = vacantes.find((vacante) => vacante.id === formulario.vacante_id) ?? null

  function seleccionarVacante(vacante: VacantePublica) {
    setFormulario((previo) => ({ ...previo, vacante_id: vacante.id, puesto_objetivo: previo.puesto_objetivo || vacante.titulo }))
    setExito(null)
    window.setTimeout(() => document.getElementById('perfil-candidato')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40)
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return
    setError(null)
    if (!formulario.nombre.trim() || !formulario.email.trim() || !formulario.puesto_objetivo.trim()) {
      setError('Completa tu nombre, correo y el puesto que buscas.')
      return
    }
    if (!consentimiento) {
      setError('Marca la autorización para usar tus datos y crear tu perfil.')
      return
    }
    if (archivo && archivo.size > LIMITE_CV_BYTES) {
      setError('El CV no puede superar 5 MB.')
      return
    }

    setEnviando(true)
    let cvPath: string | null = null
    let cvNombre: string | null = null
    if (archivo) {
      const subida = await subirCV(archivo)
      if ('error' in subida) {
        setError(subida.error)
        setEnviando(false)
        return
      }
      cvPath = subida.path
      cvNombre = subida.nombre
    }

    const expectativa = formulario.expectativa_salarial === '' ? null : Number(formulario.expectativa_salarial)
    try {
      const respuesta = await fetch('/api/talento/postulaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formulario,
          habilidades: habilidadesDesdeTexto(formulario.habilidades),
          expectativa_salarial: Number.isFinite(expectativa) && (expectativa ?? 0) >= 0 ? expectativa : null,
          cv_path: cvPath,
          cv_nombre: cvNombre,
          consentimiento: true,
          visible_empresas: visible,
          website,
        }),
      })
      const datos = (await respuesta.json().catch(() => null)) as RespuestaPublica | null
      if (!respuesta.ok || !datos?.ok) throw new Error(datos?.error || 'No se pudo crear tu perfil. Inténtalo otra vez.')
      setExito({
        nombre: formulario.nombre.split(' ')[0] || 'candidato',
        vacante: vacanteSeleccionada,
        existente: Boolean(datos.existente),
      })
      onRefrescarCandidatos()
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo crear tu perfil. Inténtalo otra vez.')
    } finally {
      setEnviando(false)
    }
  }

  function reiniciar() {
    setFormulario(FORMULARIO_CANDIDATO_VACIO)
    setArchivo(null)
    setConsentimiento(false)
    setVisible(true)
    setError(null)
    setExito(null)
    window.setTimeout(() => document.getElementById('perfil-candidato')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <Tarjeta className="p-5 sm:p-6" >
        <div id="perfil-candidato" />
        {exito ? (
          <div className="py-4 text-center sm:py-8">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-exito-suave text-exito ring-1 ring-exito-borde">
              <CircleCheck size={30} />
            </span>
            <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.18em] text-exito uppercase">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-exito" /> Perfil creado
            </p>
            <h2 className="mt-2 text-[30px] leading-tight font-medium tracking-[-0.03em] text-tinta">
              Gracias, {exito.nombre}.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-tinta-suave">
              {exito.vacante
                ? exito.existente
                  ? 'Ya tenías una postulación para esta vacante. Actualizamos tu perfil con la información nueva.'
                  : `Tu postulación a «${exito.vacante.titulo}» en ${exito.vacante.empresa_nombre} quedó registrada.`
                : 'Tu perfil quedó disponible para que las empresas lo descubran. Si aparece una vacante que encaja, te contactamos.'}
            </p>
            <div className="mx-auto mt-5 max-w-md rounded-[22px] border border-info-borde bg-info-suave p-4 text-left text-sm text-info">
              <p className="flex items-center gap-2 font-semibold">
                <LockKeyhole size={16} /> Tu privacidad
              </p>
              <p className="mt-1 text-info/80">
                Las empresas ven tu perfil sin tu correo, teléfono ni CV. Si quieren entrevistarte, AviTech coordina el
                contacto contigo.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Boton variante="secundario" onClick={reiniciar}>
                Crear otro perfil
              </Boton>
              <Boton onClick={() => document.getElementById('vacantes-abiertas')?.scrollIntoView({ behavior: 'smooth' })}>
                Ver vacantes <ArrowRight size={15} />
              </Boton>
            </div>
          </div>
        ) : (
          <>
            <header className="mb-5">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-arena-borde bg-arena px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-clay uppercase">
                <UserRound size={12} /> Para candidatos
              </p>
              <h2 className="text-[28px] leading-tight font-medium tracking-[-0.03em] text-tinta sm:text-[32px]">
                Crea tu perfil
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-tinta-suave">
                Solo lo esencial: tu nombre, correo, el puesto que buscas y tu CV. Lo demás es opcional y puedes
                completarlo después.
              </p>
            </header>

            <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  No completar
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(evento) => setWebsite(evento.target.value)}
                  />
                </label>
              </div>

              <Campo etiqueta="Nombre completo *">
                <Entrada
                  required
                  autoComplete="name"
                  maxLength={120}
                  value={formulario.nombre}
                  onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
                  placeholder="Ana Pérez"
                />
              </Campo>
              <Campo etiqueta="Correo *">
                <Entrada
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={160}
                  value={formulario.email}
                  onChange={(evento) => setFormulario({ ...formulario, email: evento.target.value })}
                  placeholder="ana@correo.com"
                />
              </Campo>
              <Campo etiqueta="Puesto que buscas *">
                <Entrada
                  required
                  maxLength={180}
                  value={formulario.puesto_objetivo}
                  onChange={(evento) => setFormulario({ ...formulario, puesto_objetivo: evento.target.value })}
                  placeholder="Ej. Contadora senior"
                />
              </Campo>
              <Campo etiqueta="Teléfono / WhatsApp">
                <Entrada
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  value={formulario.telefono}
                  onChange={(evento) => setFormulario({ ...formulario, telefono: evento.target.value })}
                  placeholder="809 555 0101"
                />
              </Campo>

              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.08em] text-tinta-suave uppercase">
                  Tu CV (PDF)
                </span>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-[20px] border border-dashed px-4 py-4 transition-colors ${
                    archivo ? 'border-accion bg-arena/60' : 'border-borde bg-superficie-2/50 hover:border-arena-borde hover:bg-arena/40'
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-superficie text-clay ring-1 ring-borde">
                    <Upload size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-tinta">
                      {archivo ? archivo.name : 'Subir CV en PDF'}
                    </span>
                    <span className="block text-[11px] text-tinta-tenue">
                      {archivo
                        ? `${(archivo.size / 1024 / 1024).toFixed(1)} MB · listo para enviar`
                        : 'Máximo 5 MB. Solo el personal de AviTech puede abrirlo.'}
                    </span>
                  </span>
                  {archivo && <Check size={16} className="shrink-0 text-exito" />}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(evento) => {
                      const seleccionado = evento.target.files?.[0] ?? null
                      if (seleccionado && seleccionado.type !== 'application/pdf') {
                        setError('El CV debe ser un archivo PDF.')
                        evento.currentTarget.value = ''
                        return
                      }
                      if (seleccionado && seleccionado.size > LIMITE_CV_BYTES) {
                        setError('El CV no puede superar 5 MB.')
                        evento.currentTarget.value = ''
                        return
                      }
                      setError(null)
                      setArchivo(seleccionado)
                    }}
                  />
                </label>
              </div>

              <Campo etiqueta="¿Te interesa una vacante?" className="sm:col-span-2">
                <Selector
                  value={formulario.vacante_id}
                  onChange={(evento) => setFormulario({ ...formulario, vacante_id: evento.target.value })}
                >
                  <option value="">Solo crear mi perfil</option>
                  {vacantes.map((vacante) => (
                    <option key={vacante.id} value={vacante.id}>
                      {vacante.titulo} · {vacante.empresa_nombre}
                    </option>
                  ))}
                </Selector>
                {vacanteSeleccionada && (
                  <span className="mt-1.5 block text-[11px] text-info">
                    Tu perfil se enviará como postulación a {vacanteSeleccionada.empresa_nombre}.
                  </span>
                )}
              </Campo>

              <details className="group rounded-[20px] border border-borde bg-superficie-2/35 p-4 sm:col-span-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-tinta">
                  Completar mi perfil (opcional)
                  <ChevronDown size={16} className="text-tinta-tenue transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Campo etiqueta="Ubicación">
                    <Entrada
                      maxLength={120}
                      value={formulario.ubicacion}
                      onChange={(evento) => setFormulario({ ...formulario, ubicacion: evento.target.value })}
                      placeholder="Santo Domingo, RD"
                    />
                  </Campo>
                  <Campo etiqueta="Seniority">
                    <Selector
                      value={formulario.seniority}
                      onChange={(evento) => setFormulario({ ...formulario, seniority: evento.target.value })}
                    >
                      {SENIORITIES.map((seniority) => (
                        <option key={seniority} value={seniority}>
                          {etiquetaSeniority[seniority]}
                        </option>
                      ))}
                    </Selector>
                  </Campo>
                  <Campo etiqueta="Modalidad preferida">
                    <Selector
                      value={formulario.modalidad}
                      onChange={(evento) => setFormulario({ ...formulario, modalidad: evento.target.value })}
                    >
                      {MODALIDADES_TALENTO.map((modalidad) => (
                        <option key={modalidad} value={modalidad}>
                          {etiquetaModalidad[modalidad]}
                        </option>
                      ))}
                    </Selector>
                  </Campo>
                  <Campo etiqueta="Disponibilidad">
                    <Selector
                      value={formulario.disponibilidad}
                      onChange={(evento) => setFormulario({ ...formulario, disponibilidad: evento.target.value })}
                    >
                      <option value="">Sin indicar</option>
                      {DISPONIBILIDADES.map((disponibilidad) => (
                        <option key={disponibilidad} value={disponibilidad}>
                          {etiquetaDisponibilidad[disponibilidad]}
                        </option>
                      ))}
                    </Selector>
                  </Campo>
                  <Campo etiqueta="Expectativa salarial (RD$)">
                    <Entrada
                      type="number"
                      min="0"
                      step="0.01"
                      value={formulario.expectativa_salarial}
                      onChange={(evento) => setFormulario({ ...formulario, expectativa_salarial: evento.target.value })}
                      placeholder="Opcional"
                    />
                  </Campo>
                  <Campo etiqueta="Enlace de tu CV">
                    <Entrada
                      inputMode="url"
                      maxLength={500}
                      value={formulario.cv_url}
                      onChange={(evento) => setFormulario({ ...formulario, cv_url: evento.target.value })}
                      placeholder="LinkedIn o Drive (opcional)"
                    />
                  </Campo>
                  <Campo etiqueta="Habilidades (separadas por coma)" className="sm:col-span-2">
                    <Entrada
                      maxLength={800}
                      value={formulario.habilidades}
                      onChange={(evento) => setFormulario({ ...formulario, habilidades: evento.target.value })}
                      placeholder="Excel avanzado, NIIF, Power BI, inglés"
                    />
                  </Campo>
                  <Campo etiqueta="Experiencia" className="sm:col-span-2">
                    <AreaTexto
                      maxLength={3000}
                      value={formulario.experiencia}
                      onChange={(evento) => setFormulario({ ...formulario, experiencia: evento.target.value })}
                      placeholder="Un resumen breve de tu experiencia y logros."
                    />
                  </Campo>
                  <Campo etiqueta="Educación" className="sm:col-span-2">
                    <AreaTexto
                      maxLength={1000}
                      value={formulario.educacion}
                      onChange={(evento) => setFormulario({ ...formulario, educacion: evento.target.value })}
                      placeholder="Títulos, certificaciones e instituciones."
                    />
                  </Campo>
                </div>
              </details>

              <div className="grid gap-2 sm:col-span-2">
                <label className="flex items-start gap-2.5 rounded-[18px] border border-arena-borde bg-arena/55 p-3 text-xs leading-relaxed text-tinta-suave">
                  <input
                    type="checkbox"
                    checked={consentimiento}
                    onChange={(evento) => setConsentimiento(evento.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-borde accent-acento"
                  />
                  Autorizo a AviTech Solutions Group a guardar y usar estos datos para gestionar mi perfil y mis
                  postulaciones. No se comparten con terceros sin mi consentimiento.
                </label>
                <label className="flex items-start gap-2.5 rounded-[18px] border border-borde bg-superficie-2/40 p-3 text-xs leading-relaxed text-tinta-suave">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(evento) => setVisible(evento.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-borde accent-acento"
                  />
                  Permito que empresas con vacantes vean mi perfil sin mis datos de contacto ni mi CV.
                </label>
              </div>

              {error && (
                <p role="alert" className="rounded-[18px] border border-peligro-borde bg-peligro-suave px-4 py-3 text-sm text-peligro sm:col-span-2">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-[11px] leading-relaxed text-tinta-tenue">
                  Sin costo para candidatos. Tu CV es privado y se comparte solo cuando autorizas una entrevista.
                </p>
                <Boton type="submit" disabled={enviando} className="shrink-0">
                  {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {enviando ? 'Creando perfil…' : formulario.vacante_id ? 'Crear perfil y postularme' : 'Crear mi perfil'}
                </Boton>
              </div>
            </form>
          </>
        )}
      </Tarjeta>

      <div className="space-y-4">
        <Tarjeta className="p-5">
          <div id="vacantes-abiertas" className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-tinta">
                <BriefcaseBusiness size={16} className="text-clay" /> Vacantes abiertas
              </p>
              <p className="text-xs text-tinta-suave">Postúlate con tu perfil en un clic.</p>
            </div>
            <Insignia color="emerald">{vacantes.length}</Insignia>
          </div>
          {cargandoVacantes ? (
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, indice) => (
                <div key={indice} className="h-20 animate-pulse rounded-[18px] bg-superficie-2" />
              ))}
            </div>
          ) : vacantes.length === 0 ? (
            <p className="mt-4 rounded-[18px] border border-borde bg-superficie-2/50 p-4 text-sm text-tinta-suave">
              Todavía no hay vacantes publicadas. Crea tu perfil igual: las empresas pueden encontrarte.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {vacantes.slice(0, 8).map((vacante) => (
                <TarjetaVacante key={vacante.id} vacante={vacante} onPostular={seleccionarVacante} />
              ))}
              {vacantes.length > 8 && (
                <p className="px-1 pt-1 text-[11px] text-tinta-tenue">
                  Mostrando las 8 más recientes de {vacantes.length} vacantes.
                </p>
              )}
            </div>
          )}
        </Tarjeta>

        <Tarjeta className="p-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-tinta">
            <LockKeyhole size={16} className="text-clay" /> Tu CV, bajo control
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-tinta-suave">
            <li>· El PDF se guarda en un almacenamiento privado, no en una página pública.</li>
            <li>· Las empresas ven tu perfil sin correo, teléfono ni archivo.</li>
            <li>· Solo el personal autorizado abre el CV para coordinar una entrevista.</li>
          </ul>
        </Tarjeta>
      </div>
    </div>
  )
}

function TarjetaVacante({
  vacante,
  onPostular,
}: {
  vacante: VacantePublica
  onPostular: (vacante: VacantePublica) => void
}) {
  return (
    <article className="rounded-[20px] border border-borde bg-superficie-2/40 p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-tinta">{vacante.titulo}</p>
          <p className="truncate text-xs text-tinta-suave">{vacante.empresa_nombre}</p>
        </div>
        <Boton variante="secundario" className="shrink-0 px-3 py-1.5 text-xs" onClick={() => onPostular(vacante)}>
          Postularme
        </Boton>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
        <Insignia color="blue">{etiquetaModalidad[vacante.modalidad] ?? vacante.modalidad}</Insignia>
        <Insignia color="slate">{etiquetaSeniority[vacante.seniority] ?? vacante.seniority}</Insignia>
        <Insignia color="slate">{etiquetaTipoContrato[vacante.tipo_contrato] ?? vacante.tipo_contrato}</Insignia>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-tinta-suave">{vacante.descripcion}</p>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-tinta-tenue">
        <span className="inline-flex items-center gap-1">
          <MapPin size={11} /> {vacante.ubicacion || 'Ubicación flexible'}
        </span>
        <span className="inline-flex items-center gap-1">
          <Wallet size={11} /> {rangoSalario(vacante.salario_min, vacante.salario_max)}
        </span>
        <span>· {formatoFecha(vacante.created_at)}</span>
      </p>
    </article>
  )
}

function PanelEmpresa({
  candidatos,
  cargandoCandidatos,
  onRefrescarVacantes,
}: {
  candidatos: CandidatoPublico[]
  cargandoCandidatos: boolean
  onRefrescarVacantes: () => void
}) {
  const [modoEmpresa, setModoEmpresa] = useState<ModoEmpresa>('explorar')
  const [busqueda, setBusqueda] = useState('')
  const [seniority, setSeniority] = useState('')
  const [modalidad, setModalidad] = useState('')
  const [shortlist, setShortlist] = useState<Set<string>>(new Set())
  const [modalSolicitud, setModalSolicitud] = useState<TipoSolicitud | null>(null)
  const [formulario, setFormulario] = useState<FormularioEmpresa>(FORMULARIO_EMPRESA_VACIO)
  const [mensaje, setMensaje] = useState('')
  const [website, setWebsite] = useState('')
  const [consentimiento, setConsentimiento] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<ExitoSolicitud | null>(null)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return candidatos.filter((candidato) => {
      if (seniority && candidato.seniority !== seniority) return false
      if (modalidad && candidato.modalidad !== modalidad) return false
      if (!texto) return true
      return [candidato.puesto_objetivo, candidato.ubicacion, ...(candidato.habilidades ?? [])].some((valor) =>
        valor?.toLowerCase().includes(texto),
      )
    })
  }, [candidatos, busqueda, seniority, modalidad])

  function alternarCandidato(id: string) {
    setShortlist((previo) => {
      const nuevo = new Set(previo)
      if (nuevo.has(id)) nuevo.delete(id)
      else nuevo.add(id)
      return nuevo
    })
  }

  function abrirSolicitud(tipo: TipoSolicitud) {
    if (shortlist.size === 0) return
    setModalSolicitud(tipo)
    setExito(null)
    setError(null)
  }

  function verCandidatos() {
    setModoEmpresa('explorar')
    window.setTimeout(
      () => document.getElementById('panel-empresa')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      40,
    )
  }

  function cerrarSolicitud() {
    setModalSolicitud(null)
    setExito(null)
    setError(null)
  }

  async function enviarSolicitud(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!modalSolicitud || enviando) return
    setError(null)
    if (!formulario.empresa_nombre.trim() || !formulario.contacto_nombre.trim() || !formulario.contacto_email.trim()) {
      setError('Completa el nombre de la empresa, el contacto y el correo.')
      return
    }
    if (!consentimiento) {
      setError('Marca la autorización para gestionar la solicitud.')
      return
    }
    setEnviando(true)
    try {
      const respuesta = await fetch('/api/talento/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formulario,
          candidato_ids: Array.from(shortlist),
          solicitud_tipo: modalSolicitud,
          mensaje,
          consentimiento: true,
          website,
        }),
      })
      const datos = (await respuesta.json().catch(() => null)) as RespuestaPublica | null
      if (!respuesta.ok || !datos?.ok) throw new Error(datos?.error || 'No se pudo enviar la solicitud.')
      setExito({
        tipo: modalSolicitud,
        cantidad: datos.solicitudes ?? 0,
        existentes: datos.existentes ?? 0,
        empresa: formulario.empresa_nombre,
      })
      setShortlist(new Set())
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo enviar la solicitud.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div id="panel-empresa">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-full border border-borde bg-superficie p-1">
          <button
            type="button"
            onClick={() => setModoEmpresa('explorar')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              modoEmpresa === 'explorar' ? 'bg-accion text-superficie' : 'text-tinta-suave hover:bg-superficie-2'
            }`}
          >
            Explorar candidatos
          </button>
          <button
            type="button"
            onClick={() => setModoEmpresa('publicar')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              modoEmpresa === 'publicar' ? 'bg-accion text-superficie' : 'text-tinta-suave hover:bg-superficie-2'
            }`}
          >
            Publicar vacante
          </button>
        </div>
        <p className="text-xs text-tinta-tenue">Perfiles anónimos. El contacto se coordina contigo.</p>
      </div>

      {modoEmpresa === 'publicar' ? (
        <FormularioVacantePublica onRefrescar={onRefrescarVacantes} onVerCandidatos={verCandidatos} />
      ) : (
        <>
          <Tarjeta className="p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
                <Entrada
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                  placeholder="Buscar por puesto, habilidad o ubicación…"
                  className="pl-9"
                />
              </div>
              <Selector value={seniority} onChange={(evento) => setSeniority(evento.target.value)} aria-label="Seniority">
                <option value="">Todos los niveles</option>
                {SENIORITIES.map((nivel) => (
                  <option key={nivel} value={nivel}>
                    {etiquetaSeniority[nivel]}
                  </option>
                ))}
              </Selector>
              <Selector value={modalidad} onChange={(evento) => setModalidad(evento.target.value)} aria-label="Modalidad">
                <option value="">Todas las modalidades</option>
                {MODALIDADES_TALENTO.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {etiquetaModalidad[opcion]}
                  </option>
                ))}
              </Selector>
            </div>
            <p aria-live="polite" className="mt-3 text-xs text-tinta-tenue">
              {filtrados.length} perfil{filtrados.length === 1 ? '' : 'es'} visible{filtrados.length === 1 ? '' : 's'}
              {shortlist.size > 0 ? ` · ${shortlist.size} en tu shortlist` : ''}
            </p>
          </Tarjeta>

          {cargandoCandidatos ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, indice) => (
                <div key={indice} className="h-56 animate-pulse rounded-[24px] bg-superficie-2" />
              ))}
            </div>
          ) : filtrados.length === 0 ? (
            <Tarjeta className="mt-4 p-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-arena text-clay">
                <Users size={22} />
              </span>
              <p className="mt-3 text-sm font-semibold text-tinta">Todavía no hay perfiles para mostrar</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-tinta-suave">
                Los candidatos aparecen aquí cuando crean su perfil y autorizan ser vistos por empresas. Vuelve pronto o
                publica una vacante para atraer talento.
              </p>
              <Boton variante="secundario" className="mt-4" onClick={() => setModoEmpresa('publicar')}>
                <Plus size={15} /> Publicar una vacante
              </Boton>
            </Tarjeta>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtrados.map((candidato) => (
                <TarjetaCandidato
                  key={candidato.id}
                  candidato={candidato}
                  seleccionado={shortlist.has(candidato.id)}
                  onAlternar={() => alternarCandidato(candidato.id)}
                />
              ))}
            </div>
          )}

          {shortlist.size > 0 && (
            <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-2xl rounded-[24px] border border-borde bg-superficie p-2.5 shadow-[0_24px_60px_-24px_rgba(20,20,19,0.55)] sm:inset-x-auto sm:left-1/2 sm:w-auto sm:-translate-x-1/2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex min-w-0 flex-1 items-center gap-2 px-2 text-xs font-medium text-tinta">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accion text-[11px] font-semibold text-superficie">
                    {shortlist.size}
                  </span>
                  <span className="truncate">candidato{shortlist.size === 1 ? '' : 's'} en tu shortlist</span>
                </span>
                <Boton variante="secundario" className="px-3 py-1.5 text-xs" onClick={() => setShortlist(new Set())}>
                  Limpiar
                </Boton>
                <Boton className="px-3 py-1.5 text-xs" onClick={() => abrirSolicitud('entrevista')}>
                  Solicitar entrevista
                </Boton>
                <Boton variante="secundario" className="px-3 py-1.5 text-xs" onClick={() => abrirSolicitud('contratacion')}>
                  Solicitar contratación
                </Boton>
              </div>
            </div>
          )}

          <Modal
            abierto={modalSolicitud !== null}
            titulo={modalSolicitud === 'contratacion' ? 'Solicitar contratación' : 'Solicitar entrevista'}
            onCerrar={cerrarSolicitud}
            ancho="sm:max-w-xl"
          >
            {exito ? (
              <div className="py-4 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-exito-suave text-exito ring-1 ring-exito-borde">
                  <CheckCircle2 size={26} />
                </span>
                <h3 className="mt-4 text-2xl font-medium tracking-[-0.02em] text-tinta">
                  Solicitud recibida
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-tinta-suave">
                  {exito.cantidad > 0
                    ? `Enviamos ${exito.cantidad} solicitud${exito.cantidad === 1 ? '' : 'es'} de ${exito.tipo} para ${exito.empresa}. El equipo de AviTech coordinará el contacto.`
                    : `Ya existían procesos activos para estos candidatos con ${exito.empresa}. El equipo revisará el caso.`}
                  {exito.existentes > 0 && exito.cantidad > 0
                    ? ` ${exito.existentes} candidato${exito.existentes === 1 ? '' : 's'} ya tenía${exito.existentes === 1 ? '' : 'n'} un proceso abierto.`
                    : ''}
                </p>
                <Boton className="mt-5" onClick={cerrarSolicitud}>
                  Entendido
                </Boton>
              </div>
            ) : (
              <form onSubmit={enviarSolicitud} className="grid gap-4 sm:grid-cols-2">
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label>
                    No completar
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(evento) => setWebsite(evento.target.value)}
                    />
                  </label>
                </div>
                <p className="rounded-[18px] border border-arena-borde bg-arena/50 p-3 text-xs leading-relaxed text-tinta-suave sm:col-span-2">
                  <strong className="text-tinta">{shortlist.size}</strong> candidato
                  {shortlist.size === 1 ? '' : 's'} seleccionado{shortlist.size === 1 ? '' : 's'}. Completa los datos de
                  tu empresa y AviTech coordina la {modalSolicitud === 'contratacion' ? 'contratación' : 'entrevista'}.
                </p>
                <Campo etiqueta="Empresa *">
                  <Entrada
                    required
                    maxLength={160}
                    value={formulario.empresa_nombre}
                    onChange={(evento) => setFormulario({ ...formulario, empresa_nombre: evento.target.value })}
                    placeholder="Grupo del Norte SRL"
                  />
                </Campo>
                <Campo etiqueta="Sector">
                  <Entrada
                    maxLength={120}
                    value={formulario.sector}
                    onChange={(evento) => setFormulario({ ...formulario, sector: evento.target.value })}
                    placeholder="Finanzas, salud, retail…"
                  />
                </Campo>
                <Campo etiqueta="Contacto *">
                  <Entrada
                    required
                    maxLength={120}
                    value={formulario.contacto_nombre}
                    onChange={(evento) => setFormulario({ ...formulario, contacto_nombre: evento.target.value })}
                    placeholder="Nombre y apellido"
                  />
                </Campo>
                <Campo etiqueta="Correo *">
                  <Entrada
                    required
                    type="email"
                    maxLength={160}
                    value={formulario.contacto_email}
                    onChange={(evento) => setFormulario({ ...formulario, contacto_email: evento.target.value })}
                    placeholder="rrhh@empresa.com"
                  />
                </Campo>
                <Campo etiqueta="Teléfono">
                  <Entrada
                    type="tel"
                    maxLength={40}
                    value={formulario.contacto_telefono}
                    onChange={(evento) => setFormulario({ ...formulario, contacto_telefono: evento.target.value })}
                    placeholder="809 555 0101"
                  />
                </Campo>
                <Campo etiqueta="Sitio web">
                  <Entrada
                    inputMode="url"
                    maxLength={300}
                    value={formulario.sitio_web}
                    onChange={(evento) => setFormulario({ ...formulario, sitio_web: evento.target.value })}
                    placeholder="https://tuempresa.com"
                  />
                </Campo>
                <Campo etiqueta="Mensaje para el equipo" className="sm:col-span-2">
                  <AreaTexto
                    maxLength={2000}
                    value={mensaje}
                    onChange={(evento) => setMensaje(evento.target.value)}
                    placeholder="Qué buscan, condiciones, fechas o cualquier detalle útil."
                  />
                </Campo>
                <label className="flex items-start gap-2.5 rounded-[18px] border border-arena-borde bg-arena/50 p-3 text-xs leading-relaxed text-tinta-suave sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={consentimiento}
                    onChange={(evento) => setConsentimiento(evento.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-borde accent-acento"
                  />
                  Autorizo a AviTech a usar estos datos para gestionar la solicitud y coordinar el contacto con los
                  candidatos.
                </label>
                {error && (
                  <p role="alert" className="rounded-[18px] border border-peligro-borde bg-peligro-suave px-4 py-3 text-sm text-peligro sm:col-span-2">
                    {error}
                  </p>
                )}
                <div className="flex justify-end gap-2 sm:col-span-2">
                  <Boton variante="secundario" type="button" onClick={cerrarSolicitud}>
                    Cancelar
                  </Boton>
                  <Boton type="submit" disabled={enviando}>
                    {enviando ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {enviando ? 'Enviando…' : 'Enviar solicitud'}
                  </Boton>
                </div>
              </form>
            )}
          </Modal>
        </>
      )}
    </div>
  )
}

function TarjetaCandidato({
  candidato,
  seleccionado,
  onAlternar,
}: {
  candidato: CandidatoPublico
  seleccionado: boolean
  onAlternar: () => void
}) {
  const inicial = candidato.nombre_publico
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('')
  return (
    <Tarjeta
      className={`flex h-full flex-col p-4 transition-colors ${
        seleccionado ? 'border-accion bg-arena/35' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-arena text-sm font-semibold text-clay">
          {inicial || '?'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-tinta">{candidato.nombre_publico}</p>
          <p className="truncate text-xs text-tinta-suave">{candidato.puesto_objetivo}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <Insignia color="blue">{etiquetaSeniority[candidato.seniority] ?? candidato.seniority}</Insignia>
            <Insignia color="slate">{etiquetaModalidad[candidato.modalidad] ?? candidato.modalidad}</Insignia>
          </div>
        </div>
        <button
          type="button"
          onClick={onAlternar}
          aria-pressed={seleccionado}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
            seleccionado
              ? 'border-accion bg-accion text-superficie'
              : 'border-tinta/20 text-tinta-suave hover:border-tinta/45 hover:bg-arena'
          }`}
          aria-label={seleccionado ? 'Quitar de la shortlist' : 'Añadir a la shortlist'}
          title={seleccionado ? 'Quitar de la shortlist' : 'Añadir a la shortlist'}
        >
          {seleccionado ? <Check size={15} /> : <Plus size={15} />}
        </button>
      </div>

      {candidato.experiencia && (
        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-tinta-suave">{candidato.experiencia}</p>
      )}

      {(candidato.habilidades ?? []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {(candidato.habilidades ?? []).slice(0, 5).map((habilidad) => (
            <Insignia key={habilidad} color="blue">
              {habilidad}
            </Insignia>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3 text-[11px] text-tinta-tenue">
        <div className="space-y-0.5">
          <p className="flex items-center gap-1">
            <MapPin size={11} /> {candidato.ubicacion || 'Ubicación flexible'}
          </p>
          <p className="flex items-center gap-1">
            <CalendarClock size={11} />{' '}
            {candidato.disponibilidad
              ? etiquetaDisponibilidad[candidato.disponibilidad] ?? candidato.disponibilidad
              : 'Disponibilidad por confirmar'}
          </p>
          <p className="flex items-center gap-1">
            <Wallet size={11} /> {rangoSalario(candidato.expectativa_salarial, null)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {candidato.cv_disponible && (
            <span className="inline-flex items-center gap-1 text-info">
              <FileText size={11} /> CV disponible
            </span>
          )}
          <Boton
            variante={seleccionado ? 'secundario' : 'primario'}
            className="px-3 py-1.5 text-xs"
            onClick={onAlternar}
          >
            {seleccionado ? 'Añadido' : 'Añadir'}
          </Boton>
        </div>
      </div>
    </Tarjeta>
  )
}

function FormularioVacantePublica({
  onRefrescar,
  onVerCandidatos,
}: {
  onRefrescar: () => void
  onVerCandidatos: () => void
}) {
  const [formulario, setFormulario] = useState<FormularioVacante>(FORMULARIO_VACANTE_VACIO)
  const [website, setWebsite] = useState('')
  const [consentimiento, setConsentimiento] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<ExitoVacante | null>(null)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return
    setError(null)
    if (!formulario.empresa_nombre.trim() || !formulario.contacto_nombre.trim() || !formulario.contacto_email.trim()) {
      setError('Completa el nombre de la empresa, el contacto y el correo.')
      return
    }
    if (formulario.descripcion.trim().length < 20) {
      setError('Describe la vacante con un poco más de detalle (al menos 20 caracteres).')
      return
    }
    const minimo = formulario.salario_min === '' ? null : Math.max(0, Number(formulario.salario_min) || 0)
    const maximo = formulario.salario_max === '' ? null : Math.max(0, Number(formulario.salario_max) || 0)
    if (minimo != null && maximo != null && minimo > maximo) {
      setError('El salario mínimo no puede ser mayor que el máximo.')
      return
    }
    if (!consentimiento) {
      setError('Marca la autorización para publicar la vacante.')
      return
    }

    setEnviando(true)
    try {
      const respuesta = await fetch('/api/talento/vacantes/publicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formulario,
          salario_min: minimo,
          salario_max: maximo,
          consentimiento: true,
          website,
        }),
      })
      const datos = (await respuesta.json().catch(() => null)) as RespuestaPublica | null
      if (!respuesta.ok || !datos?.ok) throw new Error(datos?.error || 'No se pudo enviar la vacante.')
      setExito({ titulo: formulario.titulo, empresa: formulario.empresa_nombre })
      onRefrescar()
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo enviar la vacante.')
    } finally {
      setEnviando(false)
    }
  }

  if (exito) {
    return (
      <Tarjeta className="p-6 text-center sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-exito-suave text-exito ring-1 ring-exito-borde">
          <CircleCheck size={30} />
        </span>
        <h2 className="mt-4 text-[28px] leading-tight font-medium tracking-[-0.03em] text-tinta">Vacante recibida</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-tinta-suave">
          Recibimos «{exito.titulo}» de {exito.empresa}. El equipo de AviTech la revisará y la publicará en el portal.
          Te contactaremos si necesitamos más detalles.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Boton
            variante="secundario"
            onClick={() => {
              setExito(null)
              setFormulario(FORMULARIO_VACANTE_VACIO)
              setConsentimiento(false)
            }}
          >
            Publicar otra vacante
          </Boton>
          <Boton onClick={onVerCandidatos}>Explorar candidatos</Boton>
        </div>
      </Tarjeta>
    )
  }

  return (
    <Tarjeta className="p-5 sm:p-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-arena-borde bg-arena px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-clay uppercase">
            <Building2 size={12} /> Para empresas
          </p>
          <h2 className="text-[28px] leading-tight font-medium tracking-[-0.03em] text-tinta sm:text-[32px]">
            Publica una vacante
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-tinta-suave">
            Completa lo esencial y revisaremos la publicación. Sin costo por publicar.
          </p>
        </div>
        <Insignia color="emerald">Revisión del equipo</Insignia>
      </header>

      <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            No completar
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(evento) => setWebsite(evento.target.value)}
            />
          </label>
        </div>

        <Campo etiqueta="Empresa *" className="sm:col-span-2">
          <Entrada
            required
            maxLength={160}
            value={formulario.empresa_nombre}
            onChange={(evento) => setFormulario({ ...formulario, empresa_nombre: evento.target.value })}
            placeholder="Grupo del Norte SRL"
          />
        </Campo>
        <Campo etiqueta="Sector">
          <Entrada
            maxLength={120}
            value={formulario.sector}
            onChange={(evento) => setFormulario({ ...formulario, sector: evento.target.value })}
            placeholder="Finanzas, salud, retail…"
          />
        </Campo>
        <Campo etiqueta="Sitio web">
          <Entrada
            inputMode="url"
            maxLength={300}
            value={formulario.sitio_web}
            onChange={(evento) => setFormulario({ ...formulario, sitio_web: evento.target.value })}
            placeholder="https://tuempresa.com"
          />
        </Campo>
        <Campo etiqueta="Ubicación de la empresa">
          <Entrada
            maxLength={160}
            value={formulario.ubicacion}
            onChange={(evento) => setFormulario({ ...formulario, ubicacion: evento.target.value })}
            placeholder="Santo Domingo, RD"
          />
        </Campo>
        <Campo etiqueta="Contacto *">
          <Entrada
            required
            maxLength={120}
            value={formulario.contacto_nombre}
            onChange={(evento) => setFormulario({ ...formulario, contacto_nombre: evento.target.value })}
            placeholder="Nombre y apellido"
          />
        </Campo>
        <Campo etiqueta="Correo del contacto *">
          <Entrada
            required
            type="email"
            maxLength={160}
            value={formulario.contacto_email}
            onChange={(evento) => setFormulario({ ...formulario, contacto_email: evento.target.value })}
            placeholder="rrhh@empresa.com"
          />
        </Campo>
        <Campo etiqueta="Teléfono del contacto">
          <Entrada
            type="tel"
            maxLength={40}
            value={formulario.contacto_telefono}
            onChange={(evento) => setFormulario({ ...formulario, contacto_telefono: evento.target.value })}
            placeholder="809 555 0101"
          />
        </Campo>

        <div className="sm:col-span-2">
          <p className="mb-2 mt-2 text-[10px] font-bold tracking-[0.14em] text-tinta-tenue uppercase">La vacante</p>
          <div className="h-px bg-borde-suave" />
        </div>
        <Campo etiqueta="Título del puesto *" className="sm:col-span-2">
          <Entrada
            required
            maxLength={180}
            value={formulario.titulo}
            onChange={(evento) => setFormulario({ ...formulario, titulo: evento.target.value })}
            placeholder="Ej. Analista contable senior"
          />
        </Campo>
        <Campo etiqueta="Descripción *" className="sm:col-span-2">
          <AreaTexto
            required
            minLength={20}
            maxLength={5000}
            value={formulario.descripcion}
            onChange={(evento) => setFormulario({ ...formulario, descripcion: evento.target.value })}
            placeholder="Qué hará la persona, contexto del equipo y objetivos del puesto…"
            className="min-h-28"
          />
        </Campo>
        <Campo etiqueta="Requisitos" className="sm:col-span-2">
          <AreaTexto
            maxLength={3000}
            value={formulario.requisitos}
            onChange={(evento) => setFormulario({ ...formulario, requisitos: evento.target.value })}
            placeholder="Formación, experiencia, herramientas, idiomas…"
          />
        </Campo>
        <Campo etiqueta="Ubicación del puesto">
          <Entrada
            maxLength={160}
            value={formulario.ubicacion_vacante}
            onChange={(evento) => setFormulario({ ...formulario, ubicacion_vacante: evento.target.value })}
            placeholder="Santo Domingo, RD"
          />
        </Campo>
        <Campo etiqueta="Modalidad">
          <Selector
            value={formulario.modalidad}
            onChange={(evento) => setFormulario({ ...formulario, modalidad: evento.target.value })}
          >
            {MODALIDADES_TALENTO.map((opcion) => (
              <option key={opcion} value={opcion}>
                {etiquetaModalidad[opcion]}
              </option>
            ))}
          </Selector>
        </Campo>
        <Campo etiqueta="Seniority">
          <Selector
            value={formulario.seniority}
            onChange={(evento) => setFormulario({ ...formulario, seniority: evento.target.value })}
          >
            {SENIORITIES.map((opcion) => (
              <option key={opcion} value={opcion}>
                {etiquetaSeniority[opcion]}
              </option>
            ))}
          </Selector>
        </Campo>
        <Campo etiqueta="Tipo de contrato">
          <Selector
            value={formulario.tipo_contrato}
            onChange={(evento) => setFormulario({ ...formulario, tipo_contrato: evento.target.value })}
          >
            {TIPOS_CONTRATO.map((opcion) => (
              <option key={opcion} value={opcion}>
                {etiquetaTipoContrato[opcion]}
              </option>
            ))}
          </Selector>
        </Campo>
        <Campo etiqueta="Salario mínimo (RD$)">
          <Entrada
            type="number"
            min="0"
            step="0.01"
            value={formulario.salario_min}
            onChange={(evento) => setFormulario({ ...formulario, salario_min: evento.target.value })}
            placeholder="Opcional"
          />
        </Campo>
        <Campo etiqueta="Salario máximo (RD$)">
          <Entrada
            type="number"
            min="0"
            step="0.01"
            value={formulario.salario_max}
            onChange={(evento) => setFormulario({ ...formulario, salario_max: evento.target.value })}
            placeholder="Opcional"
          />
        </Campo>

        <label className="flex items-start gap-2.5 rounded-[18px] border border-arena-borde bg-arena/50 p-3 text-xs leading-relaxed text-tinta-suave sm:col-span-2">
          <input
            type="checkbox"
            checked={consentimiento}
            onChange={(evento) => setConsentimiento(evento.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-borde accent-acento"
          />
          Autorizo a AviTech a publicar esta vacante y usar estos datos para gestionar las postulaciones.
        </label>

        {error && (
          <p role="alert" className="rounded-[18px] border border-peligro-borde bg-peligro-suave px-4 py-3 text-sm text-peligro sm:col-span-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-[11px] leading-relaxed text-tinta-tenue">
            La vacante se revisa antes de publicarse. No se cobra por publicar.
          </p>
          <Boton type="submit" disabled={enviando} className="shrink-0">
            {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {enviando ? 'Enviando…' : 'Enviar vacante'}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  )
}
