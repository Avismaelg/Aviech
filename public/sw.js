// Service worker del panel AviTech (PWA).
// - Guarda el armazón (HTML, CSS, JS, fuentes): repetir visita al instante y abrir sin conexión.
// - La API (/api/*) y Supabase NUNCA se guardan en caché: los datos siempre van a la red.
// Al cambiar esta lógica, sube VERSION para purgar las cachés viejas.
const VERSION = 'avitech-v2026-10-19c'
const ARMAZON = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg']

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(ARMAZON))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(claves.filter((clave) => clave !== VERSION).map((clave) => caches.delete(clave))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request
  if (peticion.method !== 'GET') return
  const direccion = new URL(peticion.url)
  if (direccion.origin !== self.location.origin) return
  if (direccion.pathname.startsWith('/api/')) return

  // Página: red primero (para recibir versiones nuevas); sin conexión, la copia guardada.
  if (peticion.mode === 'navigate') {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone()
          caches.open(VERSION).then((cache) => cache.put('/index.html', copia))
          return respuesta
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  // Recursos (fuentes, CSS, JS con hash): caché primero; si faltan, se traen y se guardan.
  evento.respondWith(
    caches.match(peticion).then(
      (guardada) =>
        guardada ||
        fetch(peticion).then((respuesta) => {
          if (respuesta.ok && respuesta.type === 'basic') {
            const copia = respuesta.clone()
            caches.open(VERSION).then((cache) => cache.put(peticion, copia))
          }
          return respuesta
        }),
    ),
  )
})
