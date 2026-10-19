/**
 * AviTech Panel · API del Auditor SEO.
 *
 * Vive en el mismo Worker que publica el panel (Cloudflare) y analiza una página
 * en el servidor: así no hay problemas de CORS y el sitio auditado se ve tal como
 * lo ve un buscador. No usa claves de pago: todo el análisis es propio.
 *
 * - Ruta: GET /api/seo/auditar?url=https://ejemplo.com
 * - Seguridad: exige el token de sesión de Supabase (Authorization: Bearer …).
 * - Límite de CPU: se analizan como máximo los primeros 400 000 caracteres del HTML
 *   (el plan gratis de Cloudflare tiene 10 ms de CPU por petición).
 */

const LIMITE_HTML = 400_000
const TIMEOUT_PAGINA = 15_000
const TIMEOUT_ARCHIVO = 8_000
const MAX_ENLACES = 800
const MAX_PALABRAS_HTML = LIMITE_HTML
const ORIGENES_EXACTOS = ['https://aviech.avismael-eg.workers.dev']

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origen = origenPermitido(request.headers.get('Origin'))

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cabecerasCors(origen) })
    }
    if (url.pathname !== '/api/seo/auditar') {
      return json({ error: 'Ruta no encontrada.' }, 404, origen)
    }
    if (request.method !== 'GET') {
      return json({ error: 'Método no permitido.' }, 405, origen)
    }

    try {
      const autorizado = await estaAutenticado(request, env)
      if (!autorizado) {
        return json({ error: 'Tu sesión no es válida. Vuelve a iniciar sesión e inténtalo otra vez.' }, 401, origen)
      }
      const destino = validarUrl(url.searchParams.get('url') || '')
      const resultado = await auditar(destino)
      return json(resultado, 200, origen)
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
      const estado = error && typeof error === 'object' && 'estado' in error ? Number(error.estado) : 500
      return json({ error: mensaje }, estado, origen)
    }
  },
}

// ---------------------------------------------------------------- seguridad

async function estaAutenticado(request, env) {
  const cabecera = request.headers.get('Authorization') || ''
  if (!cabecera.startsWith('Bearer ')) return false
  const respuesta = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_ANON_KEY, authorization: cabecera },
  })
  return respuesta.ok
}

function validarUrl(entrada) {
  const texto = entrada.trim()
  if (!texto) throw conEstado('Escribe la dirección de un sitio para auditarlo.', 400)
  const conEsquema = /^https?:\/\//i.test(texto) ? texto : `https://${texto}`
  let url
  try {
    url = new URL(conEsquema)
  } catch {
    throw conEstado('La dirección no tiene un formato válido.', 400)
  }
  if (!/^https?:$/.test(url.protocol)) {
    throw conEstado('Solo se pueden auditar direcciones http o https.', 400)
  }
  const host = url.hostname.toLowerCase()
  const privados = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]']
  if (
    privados.includes(host) ||
    host.endsWith('.local') ||
    /^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) ||
    /^\d+$/.test(host)
  ) {
    throw conEstado('Esa dirección es privada y no se puede auditar.', 400)
  }
  return url
}

function conEstado(mensaje, estado) {
  const error = new Error(mensaje)
  error.estado = estado
  return error
}

function origenPermitido(origin) {
  if (!origin) return null
  if (ORIGENES_EXACTOS.includes(origin)) return origin
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return origin
  return null
}

function cabecerasCors(origen) {
  const cabeceras = {}
  if (origen) {
    cabeceras['access-control-allow-origin'] = origen
    cabeceras['access-control-allow-methods'] = 'GET, OPTIONS'
    cabeceras['access-control-allow-headers'] = 'Authorization, Content-Type'
    cabeceras.vary = 'Origin'
  }
  return cabeceras
}

function json(datos, estado, origen) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { 'content-type': 'application/json; charset=utf-8', ...cabecerasCors(origen) },
  })
}

// ---------------------------------------------------------------- auditoría

