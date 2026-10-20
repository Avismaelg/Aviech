import { CircleCheck, Clock3, Loader2, LockKeyhole, Send, Sparkles } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import {
  TIPOS_SERVICIO,
  URGENCIAS_SOLICITUD,
  etiquetaTipoServicio,
  etiquetaUrgenciaSolicitud,
} from '../lib/etiquetas'
import { AreaTexto, Boton, Campo, Entrada, Selector, Tarjeta } from './ui'

interface FormularioPublico {
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
}

const FORMULARIO_VACIO: FormularioPublico = {
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
}

const PASOS = [
  'Cuéntanos qué necesita tu empresa.',
  'La IA prepara el diagnóstico, el plan y la propuesta.',
  'El equipo revisa y te contacta para coordinar.',
]

export function SolicitudPublica() {
  const [formulario, setFormulario] = useState<FormularioPublico>(FORMULARIO_VACIO)
  const [website, setWebsite] = useState('')
  const [consentimiento, setConsentimiento] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<{ folio: string; mensaje: string } | null>(null)

  useEffect(() => {
    document.title = 'Solicita un servicio · AviTech Solutions Group'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => {
      meta.remove()
    }
  }, [])

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return
    setError(null)

    if (formulario.descripcion.trim().length < 20) {
      setError('Describe el servicio con un poco más de detalle (al menos 20 caracteres).')
      return
    }
    if (!formulario.email.trim() && !formulario.telefono.trim()) {
      setError('Deja un correo o un teléfono para que podamos contactarte.')
      return
    }
    if (!consentimiento) {
      setError('Marca la autorización para usar tus datos en esta solicitud.')
      return
    }

    setEnviando(true)
    try {
      const respuesta = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formulario,
          website,
          consentimiento,
        }),
      })
      const datos = (await respuesta.json().catch(() => null)) as
        | { ok?: boolean; folio?: string; mensaje?: string; error?: string }
        | null
      if (!respuesta.ok || !datos?.ok) {
        throw new Error(datos?.error || 'No se pudo enviar la solicitud. Inténtalo de nuevo.')
      }
      setExito({
        folio: datos.folio || 'RECIBIDA',
        mensaje: datos.mensaje || 'Recibimos tu solicitud.',
      })
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo enviar la solicitud. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:flex lg:items-center lg:px-8">
      <div className="animar-entrada mx-auto grid w-full max-w-6xl items-start gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch lg:gap-6">
        <aside className="relative hidden min-h-[720px] overflow-hidden rounded-[40px] bg-tinta p-9 text-superficie shadow-[0_40px_90px_-48px_rgba(20,20,19,0.6)] lg:flex lg:flex-col">
          <svg
            aria-hidden
            viewBox="0 0 520 520"
            className="pointer-events-none absolute -top-40 -right-36 h-[560px] w-[560px] text-acento-claro"
            fill="none"
          >
            <circle cx="260" cy="260" r="216" stroke="currentColor" strokeOpacity="0.16" />
            <circle cx="260" cy="260" r="150" stroke="currentColor" strokeOpacity="0.1" />
            <path d="M54 286C136 138 338 98 486 212" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5" />
            <circle cx="486" cy="212" r="6" fill="currentColor" />
          </svg>
          <span
            aria-hidden
            className="font-display pointer-events-none absolute -right-8 -bottom-24 text-[19rem] leading-none font-semibold text-superficie/[0.035] select-none"
          >
            A
          </span>

          <div className="relative flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-superficie text-lg font-semibold text-tinta">
              A
              <span aria-hidden className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-tinta bg-acento-claro" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold tracking-[-0.02em]">AviTech Solutions Group</p>
              <p className="text-[10px] tracking-[0.08em] text-superficie/55 uppercase">
                Auditoría · Contabilidad · Software · Asesoría legal
              </p>
            </div>
          </div>

          <div className="relative my-auto py-12">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-superficie/15 bg-superficie/10 px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-acento-claro uppercase">
              <Sparkles size={12} /> Solicitud con IA
            </p>
            <h1 className="max-w-md text-[40px] leading-[1.03] font-medium tracking-[-0.035em] text-superficie xl:text-[46px]">
              Cuéntanos qué necesitas. Nosotros preparamos el resto.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-superficie/65">
              Completa el formulario y nuestro equipo recibirá un diagnóstico inicial, un plan de trabajo y una
              propuesta. Sin compromiso.
            </p>
            <ol className="mt-9 space-y-4 text-sm text-superficie/80">
              {PASOS.map((paso, indice) => (
                <li key={paso} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-superficie/10 text-[11px] font-semibold text-acento-claro ring-1 ring-superficie/10">
                    {indice + 1}
                  </span>
                  {paso}
                </li>
              ))}
            </ol>
          </div>

          <div className="relative flex items-center gap-2 border-t border-superficie/10 pt-5 text-[10px] text-superficie/50">
            <LockKeyhole size={13} /> Tus datos se usan solo para atender esta solicitud.
          </div>
        </aside>

        <div className="w-full">
          <div className="mb-4 flex items-center gap-3 px-1 lg:hidden">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accion text-sm font-semibold text-superficie">
              A
              <span aria-hidden className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-superficie bg-acento" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold tracking-tight text-tinta">AviTech Solutions Group</p>
              <p className="text-[10px] tracking-[0.08em] text-tinta-tenue uppercase">Solicitud de servicio</p>
            </div>
          </div>

          <Tarjeta className="rounded-[40px] p-6 shadow-[0_40px_90px_-50px_rgba(20,20,19,0.4)] sm:p-8">
            {exito ? (
              <div className="py-6 text-center sm:py-10">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-exito-suave text-exito ring-1 ring-exito-borde">
                  <CircleCheck size={30} />
                </span>
                <p className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.18em] text-exito uppercase">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-exito" /> Solicitud recibida
                </p>
                <h2 className="mt-2 text-[32px] leading-tight font-medium tracking-[-0.03em] text-tinta">
                  Gracias, {formulario.nombre.split(' ')[0] || 'equipo'}.
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-tinta-suave">{exito.mensaje}</p>
                <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-arena-borde bg-arena px-4 py-2 text-sm font-semibold text-clay">
                  <span className="text-[10px] font-normal tracking-[0.08em] text-clay/70 uppercase">Folio</span>
                  <span className="tracking-[0.12em]">{exito.folio}</span>
                </div>
                <div className="mx-auto mt-6 max-w-md rounded-[24px] border border-info-borde bg-info-suave p-4 text-left text-sm text-info">
                  <p className="flex items-center gap-2 font-semibold">
                    <Clock3 size={16} /> ¿Qué sigue?
                  </p>
                  <p className="mt-1 text-info/80">
                    La IA ya está preparando el análisis. Un especialista revisará el resultado y te contactará por
                    correo o teléfono.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormulario(FORMULARIO_VACIO)
                    setConsentimiento(false)
                    setExito(null)
                  }}
                  className="mt-6 text-sm font-semibold text-clay transition-colors hover:text-acento"
                >
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              <>
                <header className="mb-6">
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-arena-borde bg-arena px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-clay uppercase">
                    <Sparkles size={12} /> Respuesta con IA
                  </p>
                  <h1 className="text-[30px] leading-tight font-medium tracking-[-0.03em] text-tinta sm:text-[34px]">
                    Solicita un servicio
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-tinta-suave">
                    Cuéntanos la situación de tu empresa. Mientras más detalle, mejor será el diagnóstico inicial.
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
                  <Campo etiqueta="Empresa">
                    <Entrada
                      autoComplete="organization"
                      maxLength={160}
                      value={formulario.empresa}
                      onChange={(evento) => setFormulario({ ...formulario, empresa: evento.target.value })}
                      placeholder="Grupo del Norte"
                    />
                  </Campo>
                  <Campo etiqueta="Correo">
                    <Entrada
                      type="email"
                      autoComplete="email"
                      maxLength={160}
                      value={formulario.email}
                      onChange={(evento) => setFormulario({ ...formulario, email: evento.target.value })}
                      placeholder="ana@empresa.com"
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
                  <Campo etiqueta="Sitio web" className="sm:col-span-2">
                    <Entrada
                      inputMode="url"
                      maxLength={300}
                      value={formulario.sitio_web}
                      onChange={(evento) => setFormulario({ ...formulario, sitio_web: evento.target.value })}
                      placeholder="https://tuempresa.com"
                    />
                    <span className="mt-1.5 block text-[11px] text-tinta-tenue">
                      Opcional. Necesario para una Auditoría SEO.
                    </span>
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
                  <Campo etiqueta="¿Qué necesitas? *" className="sm:col-span-2">
                    <Entrada
                      required
                      maxLength={180}
                      value={formulario.titulo}
                      onChange={(evento) => setFormulario({ ...formulario, titulo: evento.target.value })}
                      placeholder="Ej. Auditoría SEO y plan de contenidos"
                    />
                  </Campo>
                  <Campo etiqueta="Describe la situación *" className="sm:col-span-2">
                    <AreaTexto
                      required
                      minLength={20}
                      maxLength={4000}
                      value={formulario.descripcion}
                      onChange={(evento) => setFormulario({ ...formulario, descripcion: evento.target.value })}
                      placeholder="Qué está pasando, qué has intentado y qué resultado esperas."
                      className="min-h-32"
                    />
                  </Campo>
                  <Campo etiqueta="Objetivos o datos adicionales" className="sm:col-span-2">
                    <AreaTexto
                      maxLength={2000}
                      value={formulario.objetivos}
                      onChange={(evento) => setFormulario({ ...formulario, objetivos: evento.target.value })}
                      placeholder="Fechas, documentos disponibles, alcance esperado, restricciones…"
                    />
                  </Campo>

                  <label className="flex items-start gap-2.5 rounded-[20px] border border-arena-borde bg-arena/55 p-4 text-xs leading-relaxed text-tinta-suave sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={consentimiento}
                      onChange={(evento) => setConsentimiento(evento.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-borde accent-acento focus:ring-acento"
                    />
                    <span>
                      Autorizo a AviTech Solutions Group a usar estos datos para analizar y responder a mi solicitud.
                      No se comparten con terceros.
                    </span>
                  </label>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-[20px] border border-peligro-borde bg-peligro-suave px-4 py-3 text-sm text-peligro sm:col-span-2"
                    >
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-md text-[11px] leading-relaxed text-tinta-tenue">
                      Recibirás respuesta del equipo. La IA prepara el análisis, no envía correos automáticos.
                    </p>
                    <Boton type="submit" disabled={enviando} className="shrink-0">
                      {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {enviando ? 'Enviando…' : 'Enviar solicitud'}
                    </Boton>
                  </div>
                </form>
              </>
            )}
          </Tarjeta>

          <p className="mt-4 text-center text-xs text-tinta-tenue">
            ¿Eres del equipo?{' '}
            <a href="/" className="font-semibold text-clay transition-colors hover:text-acento">
              Entrar al panel
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
