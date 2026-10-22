import { useEffect } from 'react'
import { BOTON_PRIMARIO } from './sitio/estilos'

/** Página 404 para rutas que no pertenecen al sitio ni al panel. */
export function NoEncontrada() {
  useEffect(() => {
    const tituloAnterior = document.title
    document.title = 'Página no encontrada · AviTech Solutions Group'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.appendChild(robots)
    return () => {
      document.title = tituloAnterior
      robots.remove()
    }
  }, [])

  return (
    <div className="sitio-comercial flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-grafito">
      <p className="text-xs font-semibold tracking-[0.18em] text-electrico-texto uppercase">Error 404</p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-marino">
        Página no encontrada
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-acero">
        La dirección no existe o cambió. Vuelve al inicio para conocer los servicios de AviTech.
      </p>
      <a href="/" className={`${BOTON_PRIMARIO} mt-6`}>
        Volver al inicio
      </a>
    </div>
  )
}
