/** Descarga un texto plano (informes, propuestas, correos) sin librerías externas. */
export function descargarTexto(nombre: string, contenido: string) {
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  enlace.style.display = 'none'
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  // Algunos navegadores cancelan la descarga si el objeto se revoca de inmediato.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}
