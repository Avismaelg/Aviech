/** Descarga un texto plano (informes, propuestas, correos) sin librerías externas. */
export function descargarTexto(nombre: string, contenido: string) {
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(blob)
  enlace.download = nombre
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}
