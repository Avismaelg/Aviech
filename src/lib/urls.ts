/** Utilidades compartidas de direcciones (Auditor SEO, Prospección). */

export function normalizarUrl(entrada: string): string {
  const texto = entrada.trim()
  if (!texto) throw new Error('Escribe la dirección de un sitio.')
  const conEsquema = /^https?:\/\//i.test(texto) ? texto : `https://${texto}`
  let url: URL
  try {
    url = new URL(conEsquema)
  } catch {
    throw new Error('La dirección no tiene un formato válido.')
  }
  if (!/^https?:$/.test(url.protocol)) throw new Error('Solo se pueden visitar direcciones http o https.')
  if (!url.hostname.includes('.')) throw new Error('Escribe un dominio completo, por ejemplo: misitio.com')
  return url.href
}

export function dominioDe(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
