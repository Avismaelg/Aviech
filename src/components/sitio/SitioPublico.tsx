import { ArrowRight, Menu, MessageCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cx } from '../../lib/estilos'
import { CONTACTO, ENLACES_NAV, SERVICIOS, SITIO, type IdServicio } from '../../lib/sitio'
import { SeccionContacto } from './Contacto'
import {
  Hero,
  MarcaSitio,
  Necesidades,
  Nosotros,
  Paquetes,
  Portafolio,
  Proceso,
  Servicios,
  TiraValor,
} from './Secciones'
import { BOTON_PRIMARIO, CONTENEDOR } from './estilos'

const MENSAJE_WHATSAPP = encodeURIComponent('Hola, quiero información sobre los servicios de AviTech Solutions Group.')
const BOTON_CABECERA =
  'inline-flex items-center gap-1.5 rounded-xl bg-marino px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-marino-oscuro'

export function SitioPublico() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [solicitud, setSolicitud] = useState<{ servicio: IdServicio } | null>(null)

  useEffect(() => {
    const tituloAnterior = document.title
    document.title = `${SITIO.nombre} · ${SITIO.eslogan}`
    const meta = document.querySelector('meta[name="description"]')
    const descripcionAnterior = meta?.getAttribute('content') ?? ''
    meta?.setAttribute('content', SITIO.descripcion)

    const canonica = document.createElement('link')
    canonica.rel = 'canonical'
    canonica.href = `${SITIO.url}/`
    document.head.appendChild(canonica)

    const datosEstructurados = document.createElement('script')
    datosEstructurados.type = 'application/ld+json'
    datosEstructurados.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITIO.nombre,
      url: SITIO.url,
      description: SITIO.descripcion,
      areaServed: { '@type': 'Country', name: 'República Dominicana' },
    })
    document.head.appendChild(datosEstructurados)

    return () => {
      document.title = tituloAnterior
      if (meta) meta.setAttribute('content', descripcionAnterior)
      canonica.remove()
      datosEstructurados.remove()
    }
  }, [])

  useEffect(() => {
    if (!menuAbierto) return
    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setMenuAbierto(false)
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [menuAbierto])

  // Enlaces directos del tipo /#contacto o /#paquetes: al montar, lleva al ancla.
  useEffect(() => {
    const id = window.location.hash.replace(/^#\/?/, '')
    if (!id) return
    document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [])

  function irAContacto(servicio?: IdServicio) {
    if (servicio) setSolicitud({ servicio })
    setMenuAbierto(false)
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('contacto')?.scrollIntoView({
      behavior: reducir ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <div className="sitio-comercial min-h-screen bg-white text-grafito">
      <a
        href="#contenido"
        className="absolute top-0 left-[-9999px] z-[60] rounded-lg bg-marino px-4 py-2 text-sm font-semibold text-white focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-50 border-b border-borde-azul/70 bg-white/90 backdrop-blur">
        <div className={cx(CONTENEDOR, 'flex h-16 items-center justify-between gap-4')}>
          <a
            href="#portada"
            aria-label="AviTech Solutions Group, volver al inicio"
            onClick={() => setMenuAbierto(false)}
          >
            <MarcaSitio />
          </a>

          <nav aria-label="Navegación principal" className="hidden items-center gap-6 lg:flex">
            {ENLACES_NAV.map((enlace) => (
              <a
                key={enlace.href}
                href={enlace.href}
                className="text-sm font-medium text-acero transition-colors hover:text-marino"
              >
                {enlace.etiqueta}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <a href="/panel" className="text-sm font-medium text-acero transition-colors hover:text-marino">
              Acceso
            </a>
            <a href="#contacto" className={BOTON_CABECERA}>
              Solicitar propuesta
              <ArrowRight size={16} aria-hidden />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMenuAbierto((valor) => !valor)}
            aria-expanded={menuAbierto}
            aria-controls="menu-sitio"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-borde-azul text-marino transition-colors hover:bg-electrico-suave lg:hidden"
          >
            {menuAbierto ? <X size={19} aria-hidden /> : <Menu size={19} aria-hidden />}
          </button>
        </div>

        {menuAbierto && (
          <div id="menu-sitio" className="border-t border-borde-azul/70 bg-white lg:hidden">
            <nav aria-label="Navegación móvil" className={cx(CONTENEDOR, 'grid gap-1 py-4')}>
              {ENLACES_NAV.map((enlace) => (
                <a
                  key={enlace.href}
                  href={enlace.href}
                  onClick={() => setMenuAbierto(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-marino transition-colors hover:bg-electrico-suave"
                >
                  {enlace.etiqueta}
                </a>
              ))}
              <a
                href="/panel"
                onClick={() => setMenuAbierto(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-acero transition-colors hover:bg-electrico-suave hover:text-marino"
              >
                Acceso al panel
              </a>
            </nav>
            <div className={cx(CONTENEDOR, 'pb-4')}>
              <a
                href="#contacto"
                onClick={() => setMenuAbierto(false)}
                className={cx(BOTON_PRIMARIO, 'w-full')}
              >
                Solicitar propuesta
                <ArrowRight size={17} aria-hidden />
              </a>
            </div>
          </div>
        )}
      </header>

      <main id="contenido">
        <Hero onSolicitar={() => irAContacto()} />
        <TiraValor />
        <Servicios onServicio={irAContacto} />
        <Necesidades onNecesidad={irAContacto} />
        <Proceso />
        <Portafolio />
        <Nosotros />
        <Paquetes onPaquete={irAContacto} />
        <SeccionContacto solicitud={solicitud} />
      </main>

      <footer className="bg-marino-oscuro text-white/70">
        <div className={cx(CONTENEDOR, 'grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]')}>
          <div>
            <MarcaSitio claro />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">{SITIO.descripcion}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-white/40 uppercase">Soluciones</p>
            <ul className="mt-3 space-y-2 text-sm">
              {SERVICIOS.map((servicio) => (
                <li key={servicio.id}>
                  <button
                    type="button"
                    onClick={() => irAContacto(servicio.id)}
                    className="text-left text-white/70 transition-colors hover:text-verde"
                  >
                    {servicio.nombre}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-white/40 uppercase">Empresa</p>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ['#proceso', 'Proceso'],
                ['#portafolio', 'Portafolio'],
                ['#nosotros', 'Sobre AviTech'],
                ['#paquetes', 'Paquetes'],
              ].map(([href, etiqueta]) => (
                <li key={href}>
                  <a href={href} className="text-white/70 transition-colors hover:text-verde">
                    {etiqueta}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-white/40 uppercase">Accesos</p>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ['#contacto', 'Contacto'],
                ['/panel', 'Panel interno'],
                ['/talento', 'Portal de talento'],
                ['/solicitud', 'Formulario detallado'],
              ].map(([href, etiqueta]) => (
                <li key={href}>
                  <a href={href} className="text-white/70 transition-colors hover:text-verde">
                    {etiqueta}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={cx(
            CONTENEDOR,
            'flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between',
          )}
        >
          <p>
            © {SITIO.anio} {SITIO.nombre}. República Dominicana.
          </p>
          <p>Precios de referencia en RD$.</p>
        </div>
      </footer>

      {CONTACTO.whatsapp && (
        <a
          href={`https://wa.me/${CONTACTO.whatsapp}?text=${MENSAJE_WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribir por WhatsApp"
          className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex h-12 w-12 items-center justify-center rounded-full bg-verde text-marino shadow-[0_18px_40px_-18px_rgba(0,59,114,0.65)] transition-transform hover:scale-105"
        >
          <MessageCircle size={22} aria-hidden />
        </a>
      )}
    </div>
  )
}
