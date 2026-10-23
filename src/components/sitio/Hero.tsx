import {
  ArrowRight,
  CircleCheck,
  ClipboardCheck,
  Receipt,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent as EventoMouse, type RefObject } from 'react'
import { cx } from '../../lib/estilos'
import { BovedaSeguridad } from './Boveda'
import { BOTON_CONTORNO, BOTON_VERDE, CONTENEDOR } from './estilos'
import { ParticulasHero } from './Particulas'
import { equipoLigero, useMagnetico } from './useInteraccion'

const PRUEBAS = ['Diagnóstico inicial', 'Propuesta con alcance escrito', 'Precios de referencia en RD$']

/** Fichas decorativas alrededor de la bóveda: muestran el tipo de resultado, no datos reales. */
const FICHAS: Array<{ icono: LucideIcon; titulo: string; detalle: string; posicion: string; capa: string }> = [
  {
    icono: ShieldCheck,
    titulo: 'Datos cifrados',
    detalle: 'Tránsito por HTTPS',
    posicion: 'lg:left-0 lg:top-[8%]',
    capa: 'boveda-chip-cerca',
  },
  {
    icono: ClipboardCheck,
    titulo: 'Consentimiento registrado',
    detalle: 'Antes de cada envío',
    posicion: 'lg:left-[6%] lg:top-[60%]',
    capa: 'boveda-chip-lejos',
  },
  {
    icono: Receipt,
    titulo: 'Factura con NCF',
    detalle: 'Montos en RD$',
    posicion: 'lg:right-0 lg:top-[22%]',
    capa: 'boveda-chip-lejos',
  },
  {
    icono: Workflow,
    titulo: 'Flujo automático',
    detalle: 'Sin tareas repetidas',
    posicion: 'lg:right-[6%] lg:top-[74%]',
    capa: 'boveda-chip-cerca',
  },
]

