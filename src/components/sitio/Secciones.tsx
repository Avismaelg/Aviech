import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  Code2,
  Compass,
  Globe2,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  Workflow,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cx } from '../../lib/estilos'
import {
  DEMOS,
  GARANTIAS,
  NECESIDADES,
  PAQUETES,
  PREGUNTAS,
  PROCESO,
  ROLES,
  SERVICIOS,
  type DemoSitio,
  type GarantiaSitio,
  type IdServicio,
  type RolEquipo,
  type ServicioSitio,
} from '../../lib/sitio'
import { CONTENEDOR, ETIQUETA, TARJETA, TEXTO_SECCION, TITULO_SECCION } from './estilos'
import { useProgresoScroll, useTilt } from './useInteraccion'

const ICONOS_SERVICIO: Record<ServicioSitio['icono'], LucideIcon> = {
  globo: Globe2,
  panel: LayoutDashboard,
  flujo: Workflow,
  soporte: LifeBuoy,
}

const ICONOS_ROL: Record<RolEquipo['icono'], LucideIcon> = {
  coordinacion: Compass,
  software: Code2,
  desarrollo: Smartphone,
  diseno: Megaphone,
}

const ICONOS_GARANTIA: Record<GarantiaSitio['icono'], LucideIcon> = {
  escudo: ShieldCheck,
  consentimiento: ClipboardCheck,
  dinero: Wallet,
  flujo: Workflow,
}

export function MarcaSitio({ claro = false }: { claro?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={cx(
          'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold',
          claro ? 'bg-white text-marino' : 'bg-marino text-white',
        )}
      >
        A
        <span
          aria-hidden
          className={cx(
            'absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 bg-verde',
            claro ? 'border-marino-profundo' : 'border-marino',
          )}
        />
      </span>
      <span className="leading-tight whitespace-nowrap">
        <span className={cx('block text-sm font-semibold tracking-tight', claro ? 'text-white' : 'text-marino')}>
          AviTech
        </span>
        <span
          className={cx(
            'block text-[10px] font-medium tracking-[0.14em] uppercase',
            claro ? 'text-white/60' : 'text-acero',
          )}
        >
          Solutions Group
        </span>
      </span>
    </span>
  )
}