async function auditar(destino) {
  const inicio = Date.now()
  const control = new AbortController()
  const temporizador = setTimeout(() => control.abort(), TIMEOUT_PAGINA)
  let respuesta
  try {
    respuesta = await fetch(destino.href, {
      redirect: 'follow',
      signal: control.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; AviTechSEO/1.0; +https://aviech.avismael-eg.workers.dev)',
        accept: 'text/html,application/xhtml+xml',
        'accept-language': 'es-DO,es;q=0.9,en;q=0.8',
      },
    })
  } catch {
    throw conEstado('No se pudo conectar con el sitio. Revisa la dirección o inténtalo de nuevo.', 502)
  } finally {
    clearTimeout(temporizador)
  }

  const tiempoMs = Date.now() - inicio
  const html = await respuesta.text()
  const tipo = respuesta.headers.get('content-type') || ''
  if (!/html|xml/i.test(tipo) && !/<html|<!doctype html/i.test(html.slice(0, 2000))) {
    throw conEstado('Esa dirección no devuelve una página HTML (puede ser un archivo o una API).', 422)
  }

  const urlFinal = new URL(respuesta.url || destino.href)
  const recortado = html.length > LIMITE_HTML
  const trozo = recortado ? html.slice(0, LIMITE_HTML) : html
  const metas = leerMetas(extraerCabeza(trozo))
  const contenido = analizarContenido(trozo, urlFinal, metas)
  const tecnico = analizarTecnico(trozo, metas)
  const archivos = await analizarArchivos(urlFinal)
  const { chequeos, puntaje } = evaluar({ respuesta, contenido, tecnico, archivos, urlFinal })

  return {
    url: destino.href,
    urlFinal: urlFinal.href,
    dominio: urlFinal.hostname.replace(/^www\./, ''),
    httpStatus: respuesta.status,
    https: urlFinal.protocol === 'https:',
    tiempoMs,
    bytes: html.length,
    recortado,
    contenido,
    tecnico,
    archivos,
    chequeos,
    puntaje,
    fecha: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------- análisis

function extraerCabeza(html) {
  const cabeza = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html)
  return cabeza ? cabeza[1] : html.slice(0, 200_000)
}

