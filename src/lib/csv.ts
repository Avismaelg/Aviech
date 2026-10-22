/** Descarga una tabla como CSV compatible con Excel (BOM + comillas). */
export function descargarCSV(nombreArchivo: string, filas: Array<Array<string | number>>): void {
  const contenido = filas
    .map((fila) => fila.map((celda) => `"${String(celda).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
  const blob = new Blob(['\ufeff' + contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo.toLowerCase().endsWith('.csv') ? nombreArchivo : `${nombreArchivo}.csv`
  enlace.style.display = 'none'
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  // Firefox puede cancelar la descarga si el objeto se revoca en el mismo tick.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}