/** Franja de garantías concretas, justo bajo la portada. */
export function TiraValor() {
  return (
    <section aria-label="Garantías de AviTech" className="fondo-oscuro border-b border-white/10 bg-marino-profundo">
      <div className={cx(CONTENEDOR, 'revelar grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4')} data-revelar>
        {GARANTIAS.map(({ icono, titulo, descripcion }) => {
          const Icono = ICONOS_GARANTIA[icono]
          return (
            <div key={titulo} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-electrico-claro ring-1 ring-white/10">
                <Icono size={19} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{titulo}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/65">{descripcion}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TarjetaServicio({
  servicio,
  onServicio,
}: {
  servicio: ServicioSitio
  onServicio: (servicio: IdServicio) => void
}) {
  const ref = useTilt()
  const Icono = ICONOS_SERVICIO[servicio.icono]

  return (
    <article
      ref={ref}
      className={cx(TARJETA, 'tarjeta-3d tarjeta-servicio group relative flex h-full flex-col overflow-hidden p-6')}
    >
      <span aria-hidden className="tarjeta-brillo" />

      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-electrico-suave text-electrico">
          <Icono size={22} aria-hidden />
        </span>
        <span className="text-xs font-bold tracking-[0.12em] text-acero/50">{servicio.numero}</span>
      </div>

      <h3 className="mt-5 text-lg leading-snug font-semibold text-marino">{servicio.nombre}</h3>
      <p className="mt-1.5 text-sm font-medium text-electrico-texto">{servicio.problema}</p>
      <p className="mt-3 text-sm leading-relaxed text-acero">{servicio.descripcion}</p>

      <ul className="mt-4 space-y-1.5">
        {servicio.entregables.map((entregable) => (
          <li key={entregable} className="flex items-start gap-2 text-sm text-grafito/85">
            <Check size={15} className="mt-0.5 shrink-0 text-verde" aria-hidden />
            {entregable}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-acero">
        <span className="font-semibold text-grafito">Para quién:</span> {servicio.publico}
      </p>

      <p className="detalle-tarjeta mt-3 text-xs leading-relaxed text-electrico-texto">
        Te ayudamos a definir el alcance en una llamada de 20 minutos.
      </p>

      <button
        type="button"
        onClick={() => onServicio(servicio.id)}
        className="mt-auto inline-flex items-center gap-1.5 self-start pt-4 text-sm font-semibold text-marino transition-colors hover:text-electrico-texto"
      >
        Consultar este servicio
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
      </button>
    </article>
  )
}

export function Servicios({ onServicio }: { onServicio: (servicio: IdServicio) => void }) {
  return (
    <section id="soluciones" className="bg-white py-20 sm:py-28">
      <div className={cx(CONTENEDOR, 'revelar')} data-revelar>
        <p className={ETIQUETA}>Soluciones</p>
        <h2 className={TITULO_SECCION}>Cuatro formas de ordenar y hacer crecer tu operación.</h2>
        <p className={TEXTO_SECCION}>
          Cada servicio se adapta al tamaño y al momento de tu empresa. Puedes empezar por uno y sumar el
          resto después, sin rehacer lo que ya funciona.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {SERVICIOS.map((servicio) => (
            <TarjetaServicio key={servicio.id} servicio={servicio} onServicio={onServicio} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function Necesidades({ onNecesidad }: { onNecesidad: (servicio: IdServicio) => void }) {
  const seccionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const seccion = seccionRef.current
    if (!seccion) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const seccionNecesidades: HTMLElement = seccion
    let frame = 0
    function alScroll() {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        seccionNecesidades.style.setProperty('--scroll', String(Math.min(window.scrollY, 600)))
      })
    }
    alScroll()
    window.addEventListener('scroll', alScroll, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', alScroll)
      seccionNecesidades.style.removeProperty('--scroll')
    }
  }, [])

  return (
    <section
      ref={seccionRef}
      id="necesidades"
      className="fondo-oscuro relative overflow-hidden bg-marino py-20 text-white sm:py-28"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="glow-necesidades-a absolute -top-40 right-[-10%] h-[420px] w-[420px] rounded-full bg-electrico/25 blur-3xl" />
        <div className="glow-necesidades-b absolute -bottom-40 left-[-10%] h-[360px] w-[360px] rounded-full bg-verde/12 blur-3xl" />
      </div>

      <div className={cx(CONTENEDOR, 'revelar relative')} data-revelar>
        <p className="text-[11px] font-bold tracking-[0.16em] text-verde uppercase">Por necesidad</p>
        <h2 className="mt-3 max-w-3xl text-[32px] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[40px]">
          ¿Qué necesita tu empresa hoy?
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
          Elige la opción que más se parezca a tu situación. Te llevamos al formulario con el servicio ya
          seleccionado para que no tengas que empezar de cero.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NECESIDADES.map((necesidad) => (
            <button
              key={necesidad.etiqueta}
              type="button"
              onClick={() => onNecesidad(necesidad.servicio)}
              className="group flex items-center justify-between gap-4 rounded-xl border border-white/12 bg-white/5 px-5 py-4 text-left transition-colors hover:border-verde/60 hover:bg-white/10"
            >
              <span className="text-sm font-medium text-white/90">{necesidad.etiqueta}</span>
              <ArrowUpRight
                size={18}
                className="shrink-0 text-white/35 transition-colors group-hover:text-verde"
                aria-hidden
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Proceso() {
  const seccionRef = useProgresoScroll<HTMLElement>()

  return (
    <section ref={seccionRef} id="proceso" className="bg-white py-20 sm:py-28">
      <div className={cx(CONTENEDOR, 'revelar')} data-revelar>
        <p className={ETIQUETA}>Cómo trabajamos</p>
        <h2 className={TITULO_SECCION}>Un proceso claro, de la idea a la entrega.</h2>
        <p className={TEXTO_SECCION}>
          Sin cajas negras: en cada etapa sabes qué estamos haciendo, qué falta y qué decisiones necesitamos de
          tu equipo.
        </p>

        <div className="relative mt-12 grid gap-8 md:grid-cols-4 md:gap-5">
          <div aria-hidden className="absolute top-5 right-8 left-8 hidden h-px bg-borde-azul md:block">
            <span className="proceso-linea absolute inset-0" />
          </div>
          {PROCESO.map((paso, indice) => (
            <div key={paso.titulo} className="relative">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-electrico bg-white text-sm font-bold text-electrico-texto">
                {indice + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-marino">{paso.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-acero">{paso.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Portafolio() {
  return (
    <section id="portafolio" className="border-y border-borde-azul/70 bg-niebla py-20 sm:py-28">
      <div className={cx(CONTENEDOR, 'revelar')} data-revelar>
        <p className={ETIQUETA}>Portafolio</p>
        <h2 className={TITULO_SECCION}>Demostraciones funcionales, no promesas.</h2>
        <p className={TEXTO_SECCION}>
          Estos son productos que ya construimos dentro de nuestra propia plataforma. Puedes abrirlos y revisar
          cómo se sienten antes de contratar.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {DEMOS.map((demo) => (
            <article key={demo.nombre} className={cx(TARJETA, 'flex h-full flex-col overflow-hidden')}>
              <div className="relative h-40 overflow-hidden border-b border-borde-azul bg-white p-4">
                <MiniVisual tipo={demo.visual} />
                <span className="absolute top-4 left-4 rounded-full border border-borde-azul bg-white/95 px-2.5 py-1 text-[9px] font-bold tracking-[0.1em] text-marino uppercase">
                  Demostración
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-semibold text-marino">{demo.nombre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-acero">{demo.descripcion}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {demo.etiquetas.map((etiqueta) => (
                    <span
                      key={etiqueta}
                      className="rounded-full bg-electrico-suave px-2.5 py-1 text-[10px] font-semibold text-electrico-texto"
                    >
                      {etiqueta}
                    </span>
                  ))}
                </div>
                {demo.enlace && (
                  <a
                    href={demo.enlace}
                    className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-marino transition-colors hover:text-electrico-texto"
                  >
                    {demo.textoEnlace}
                    <ArrowUpRight size={15} aria-hidden />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-5 text-xs leading-relaxed text-acero">
          Estas demostraciones son productos construidos por AviTech. No representan clientes, testimonios ni
          resultados comerciales.
        </p>
      </div>
    </section>
  )
}

function MiniVisual({ tipo }: { tipo: DemoSitio['visual'] }) {
  if (tipo === 'panel') {
    return (
      <div aria-hidden className="flex h-full gap-2 rounded-lg border border-borde-azul bg-white p-2 shadow-sm">
        <div className="w-1/4 space-y-1 rounded bg-marino/8 p-1.5">
          <div className="h-1.5 w-3/4 rounded-full bg-marino/40" />
          {[0, 1, 2, 3].map((indice) => (
            <div key={indice} className={cx('h-1 rounded-full', indice === 0 ? 'bg-electrico/60' : 'bg-marino/15')} />
          ))}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((indice) => (
              <div key={indice} className="h-4 rounded bg-electrico-suave" />
            ))}
          </div>
          <div className="flex h-11 items-end gap-1 rounded bg-niebla p-1">
            {[40, 65, 50, 82, 60].map((altura, indice) => (
              <div
                key={indice}
                style={{ height: `${altura}%` }}
                className={cx('flex-1 rounded-t-sm', indice === 3 ? 'bg-verde' : 'bg-marino/30')}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (tipo === 'talento') {
    return (
      <div aria-hidden className="grid h-full grid-cols-2 gap-2">
        {[0, 1].map((indice) => (
          <div key={indice} className="rounded-lg border border-borde-azul bg-white p-2.5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-marino/15" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-4/5 rounded-full bg-marino/35" />
                <div className="h-1 w-3/5 rounded-full bg-acero/25" />
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="h-1 w-full rounded-full bg-acero/15" />
              <div className="h-1 w-4/5 rounded-full bg-acero/15" />
            </div>
            <div className="mt-2 flex gap-1">
              <div className="h-2.5 w-8 rounded-full bg-electrico-suave" />
              <div className="h-2.5 w-6 rounded-full bg-verde/20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div aria-hidden className="mx-auto h-full w-4/5 rounded-lg border border-borde-azul bg-white p-3 shadow-sm">
      <div className="h-2 w-1/2 rounded-full bg-marino/35" />
      <div className="mt-2 space-y-1.5">
        <div className="h-4 rounded border border-borde-azul bg-niebla" />
        <div className="h-4 rounded border border-borde-azul bg-niebla" />
        <div className="h-8 rounded border border-borde-azul bg-niebla" />
      </div>
      <div className="mt-2 h-4 w-1/3 rounded bg-electrico" />
    </div>
  )
}

export function Nosotros() {
  return (
    <section id="nosotros" className="bg-white py-20 sm:py-28">
      <div className={cx(CONTENEDOR, 'revelar grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16')} data-revelar>
        <div>
          <p className={ETIQUETA}>Sobre AviTech</p>
          <h2 className={TITULO_SECCION}>Un equipo multidisciplinario, enfocado en resolver.</h2>
          <p className="mt-5 text-base leading-relaxed text-acero">
            AviTech Solutions Group es una empresa tecnológica en desarrollo. Reunimos perfiles de coordinación,
            ingeniería de software, desarrollo web y móvil, y diseño para acompañar la digitalización de pequeñas
            y medianas empresas.
          </p>
          <p className="mt-4 text-base leading-relaxed text-acero">
            Trabajamos por etapas y con alcance escrito. Preferimos mostrar el trabajo antes que prometer
            resultados: las demostraciones de esta página son productos que ya construimos, no casos de clientes.
          </p>
          <p className="mt-4 text-base leading-relaxed text-acero">
            Nuestra base está en Santo Domingo, República Dominicana. Coordinamos el trabajo de forma remota cuando
            el proyecto lo permite.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((rol) => {
            const Icono = ICONOS_ROL[rol.icono]
            return (
              <div key={rol.titulo} className="rounded-xl border border-borde-azul bg-niebla/60 p-4">
                <Icono size={20} className="text-electrico" aria-hidden />
                <p className="mt-3 text-sm font-semibold text-marino">{rol.titulo}</p>
                <p className="mt-1 text-xs leading-relaxed text-acero">{rol.descripcion}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function Paquetes({ onPaquete }: { onPaquete: (servicio: IdServicio) => void }) {
  return (
    <section id="paquetes" className="border-t border-borde-azul/70 bg-niebla py-20 sm:py-28">
      <div className={cx(CONTENEDOR, 'revelar')} data-revelar>
        <p className={ETIQUETA}>Paquetes</p>
        <h2 className={TITULO_SECCION}>Referencias para empezar, no cotizaciones cerradas.</h2>
        <p className={TEXTO_SECCION}>
          Rangos iniciales en pesos dominicanos. Después del diagnóstico definimos el alcance exacto, los
          entregables y el precio final.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {PAQUETES.map((paquete, indice) => (
            <article
              key={paquete.nombre}
              className={cx(
                'relative flex h-full flex-col rounded-2xl border p-6',
                paquete.destacado
                  ? 'border-marino bg-marino text-white shadow-[0_30px_60px_-34px_rgba(0,38,74,0.75)]'
                  : 'border-borde-azul bg-white',
              )}
            >
              {paquete.destacado && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-verde px-3 py-1 text-[9px] font-bold tracking-[0.1em] text-marino-profundo uppercase">
                  <Sparkles size={12} aria-hidden />
                  Recomendado
                </span>
              )}

              <p
                className={cx(
                  'text-[10px] font-bold tracking-[0.14em] uppercase',
                  paquete.destacado ? 'text-verde' : 'text-electrico-texto',
                )}
              >
                Paquete {indice + 1}
              </p>
              <h3 className={cx('mt-2 text-lg font-semibold', paquete.destacado ? 'text-white' : 'text-marino')}>
                {paquete.nombre}
              </h3>
              <p
                className={cx(
                  'mt-2 flex flex-wrap items-baseline gap-x-1.5 text-lg font-semibold tracking-tight',
                  paquete.destacado ? 'text-white' : 'text-marino',
                )}
              >
                <span className="whitespace-nowrap">{paquete.rango}</span>
                {paquete.sufijo && (
                  <span className={cx('text-xs font-medium', paquete.destacado ? 'text-white/60' : 'text-acero')}>
                    {paquete.sufijo}
                  </span>
                )}
              </p>
              <p className={cx('mt-2 text-sm leading-relaxed', paquete.destacado ? 'text-white/70' : 'text-acero')}>
                {paquete.resumen}
              </p>

              <ul className="mt-5 space-y-2">
                {paquete.incluye.map((item) => (
                  <li
                    key={item}
                    className={cx('flex items-start gap-2 text-sm', paquete.destacado ? 'text-white/85' : 'text-grafito/85')}
                  >
                    <Check
                      size={15}
                      className={cx('mt-0.5 shrink-0', paquete.destacado ? 'text-verde' : 'text-electrico')}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <p className={cx('mt-5 text-xs leading-relaxed', paquete.destacado ? 'text-white/60' : 'text-acero')}>
                <span className="font-semibold">Ideal para:</span> {paquete.ideal}
              </p>

              <div className="mt-auto pt-6">
                <button
                  type="button"
                  onClick={() => onPaquete(paquete.servicio)}
                  className={cx(
                    'boton-primario inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                    paquete.destacado
                      ? 'bg-verde text-marino-profundo hover:bg-verde/90'
                      : 'bg-marino text-white hover:bg-marino-oscuro',
                  )}
                >
                  Hablar de este paquete
                  <ArrowRight size={16} aria-hidden />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-borde-azul bg-white px-4 py-3 text-xs leading-relaxed text-acero">
          <span className="font-semibold text-marino">Nota:</span> los rangos son referencias comerciales iniciales,
          no una cotización vinculante. El precio final depende del alcance, las integraciones, el contenido y los
          requisitos técnicos. Hosting, dominio, licencias y APIs se cotizan por separado.
        </div>
      </div>
    </section>
  )
}

export function Preguntas() {
  return (
    <section id="preguntas" className="bg-white py-20 sm:py-28">
      <div className={cx(CONTENEDOR, 'revelar')} data-revelar>
        <p className={ETIQUETA}>Preguntas frecuentes</p>
        <h2 className={TITULO_SECCION}>Lo que suele preguntar una empresa antes de empezar.</h2>
        <p className={TEXTO_SECCION}>
          Si tu duda no está aquí, escríbenos por el formulario y la respondemos junto con la propuesta.
        </p>

        <div className="mt-8 divide-y divide-borde-azul overflow-hidden rounded-2xl border border-borde-azul bg-white">
          {PREGUNTAS.map((item) => (
            <details key={item.pregunta} className="group px-5 py-4 sm:px-6">
              <summary className="flex list-none cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-marino">
                {item.pregunta}
                <ChevronDown
                  size={18}
                  className="shrink-0 text-electrico transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-acero">{item.respuesta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
