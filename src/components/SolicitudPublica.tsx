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
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-52 left-1/2 h-[36rem] w-[54rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[130px]"
      />

      <div className="animar-entrada relative mx-auto grid w-full max-w-6xl items-start gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-stretch lg:gap-8">
        <aside className="relative hidden overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#071228] via-[#0c2148] to-[#123e8c] p-9 text-white shadow-2xl shadow-blue-950/25 lg:flex lg:flex-col">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full border border-white/10"
          />
          <span
            aria-hidden
            className="font-display pointer-events-none absolute -right-8 -bottom-20 text-[16rem] leading-none font-bold text-white/[0.04] select-none"
          >
            A
          </span>
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-xl font-bold text-white shadow-md shadow-blue-950/30 ring-1 ring-white/15">
              A
            </span>
            <div>
              <p className="font-display text-lg font-semibold">AviTech Solutions Group</p>
              <p className="text-xs text-slate-400">Auditoría · Contabilidad · Software · Asesoría legal</p>
            </div>
          </div>

          <div className="relative mt-14">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-sky-200 ring-1 ring-white/10">
              <Sparkles size={12} /> Solicitud con IA
            </p>
            <p className="font-display text-[34px] leading-[1.15] font-semibold tracking-tight text-white">
              Cuéntanos qué necesitas. Nosotros preparamos el resto.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Completa el formulario y nuestro equipo recibirá un diagnóstico inicial, un plan de trabajo y una
              propuesta. Sin compromiso.
            </p>
            <ol className="mt-8 space-y-4 text-sm text-slate-200">
              {PASOS.map((paso, indice) => (
                <li key={paso} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-sky-200 ring-1 ring-white/10">
                    {indice + 1}
                  </span>
                  {paso}
                </li>
              ))}
            </ol>
          </div>

          <div className="relative mt-auto flex items-center gap-2 pt-10 text-[11px] text-slate-400">
            <LockKeyhole size={13} /> Tus datos se usan solo para atender esta solicitud.
          </div>
        </aside>

        <div className="w-full">
          <div className="mb-4 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-sm shadow-blue-600/25">
              A
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold text-tinta">AviTech Solutions Group</p>
              <p className="text-[11px] text-tinta-tenue">Solicitud de servicio</p>
            </div>
          </div>

          <Tarjeta className="p-6 sm:p-8">
            {exito ? (
              <div className="py-6 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <CircleCheck size={28} />
                </span>
                <p className="mt-5 text-[11px] font-semibold tracking-[0.16em] text-emerald-700 uppercase">
                  Solicitud recibida
                </p>
                <h2 className="mt-1 text-[27px] leading-tight font-semibold tracking-tight text-tinta">
                  Gracias, {formulario.nombre.split(' ')[0] || 'equipo'}.
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-tinta-suave">{exito.mensaje}</p>
                <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-borde bg-superficie-2 px-4 py-2 text-sm font-semibold text-tinta">
                  <span className="text-xs font-normal text-tinta-tenue">Folio</span>
                  <span className="tracking-wider">{exito.folio}</span>
                </div>
                <div className="mx-auto mt-6 max-w-md rounded-xl border border-blue-100 bg-blue-50 p-4 text-left text-sm text-blue-900">
                  <p className="flex items-center gap-2 font-semibold">
                    <Clock3 size={16} /> ¿Qué sigue?
                  </p>
                  <p className="mt-1 text-blue-900/80">
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
                  className="mt-6 text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              <>
                <header className="mb-6">
                  <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
                    <Sparkles size={12} /> Respuesta con IA
                  </p>
                  <h1 className="text-[27px] leading-tight font-semibold tracking-tight text-tinta sm:text-[30px]">
                    Solicita un servicio
                  </h1>
                  <p className="mt-1.5 text-sm text-tinta-suave">
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
                      placeholder="https://tuempresa.com (opcional; necesario para Auditoría SEO)"
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

                  <label className="flex items-start gap-2.5 rounded-xl border border-borde bg-superficie-2/60 p-3.5 text-xs leading-relaxed text-tinta-suave sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={consentimiento}
                      onChange={(evento) => setConsentimiento(evento.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-borde text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      Autorizo a AviTech Solutions Group a usar estos datos para analizar y responder a mi solicitud.
                      No se comparten con terceros.
                    </span>
                  </label>

                  {error && (
                    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 sm:col-span-2">
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] text-tinta-tenue">
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
            <a href="/" className="font-semibold text-blue-700 hover:text-blue-800">
              Entrar al panel
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