function leerMetas(cabeza) {
  const metas = {
    descripcion: '',
    robots: '',
    viewport: '',
    charset: '',
    ogTitulo: '',
    ogDescripcion: '',
    ogImagen: '',
    canonical: '',
    hreflang: 0,
  }
  for (const etiqueta of cabeza.match(/<meta\b[^>]*>/gi) || []) {
    const nombre = atributo(etiqueta, 'name') || atributo(etiqueta, 'property')
    const contenido = atributo(etiqueta, 'content')
    if (!nombre || contenido === null) continue
    const clave = nombre.toLowerCase()
    if (clave === 'description') metas.descripcion = contenido
    else if (clave === 'robots') metas.robots = contenido
    else if (clave === 'viewport') metas.viewport = contenido
    else if (clave === 'og:title') metas.ogTitulo = contenido
    else if (clave === 'og:description') metas.ogDescripcion = contenido
    else if (clave === 'og:image') metas.ogImagen = contenido
  }
  for (const etiqueta of cabeza.match(/<link\b[^>]*>/gi) || []) {
    const rel = (atributo(etiqueta, 'rel') || '').toLowerCase()
    const href = atributo(etiqueta, 'href') || ''
    if (rel.includes('canonical') && !metas.canonical) metas.canonical = href
    if (rel.includes('alternate') && atributo(etiqueta, 'hreflang')) metas.hreflang++
  }
  const charset = /<meta\b[^>]*charset\s*=\s*["']?([\w-]+)/i.exec(cabeza)
  metas.charset = charset ? charset[1] : ''
  return metas
}

function analizarContenido(html, urlFinal, metas) {
  const titulo = limpiar(textoDe(html, 'title')).slice(0, 300)
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((encontrado) => limpiar(encontrado[1].replace(/<[^>]+>/g, ' ')).slice(0, 200))
    .filter(Boolean)
    .slice(0, 5)
  const h1Cantidad = (html.match(/<h1\b/gi) || []).length
  const h2Cantidad = (html.match(/<h2\b/gi) || []).length

  let imagenesTotal = 0
  let imagenesSinAlt = 0
  let imagenesAltVacio = 0
  for (const etiqueta of html.match(/<img\b[^>]*>/gi) || []) {
    imagenesTotal++
    const alt = atributo(etiqueta, 'alt')
    if (alt === null) imagenesSinAlt++
    else if (!alt.trim()) imagenesAltVacio++
  }

  let enlacesInternos = 0
  let enlacesExternos = 0
  let enlacesNofollow = 0
  let enlacesVistos = 0
  const dominioPropio = urlFinal.hostname.replace(/^www\./, '')
  for (const etiqueta of html.match(/<a\b[^>]*>/gi) || []) {
    const href = atributo(etiqueta, 'href')
    if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) continue
    if (/\brel\s*=\s*["'][^"']*nofollow/i.test(etiqueta)) enlacesNofollow++
    let enlace
    try {
      enlace = new URL(href, urlFinal)
    } catch {
      continue
    }
    if (enlace.hostname.replace(/^www\./, '') === dominioPropio) enlacesInternos++
    else enlacesExternos++
    if (++enlacesVistos >= MAX_ENLACES) break
  }

  return {
    titulo,
    tituloLargo: titulo.length,
    metaDescripcion: metas.descripcion.slice(0, 400),
    metaDescripcionLargo: metas.descripcion.length,
    h1,
    h1Cantidad,
    h2Cantidad,
    palabras: contarPalabras(html),
    imagenesTotal,
    imagenesSinAlt,
    imagenesAltVacio,
    enlacesInternos,
    enlacesExternos,
    enlacesNofollow,
    datosEstructurados: (html.match(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["']/gi) || []).length,
  }
}

function analizarTecnico(html, metas) {
  const lang = /<html\b[^>]*\blang\s*=\s*["']([^"']+)["']/i.exec(html)
  const robots = metas.robots.toLowerCase()
  return {
    lang: lang ? lang[1] : '',
    viewport: metas.viewport,
    viewportPresente: Boolean(metas.viewport && /width\s*=\s*device-width/i.test(metas.viewport)),
    canonical: metas.canonical,
    metaRobots: metas.robots,
    noindex: robots.includes('noindex'),
    ogTitulo: Boolean(metas.ogTitulo),
    ogDescripcion: Boolean(metas.ogDescripcion),
    ogImagen: Boolean(metas.ogImagen),
    hreflang: metas.hreflang,
  }
}

async function analizarArchivos(urlFinal) {
  const base = `${urlFinal.protocol}//${urlFinal.host}`
  const robots = await traerTexto(`${base}/robots.txt`)
  const archivos = {
    robotsExiste: robots.ok,
    robotsEstado: robots.estado,
    robotsSitemaps: [],
    robotsBloqueaTodo: false,
    sitemapUrl: '',
    sitemapExiste: false,
    sitemapEstado: 0,
    sitemapUrls: 0,
    sitemapEsIndice: false,
  }
  if (robots.ok) {
    let enGrupoComodin = false
    for (const linea of robots.texto.split(/\r?\n/)) {
      const limpia = linea.replace(/#.*$/, '').trim()
      const separador = limpia.indexOf(':')
      if (separador < 0) continue
      const clave = limpia.slice(0, separador).trim().toLowerCase()
      const valor = limpia.slice(separador + 1).trim()
      if (clave === 'user-agent') enGrupoComodin = valor === '*'
      else if (clave === 'disallow' && enGrupoComodin && valor === '/') archivos.robotsBloqueaTodo = true
      else if (clave === 'sitemap' && valor) archivos.robotsSitemaps.push(valor)
    }
    archivos.robotsSitemaps = [...new Set(archivos.robotsSitemaps)].slice(0, 5)
  }
  const sitemapUrl = archivos.robotsSitemaps[0] || `${base}/sitemap.xml`
  const sitemap = await traerTexto(sitemapUrl)
  archivos.sitemapUrl = sitemapUrl
  archivos.sitemapExiste = sitemap.ok
  archivos.sitemapEstado = sitemap.estado
  if (sitemap.ok) {
    archivos.sitemapEsIndice = /<sitemapindex/i.test(sitemap.texto)
    archivos.sitemapUrls = Math.min((sitemap.texto.match(/<loc>/gi) || []).length, 5000)
  }
  return archivos
}

async function traerTexto(direccion) {
  const control = new AbortController()
  const temporizador = setTimeout(() => control.abort(), TIMEOUT_ARCHIVO)
  try {
    const respuesta = await fetch(direccion, {
      redirect: 'follow',
      signal: control.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; AviTechSEO/1.0)' },
    })
    const texto = (await respuesta.text()).slice(0, 200_000)
    return { ok: respuesta.ok && !/<html/i.test(texto.slice(0, 200)), estado: respuesta.status, texto }
  } catch {
    return { ok: false, estado: 0, texto: '' }
  } finally {
    clearTimeout(temporizador)
  }
}

// ---------------------------------------------------------------- evaluación

function evaluar({ respuesta, contenido, tecnico, archivos, urlFinal }) {
  const chequeos = []
  let puntos = 0
  let posible = 0

  function sumar(id, grupo, titulo, estado, detalle, peso) {
    chequeos.push({ id, grupo, titulo, estado, detalle })
    const factor = estado === 'bien' ? 1 : estado === 'mejorable' ? 0.5 : 0
    puntos += peso * factor
    posible += peso
  }

  const seguro = urlFinal.protocol === 'https:'
  sumar('https', 'tecnico', 'Conexión segura (HTTPS)', seguro ? 'bien' : 'mal', seguro ? 'El sitio usa HTTPS.' : 'No usa HTTPS: los navegadores lo marcan como «no seguro».', 10)

  const codigo = respuesta.status
  const estadoHttp = codigo >= 200 && codigo < 300 ? 'bien' : codigo >= 300 && codigo < 400 ? 'mejorable' : 'mal'
  sumar('estado', 'tecnico', 'Respuesta del servidor', estadoHttp, `Código HTTP ${codigo}.`, 10)

  const titulo = contenido.titulo
  const estadoTitulo = !titulo ? 'mal' : titulo.length >= 30 && titulo.length <= 65 ? 'bien' : 'mejorable'
  sumar('titulo', 'contenido', 'Título de la página', estadoTitulo, !titulo ? 'No tiene <title>.' : `${titulo.length} caracteres (ideal: 30 a 65).`, 12)

  const descripcion = contenido.metaDescripcion
  const estadoDescripcion = !descripcion ? 'mal' : descripcion.length >= 70 && descripcion.length <= 165 ? 'bien' : 'mejorable'
  sumar('descripcion', 'contenido', 'Meta descripción', estadoDescripcion, !descripcion ? 'No tiene meta descripción.' : `${descripcion.length} caracteres (ideal: 70 a 165).`, 12)

  const estadoH1 = contenido.h1Cantidad === 1 && contenido.h1.length > 0 ? 'bien' : contenido.h1Cantidad === 0 ? 'mal' : 'mejorable'
  sumar('h1', 'contenido', 'Encabezado principal (H1)', estadoH1, contenido.h1Cantidad === 1 ? `«${contenido.h1[0]}»` : `${contenido.h1Cantidad} encabezados H1 (debe haber uno solo).`, 10)

  const palabras = contenido.palabras
  const estadoPalabras = palabras >= 300 ? 'bien' : palabras >= 100 ? 'mejorable' : 'mal'
  sumar('palabras', 'contenido', 'Contenido suficiente', estadoPalabras, `≈ ${palabras} palabras en la página.`, 6)

  const conAlt = contenido.imagenesTotal - contenido.imagenesSinAlt
  const proporcionAlt = contenido.imagenesTotal ? conAlt / contenido.imagenesTotal : 1
  const estadoImagenes = contenido.imagenesTotal === 0 ? 'mejorable' : proporcionAlt >= 0.9 ? 'bien' : proporcionAlt >= 0.7 ? 'mejorable' : 'mal'
  const detalleImagenes =
    contenido.imagenesTotal === 0
      ? 'La página no tiene imágenes.'
      : `${contenido.imagenesSinAlt} de ${contenido.imagenesTotal} sin atributo alt${contenido.imagenesAltVacio ? `; ${contenido.imagenesAltVacio} con alt vacío` : ''}.`
  sumar('imagenes', 'contenido', 'Imágenes con texto alternativo', estadoImagenes, detalleImagenes, 8)

  const estadoEnlaces = contenido.enlacesInternos >= 5 ? 'bien' : contenido.enlacesInternos >= 1 ? 'mejorable' : 'mal'
  sumar('enlaces', 'contenido', 'Enlaces internos', estadoEnlaces, `${contenido.enlacesInternos} internos y ${contenido.enlacesExternos} externos.`, 6)

  const datos = contenido.datosEstructurados
  sumar('datos', 'contenido', 'Datos estructurados (schema.org)', datos >= 1 ? 'bien' : 'mejorable', datos >= 1 ? `${datos} bloque(s) JSON-LD.` : 'No se detectaron datos estructurados.', 6)

  sumar('viewport', 'tecnico', 'Adaptado a móviles (viewport)', tecnico.viewportPresente ? 'bien' : 'mal', tecnico.viewportPresente ? 'Declara width=device-width.' : 'Falta la meta viewport para móviles.', 8)

  sumar('canonical', 'tecnico', 'URL canónica', tecnico.canonical ? 'bien' : 'mal', tecnico.canonical ? acortar(tecnico.canonical, 120) : 'No declara una URL canónica.', 6)

  sumar('robots', 'tecnico', 'Indexación permitida', tecnico.noindex ? 'mal' : 'bien', tecnico.noindex ? 'La página tiene «noindex»: Google no la mostrará.' : tecnico.metaRobots ? `meta robots: ${tecnico.metaRobots}` : 'Sin restricciones de indexación.', 8)

  const og = [tecnico.ogTitulo, tecnico.ogDescripcion, tecnico.ogImagen].filter(Boolean).length
  sumar('open-graph', 'tecnico', 'Vista previa en redes (Open Graph)', og === 3 ? 'bien' : og >= 1 ? 'mejorable' : 'mal', `${og} de 3 etiquetas (título, descripción e imagen).`, 6)

  sumar('lang', 'tecnico', 'Idioma declarado', tecnico.lang ? 'bien' : 'mejorable', tecnico.lang ? `Idioma: ${tecnico.lang}.` : 'La etiqueta <html> no declara idioma.', 4)

  const robotsEstado = archivos.robotsBloqueaTodo ? 'mal' : archivos.robotsExiste ? 'bien' : 'mejorable'
  const robotsDetalle = archivos.robotsBloqueaTodo
    ? 'robots.txt bloquea todo el sitio a los buscadores.'
    : archivos.robotsExiste
      ? `robots.txt accesible${archivos.robotsSitemaps.length ? ` y declara ${archivos.robotsSitemaps.length} sitemap(s)` : ''}.`
      : 'No se encontró robots.txt (no es obligatorio, pero ayuda).'
  sumar('robots-txt', 'archivos', 'Archivo robots.txt', robotsEstado, robotsDetalle, 4)

  const sitemapEstado = archivos.sitemapExiste && archivos.sitemapUrls > 0 ? 'bien' : archivos.sitemapExiste ? 'mejorable' : 'mal'
  const sitemapDetalle = !archivos.sitemapExiste
    ? 'No se encontró sitemap.xml: a los buscadores les cuesta descubrir las páginas.'
    : archivos.sitemapEsIndice
      ? `Sitemap índice con ${archivos.sitemapUrls} referencias.`
      : `${archivos.sitemapUrls} URL(s) declaradas.`
  sumar('sitemap', 'archivos', 'Mapa del sitio (sitemap.xml)', sitemapEstado, sitemapDetalle, 8)

  return { chequeos, puntaje: posible ? Math.round((puntos / posible) * 100) : 0 }
}

// ---------------------------------------------------------------- utilidades

function textoDe(html, etiqueta) {
  const encontrado = new RegExp(`<${etiqueta}\\b[^>]*>([\\s\\S]*?)<\\/${etiqueta}>`, 'i').exec(html)
  return encontrado ? encontrado[1].replace(/<[^>]+>/g, ' ') : ''
}

function atributo(etiqueta, nombre) {
  // Exige espacio antes del nombre para no confundir, por ejemplo, "data-alt" con "alt".
  const encontrado = new RegExp(`(?:^|\\s)${nombre}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i').exec(etiqueta)
  if (!encontrado) return null
  return encontrado[2] ?? encontrado[3] ?? encontrado[4] ?? ''
}

function limpiar(texto) {
  return texto
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function contarPalabras(html) {
  const sinCodigo = html
    .slice(0, MAX_PALABRAS_HTML)
    .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
  return (limpiar(sinCodigo).match(/\S+/g) || []).length
}

function acortar(texto, limite) {
  return texto.length > limite ? `${texto.slice(0, limite - 1)}…` : texto
}
