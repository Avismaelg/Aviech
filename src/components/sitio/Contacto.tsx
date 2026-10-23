import { AlertCircle, CircleCheck, Loader2, LockKeyhole, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { cx } from '../../lib/estilos'
import { CONTACTO, PLAZOS_CONTACTO, SERVICIOS, type IdServicio } from '../../lib/sitio'
import { BOTON_PRIMARIO, CONTENEDOR, ETIQUETA_OSCURA, TEXTO_OSCURO, TITULO_OSCURO } from './estilos'

interface FormularioContacto {
  nombre: string
  empresa: string
  email: string
  telefono: string
  servicio: IdServicio | ''
  descripcion: string
  plazo: string
  presupuesto: string
}

type ClaveError = 'nombre' | 'email' | 'servicio' | 'descripcion' | 'presupuesto' | 'consentimiento'
type Errores = Partial<Record<ClaveError, string>>

/**
 * Convierte montos escritos por una persona (40.000 / 40,000 / 1.500,50) a
 * número. Los presupuestos son orientativos, así que se redondean a centavos.
 */
function parsearPresupuesto(texto: string): number | null {
  const limpio = texto.trim().replace(/[^\d.,]/g, '')
  if (!limpio) return null
  const ultimaComa = limpio.lastIndexOf(',')
  const ultimoPunto = limpio.lastIndexOf('.')
  let normalizado = limpio

  if (ultimaComa >= 0 && ultimoPunto >= 0) {
    const decimal = ultimaComa > ultimoPunto ? ',' : '.'
    const miles = decimal === ',' ? '.' : ','
    normalizado = limpio.split(miles).join('').replace(decimal, '.')
  } else if (ultimaComa >= 0 || ultimoPunto >= 0) {
    const separador = ultimaComa >= 0 ? ',' : '.'
    const partes = limpio.split(separador)
    normalizado =
      partes.length > 2 || (partes[1] && partes[1].length === 3)
        ? partes.join('')
        : `${partes[0]}.${partes[1] ?? ''}`
  }

  const numero = Number(normalizado)
  if (!Number.isFinite(numero) || numero < 0 || numero > 999_999_999.99) return null
  return Math.round(numero * 100) / 100
}

const FORMULARIO_VACIO: FormularioContacto = {
  nombre: '',
  empresa: '',
  email: '',
  telefono: '',
  servicio: '',
  descripcion: '',
  plazo: '1_mes',
  presupuesto: '',
}

const CAMPO =
  'w-full rounded-xl border border-borde-azul bg-white px-4 py-3 text-sm text-grafito shadow-[inset_0_1px_2px_rgba(0,59,114,0.03)] transition-colors placeholder:text-acero/60 focus:border-electrico focus:ring-4 focus:ring-electrico/15 focus:outline-none aria-invalid:border-red-400 aria-invalid:ring-red-400/10'

const ETIQUETA_CAMPO = 'mb-1.5 block text-xs font-semibold text-marino'

const PASOS_CONTACTO = [
  'Nos cuentas el problema y el plazo que tienes.',
  'Revisamos el alcance y te contactamos para aclarar dudas.',
  'Recibes una propuesta con entregables, cronograma y precio.',
]

const MENSAJE_WHATSAPP = encodeURIComponent('Hola, quiero información sobre los servicios de AviTech Solutions Group.')

export function SeccionContacto({ solicitud }: { solicitud: { servicio: IdServicio } | null }) {
  const [formulario, setFormulario] = useState<FormularioContacto>(FORMULARIO_VACIO)
  const [consentimiento, setConsentimiento] = useState(false)
  const [website, setWebsite] = useState('')
  const [errores, setErrores] = useState<Errores>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState<{ folio: string } | null>(null)
  // Ajuste de estado durante el render (patrón recomendado por React) cuando
  // el visitante pulsa un servicio o un paquete en otra sección.
  const [solicitudAplicada, setSolicitudAplicada] = useState(solicitud)

  if (solicitud !== solicitudAplicada) {
    setSolicitudAplicada(solicitud)
    if (solicitud) {
      setFormulario((actual) => ({ ...actual, servicio: solicitud.servicio }))
      setErrores((actual) => ({ ...actual, servicio: undefined }))
      setErrorGeneral(null)
      setExito(null)
    }
  }

  function cambiar<K extends keyof FormularioContacto>(clave: K, valor: FormularioContacto[K]) {
    setFormulario((actual) => ({ ...actual, [clave]: valor }))
    setErrores((actual) => {
      if (!(clave in actual)) return actual
      const siguiente = { ...actual }
      delete siguiente[clave as ClaveError]
      return siguiente
    })
  }

  function validar(): Errores {
    const nuevos: Errores = {}
    if (formulario.nombre.trim().length < 2) nuevos.nombre = 'Escribe tu nombre.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formulario.email.trim())) {
      nuevos.email = 'Escribe un correo válido para contactarte.'
    }
    if (!formulario.servicio) nuevos.servicio = 'Elige el servicio que te interesa.'
    if (formulario.descripcion.trim().length < 20) {
      nuevos.descripcion = 'Cuéntanos un poco más: al menos 20 caracteres.'
    }
    if (formulario.presupuesto.trim()) {
      if (!/^\d[\d.,\s]*$/.test(formulario.presupuesto.trim())) {
        nuevos.presupuesto = 'Escribe solo números, por ejemplo 40000.'
      } else if (parsearPresupuesto(formulario.presupuesto) === null) {
        nuevos.presupuesto = 'El monto debe estar entre RD$0 y RD$999,999,999.99.'
      }
    }
    if (!consentimiento) nuevos.consentimiento = 'Marca la autorización para usar tus datos en esta solicitud.'
    return nuevos
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando) return
    setErrorGeneral(null)

    const nuevos = validar()
    setErrores(nuevos)
    const primeraClave = (Object.keys(nuevos) as ClaveError[])[0]
    if (primeraClave) {
      document.getElementById(`contacto-${primeraClave}`)?.focus()
      return
    }

    const servicio = SERVICIOS.find((item) => item.id === formulario.servicio)
    if (!servicio) return

    const plazo = PLAZOS_CONTACTO.find((item) => item.id === formulario.plazo) ?? PLAZOS_CONTACTO[1]
    const presupuestoNumero = parsearPresupuesto(formulario.presupuesto)
    const presupuestoTexto =
      presupuestoNumero !== null ? `RD$${presupuestoNumero.toLocaleString('es-DO')}` : 'por definir'
    const detalle = [
      formulario.descripcion.trim(),
      `Servicio de interés: ${servicio.nombre}.`,
      `Plazo estimado: ${plazo.etiqueta}.`,
      `Presupuesto orientativo: ${presupuestoTexto}.`,
    ].join('\n\n')
    const titulo = `${servicio.nombre} — ${formulario.empresa.trim() || formulario.nombre.trim()}`.slice(0, 180)
    const objetivos = [
      'Solicitud desde el sitio comercial de AviTech.',
      `Servicio: ${servicio.nombre}.`,
      `Plazo: ${plazo.etiqueta}.`,
      `Presupuesto orientativo: ${presupuestoTexto}.`,
    ].join('\n')

    setEnviando(true)
    try {
      const respuesta = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formulario.nombre.trim(),
          empresa: formulario.empresa.trim(),
          email: formulario.email.trim(),
          telefono: formulario.telefono.trim(),
          sitio_web: '',
          tipo: servicio.tipoInterno,
          titulo,
          descripcion: detalle,
          objetivos,
          presupuesto: presupuestoNumero,
          urgencia: plazo.urgencia,
          fecha_deseada: '',
          consentimiento: true,
          website,
        }),
      })
      const datos = (await respuesta.json().catch(() => null)) as
        | { ok?: boolean; folio?: string; error?: string }
        | null
      if (!respuesta.ok || !datos?.ok) {
        throw new Error(datos?.error || 'No pudimos enviar la solicitud. Revisa tu conexión e inténtalo otra vez.')
      }
      setExito({ folio: datos.folio || 'RECIBIDA' })
      setFormulario(FORMULARIO_VACIO)
      setConsentimiento(false)
      setWebsite('')
    } catch (fallo) {
      setErrorGeneral(
        fallo instanceof Error ? fallo.message : 'No pudimos enviar la solicitud. Inténtalo otra vez.',
      )
    } finally {
      setEnviando(false)
    }
  }

  function reiniciar() {
    setFormulario(FORMULARIO_VACIO)
    setConsentimiento(false)
    setErrores({})
    setErrorGeneral(null)
    setExito(null)
    setWebsite('')
  }

  return (
    <section id="contacto" className="border-t border-borde-azul/70 bg-niebla py-20 sm:py-28">
      <div
        className={cx(CONTENEDOR, 'revelar grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14')}
        data-revelar
      >
        <div className="fondo-oscuro relative isolate overflow-hidden rounded-3xl bg-marino-profundo p-7 text-white shadow-[0_30px_70px_-40px_rgba(0,38,74,0.8)] sm:p-9">
          <div aria-hidden className="cuadricula-oscura absolute inset-0 -z-10 opacity-60" />
          <p className={ETIQUETA_OSCURA}>Contacto</p>
          <h2 className={TITULO_OSCURO}>Cuéntanos qué necesita tu empresa.</h2>
          <p className={TEXTO_OSCURO}>
            Completa el formulario y el equipo revisará el caso para coordinar un diagnóstico inicial. Si
            falta algún dato, te lo pedimos antes de preparar la propuesta.
          </p>

          <ol className="mt-8 space-y-4">
            {PASOS_CONTACTO.map((paso, indice) => (
              <li key={paso} className="flex items-start gap-3 text-sm leading-relaxed text-white/75">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-electrico-claro ring-1 ring-white/15">
                  {indice + 1}
                </span>
                {paso}
              </li>
            ))}
          </ol>

          <div className="mt-8 space-y-3 text-sm">
            {CONTACTO.whatsapp && (
              <a
                href={`https://wa.me/${CONTACTO.whatsapp}?text=${MENSAJE_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 font-medium text-white transition-colors hover:text-electrico-claro"
              >
                <MessageCircle size={17} aria-hidden />
                WhatsApp
              </a>
            )}
            {CONTACTO.correo && (
              <a
                href={`mailto:${CONTACTO.correo}`}
                className="flex items-center gap-2.5 font-medium text-white transition-colors hover:text-electrico-claro"
              >
                <Mail size={17} aria-hidden />
                {CONTACTO.correo}
              </a>
            )}
            {CONTACTO.telefono && (
              <a
                href={`tel:${CONTACTO.telefono.replace(/\s/g, '')}`}
                className="flex items-center gap-2.5 font-medium text-white transition-colors hover:text-electrico-claro"
              >
                <Phone size={17} aria-hidden />
                {CONTACTO.telefono}
              </a>
            )}
            <p className="flex items-center gap-2.5 text-white/70">
              <MapPin size={17} className="text-electrico-claro" aria-hidden />
              {CONTACTO.ubicacion}
            </p>
          </div>

          <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-white/70">
            <LockKeyhole size={14} className="mt-0.5 shrink-0 text-verde" aria-hidden />
            Tus datos se usan solo para atender esta solicitud. No los publicamos ni los compartimos con
            terceros ajenos al servicio.
          </p>
        </div>

        <div className="rounded-2xl border border-borde-azul bg-white p-5 shadow-[0_30px_60px_-40px_rgba(0,59,114,0.35)] sm:p-7">
          {exito ? (
            <div role="status" className="flex flex-col items-start gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verde text-marino">
                <CircleCheck size={24} aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-marino">Recibimos tu solicitud</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-acero">
                  Folio <span className="font-semibold text-marino">{exito.folio}</span>. El equipo revisará el
                  caso y te contactará para coordinar el siguiente paso.
                </p>
              </div>
              <button
                type="button"
                onClick={reiniciar}
                className="mt-1 text-sm font-semibold text-marino underline decoration-electrico/40 underline-offset-4 transition-colors hover:text-electrico-texto"
              >
                Enviar otra solicitud
              </button>
            </div>
          ) : (
            <form onSubmit={enviar} noValidate className="relative">
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="contacto-website">No completar este campo</label>
                <input
                  id="contacto-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(evento) => setWebsite(evento.target.value)}
                />
              </div>

              {errorGeneral && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden />
                  {errorGeneral}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contacto-nombre" className={ETIQUETA_CAMPO}>
                    Nombre <span className="text-electrico">*</span>
                  </label>
                  <input
                    id="contacto-nombre"
                    name="nombre"
                    type="text"
                    autoComplete="name"
                    required
                    value={formulario.nombre}
                    onChange={(evento) => cambiar('nombre', evento.target.value)}
                    aria-invalid={errores.nombre ? true : undefined}
                    aria-describedby={errores.nombre ? 'error-nombre' : undefined}
                    className={CAMPO}
                    placeholder="Tu nombre"
                  />
                  {errores.nombre && (
                    <p id="error-nombre" className="mt-1 text-xs text-red-600">
                      {errores.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contacto-empresa" className={ETIQUETA_CAMPO}>
                    Empresa <span className="font-normal text-acero">(opcional)</span>
                  </label>
                  <input
                    id="contacto-empresa"
                    name="empresa"
                    type="text"
                    autoComplete="organization"
                    value={formulario.empresa}
                    onChange={(evento) => cambiar('empresa', evento.target.value)}
                    className={CAMPO}
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div>
                  <label htmlFor="contacto-email" className={ETIQUETA_CAMPO}>
                    Correo <span className="text-electrico">*</span>
                  </label>
                  <input
                    id="contacto-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formulario.email}
                    onChange={(evento) => cambiar('email', evento.target.value)}
                    aria-invalid={errores.email ? true : undefined}
                    aria-describedby={errores.email ? 'error-email' : undefined}
                    className={CAMPO}
                    placeholder="tu@empresa.com"
                  />
                  {errores.email && (
                    <p id="error-email" className="mt-1 text-xs text-red-600">
                      {errores.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contacto-telefono" className={ETIQUETA_CAMPO}>
                    Teléfono <span className="font-normal text-acero">(opcional)</span>
                  </label>
                  <input
                    id="contacto-telefono"
                    name="telefono"
                    type="tel"
                    autoComplete="tel"
                    value={formulario.telefono}
                    onChange={(evento) => cambiar('telefono', evento.target.value)}
                    className={CAMPO}
                    placeholder="809 000 0000"
                  />
                </div>

                <div>
                  <label htmlFor="contacto-servicio" className={ETIQUETA_CAMPO}>
                    Servicio de interés <span className="text-electrico">*</span>
                  </label>
                  <select
                    id="contacto-servicio"
                    name="servicio"
                    required
                    value={formulario.servicio}
                    onChange={(evento) => cambiar('servicio', evento.target.value as IdServicio | '')}
                    aria-invalid={errores.servicio ? true : undefined}
                    aria-describedby={errores.servicio ? 'error-servicio' : undefined}
                    className={CAMPO}
                  >
                    <option value="">Selecciona un servicio</option>
                    {SERVICIOS.map((servicio) => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre}
                      </option>
                    ))}
                  </select>
                  {errores.servicio && (
                    <p id="error-servicio" className="mt-1 text-xs text-red-600">
                      {errores.servicio}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contacto-plazo" className={ETIQUETA_CAMPO}>
                    Plazo estimado
                  </label>
                  <select
                    id="contacto-plazo"
                    name="plazo"
                    value={formulario.plazo}
                    onChange={(evento) => cambiar('plazo', evento.target.value)}
                    className={CAMPO}
                  >
                    {PLAZOS_CONTACTO.map((plazo) => (
                      <option key={plazo.id} value={plazo.id}>
                        {plazo.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="contacto-presupuesto" className={ETIQUETA_CAMPO}>
                    Presupuesto orientativo <span className="font-normal text-acero">(opcional, RD$)</span>
                  </label>
                  <input
                    id="contacto-presupuesto"
                    name="presupuesto"
                    type="text"
                    inputMode="numeric"
                    maxLength={15}
                    value={formulario.presupuesto}
                    onChange={(evento) => cambiar('presupuesto', evento.target.value)}
                    aria-invalid={errores.presupuesto ? true : undefined}
                    aria-describedby={errores.presupuesto ? 'error-presupuesto' : undefined}
                    className={CAMPO}
                    placeholder="Ej. 40000"
                  />
                  {errores.presupuesto && (
                    <p id="error-presupuesto" className="mt-1 text-xs text-red-600">
                      {errores.presupuesto}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="contacto-descripcion" className={ETIQUETA_CAMPO}>
                    Cuéntanos el problema <span className="text-electrico">*</span>
                  </label>
                  <textarea
                    id="contacto-descripcion"
                    name="descripcion"
                    required
                    rows={5}
                    value={formulario.descripcion}
                    onChange={(evento) => cambiar('descripcion', evento.target.value)}
                    aria-invalid={errores.descripcion ? true : undefined}
                    aria-describedby={errores.descripcion ? 'error-descripcion' : undefined}
                    className={cx(CAMPO, 'min-h-28 resize-y')}
                    placeholder="Qué proceso quieres mejorar, qué herramientas usas hoy y qué resultado esperas."
                  />
                  {errores.descripcion && (
                    <p id="error-descripcion" className="mt-1 text-xs text-red-600">
                      {errores.descripcion}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <label className="flex items-start gap-2.5 text-xs leading-relaxed text-acero">
                  <input
                    id="contacto-consentimiento"
                    name="consentimiento"
                    type="checkbox"
                    checked={consentimiento}
                    onChange={(evento) => {
                      setConsentimiento(evento.target.checked)
                      setErrores((actual) => ({ ...actual, consentimiento: undefined }))
                    }}
                    aria-invalid={errores.consentimiento ? true : undefined}
                    aria-describedby={errores.consentimiento ? 'error-consentimiento' : undefined}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-electrico"
                  />
                  <span>
                    Autorizo a AviTech a usar mis datos para responder a esta solicitud y preparar una
                    propuesta. <span className="text-electrico">*</span>
                  </span>
                </label>
                {errores.consentimiento && (
                  <p id="error-consentimiento" className="mt-1 text-xs text-red-600">
                    {errores.consentimiento}
                  </p>
                )}
              </div>

              <details className="mt-4 rounded-xl border border-borde-azul bg-niebla/60 px-4 py-3 text-xs text-acero">
                <summary className="cursor-pointer font-semibold text-marino">Cómo usamos tus datos</summary>
                <p className="mt-2 leading-relaxed">
                  Usamos tu nombre, empresa, correo, teléfono y la descripción del problema solo para responder
                  a esta solicitud y preparar una propuesta. La solicitud puede procesarse con asistencia de IA
                  para un diagnóstico inicial; la revisión final la hace el equipo. No publicamos tus datos ni
                  los compartimos con terceros ajenos al servicio. Puedes pedir su corrección o eliminación
                  escribiendo al equipo.{' '}
                  <a
                    href="/privacidad"
                    className="font-semibold text-marino underline decoration-electrico/40 underline-offset-4 hover:text-electrico-texto"
                  >
                    Leer la política completa
                  </a>
                  .
                </p>
              </details>

              <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={enviando}
                  className={cx(BOTON_PRIMARIO, 'w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto')}
                >
                  {enviando ? (
                    <Loader2 size={18} className="animate-spin" aria-hidden />
                  ) : (
                    <Send size={18} aria-hidden />
                  )}
                  {enviando ? 'Enviando…' : 'Enviar solicitud'}
                </button>
                <p className="text-[11px] leading-relaxed text-acero">
                  Respuesta del equipo, sin envíos automáticos.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