export function Hero({ onSolicitar }: { onSolicitar: () => void }) {
  const seccionRef = useRef<HTMLElement>(null)
  const escenaRef = useRef<HTMLDivElement>(null)
  const botonRef = useMagnetico<HTMLButtonElement>(7)
  const [reaccion, setReaccion] = useState(false)
  const temporizador = useRef<number | null>(null)

  useEffect(() => {
    const seccion = seccionRef.current
    const escena = escenaRef.current
    if (!seccion || !escena) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const seccionHero: HTMLElement = seccion
    const escenaHero: HTMLDivElement = escena
    const tactil = window.matchMedia('(pointer: coarse)').matches
    let frame = 0
    let objetivoX = 0
    let objetivoY = 0
    let actualX = 0
    let actualY = 0

    function animar() {
      frame = 0
      actualX += (objetivoX - actualX) * 0.13
      actualY += (objetivoY - actualY) * 0.13
      escenaHero.style.setProperty('--px', actualX.toFixed(3))
      escenaHero.style.setProperty('--py', actualY.toFixed(3))
      if (Math.abs(objetivoX - actualX) > 0.002 || Math.abs(objetivoY - actualY) > 0.002) {
        frame = window.requestAnimationFrame(animar)
      }
    }

    function alMover(evento: PointerEvent) {
      if (tactil || evento.pointerType === 'touch') return
      const rect = seccionHero.getBoundingClientRect()
      objetivoX = ((evento.clientX - rect.left) / rect.width - 0.5) * 2
      objetivoY = ((evento.clientY - rect.top) / rect.height - 0.5) * 2
      if (!frame) frame = window.requestAnimationFrame(animar)
    }

    function alSalir() {
      objetivoX = 0
      objetivoY = 0
      if (!frame) frame = window.requestAnimationFrame(animar)
    }

    seccionHero.addEventListener('pointermove', alMover, { passive: true })
    seccionHero.addEventListener('pointerleave', alSalir)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      seccionHero.removeEventListener('pointermove', alMover)
      seccionHero.removeEventListener('pointerleave', alSalir)
      escenaHero.style.removeProperty('--px')
      escenaHero.style.removeProperty('--py')
    }
  }, [])

  useEffect(() => {
    const seccion = seccionRef.current
    if (!seccion) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const seccionScroll: HTMLElement = seccion
    let frame = 0
    function alScroll() {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        seccionScroll.style.setProperty('--scroll', String(Math.min(window.scrollY, 700)))
      })
    }
    alScroll()
    window.addEventListener('scroll', alScroll, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', alScroll)
      seccionScroll.style.removeProperty('--scroll')
    }
  }, [])

  useEffect(() => {
    return () => {
      if (temporizador.current) window.clearTimeout(temporizador.current)
    }
  }, [])

  function alReaccionar(evento: EventoMouse<HTMLDivElement>) {
    const escena = escenaRef.current
    if (!escena) return
    const rect = escena.getBoundingClientRect()
    escena.style.setProperty('--click-x', `${evento.clientX - rect.left}px`)
    escena.style.setProperty('--click-y', `${evento.clientY - rect.top}px`)
    setReaccion(false)
    window.requestAnimationFrame(() => setReaccion(true))
    if (temporizador.current) window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => setReaccion(false), 760)
  }

  return (
    <section
      ref={seccionRef}
      id="portada"
      className={cx('hero-fondo fondo-oscuro relative isolate overflow-hidden text-white', equipoLigero() && 'hero-ligero')}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="cuadricula-oscura absolute inset-0 opacity-80" />
        <ParticulasHero />
        <div className="hero-glow hero-glow-a absolute -top-44 right-[-12%] h-[540px] w-[540px] rounded-full bg-electrico/25 blur-2xl sm:blur-3xl" />
        <div className="hero-glow hero-glow-b absolute -bottom-52 left-[-14%] h-[460px] w-[460px] rounded-full bg-verde/15 blur-2xl sm:blur-3xl" />
      </div>

      <div
        className={cx(
          CONTENEDOR,
          'relative grid items-center gap-14 pt-14 pb-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:pt-24 lg:pb-28',
        )}
      >
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[10px] font-bold tracking-[0.13em] text-white/85 uppercase">
            <ShieldCheck size={14} className="text-verde" aria-hidden />
            Digitalización empresarial · República Dominicana
          </p>

          <h1 className="mt-6 text-balance text-[40px] leading-[1.02] font-semibold tracking-[-0.04em] sm:text-[52px] lg:text-[58px]">
            Digitalizamos tu empresa.{' '}
            <span className="texto-degradado">Simplificamos tu operación.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Diseñamos páginas web, portales y automatizaciones que ordenan tu operación, cuidan la información de
            tus clientes y facilitan cobrar y facturar en pesos dominicanos.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button ref={botonRef} type="button" onClick={onSolicitar} className={BOTON_VERDE}>
              Solicitar una propuesta
              <ArrowRight size={18} aria-hidden />
            </button>
            <a href="#soluciones" className={BOTON_CONTORNO}>
              Explorar soluciones
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            {PRUEBAS.map((texto) => (
              <li key={texto} className="flex items-center gap-1.5">
                <CircleCheck size={16} className="text-verde" aria-hidden />
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <VistaBoveda escenaRef={escenaRef} reaccion={reaccion} onReaccion={alReaccionar} />
      </div>
    </section>
  )
}

/**
 * Bóveda con fichas. El contenedor recibe --px y --py desde la sección; la
 * bóveda gira con ellos y cada ficha responde a su profundidad.
 */
function VistaBoveda({
  escenaRef,
  reaccion,
  onReaccion,
}: {
  escenaRef: RefObject<HTMLDivElement | null>
  reaccion: boolean
  onReaccion: (evento: EventoMouse<HTMLDivElement>) => void
}) {
  return (
    <div
      ref={escenaRef}
      data-hero-escena
      data-reaccion={reaccion ? 'true' : undefined}
      onClick={onReaccion}
      className="hero-escena relative mx-auto w-full max-w-[560px] cursor-pointer"
    >
      <div className="relative aspect-square w-full">
        <BovedaSeguridad />
        <span aria-hidden className="hero-pulso" />
      </div>

      <div aria-hidden className="mt-6 grid gap-3 sm:grid-cols-2 lg:contents">
        {FICHAS.map(({ icono: Icono, titulo, detalle, posicion, capa }) => (
          <div
            key={titulo}
            className={cx(
              'boveda-chip flex items-center gap-3 rounded-2xl border border-white/12 bg-marino-profundo/85 px-4 py-3 shadow-[0_24px_50px_-28px_rgba(0,0,0,0.75)] lg:absolute lg:w-[232px]',
              capa,
              posicion,
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-verde/15 text-verde">
              <Icono size={18} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{titulo}</p>
              <p className="text-xs text-white/60">{detalle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
