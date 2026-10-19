import {
  CircleCheck,
  CircleGauge,
  CircleX,
  ExternalLink,
  Globe,
  RefreshCw,
  Search,
  SearchCheck,
  Trash2,
  TriangleAlert,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useAvisos } from '../../lib/avisos'
import { cx } from '../../lib/estilos'
import { fechaCompleta } from '../../lib/formato'
import { auditarSitio, colorPuntaje, etiquetaPuntaje, medirVelocidad } from '../../lib/seo'
import { normalizarUrl } from '../../lib/urls'
import { supabase } from '../../lib/supabase'
import { useTabla } from '../../lib/useTabla'
import type { AuditoriaSeo, ChequeoSeo, DatosSeo, GrupoChequeo } from '../../types/seo'
import {
  Boton,
  BotonIcono,
  CabeceraSeccion,
  Confirmar,
  Entrada,
  ErrorTabla,
  FilasCargando,
  Insignia,
  Tarjeta,
  Vacio,
} from '../ui'

const GRUPOS: Array<{ id: GrupoChequeo; titulo: string }> = [
  { id: 'contenido', titulo: 'Contenido' },
  { id: 'tecnico', titulo: 'Técnico' },
  { id: 'archivos', titulo: 'Archivos del sitio' },
]

const ESTILOS_CHEQUEO = {
  bien: { Icono: CircleCheck, clase: 'text-emerald-400' },
  mejorable: { Icono: TriangleAlert, clase: 'text-amber-400' },
  mal: { Icono: CircleX, clase: 'text-red-400' },
} as const

/** Fondo y borde según el puntaje (0–100). */
function clasePuntaje(puntaje: number): string {
  if (puntaje >= 80) return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
  if (puntaje >= 50) return 'border-amber-400/30 bg-amber-400/10 text-amber-300'
  return 'border-red-400/30 bg-red-400/10 text-red-300'
}

export function Seo() {
  const aviso = useAvisos()
  const { filas, cargando, error, cargar, eliminar } = useTabla<AuditoriaSeo>('seo_auditorias')
  const [entrada, setEntrada] = useState('')
  const [analizando, setAnalizando] = useState(false)
  const [midiendo, setMidiendo] = useState(false)
  const [seleccion, setSeleccion] = useState<AuditoriaSeo | null>(null)
  const [porEliminar, setPorEliminar] = useState<AuditoriaSeo | null>(null)

  // Lo que se muestra: la auditoría elegida a mano o, si no, la última guardada.
  const resultado = seleccion ?? (cargando ? null : (filas[0] ?? null))

  async function analizar(direccion?: string) {
    if (!supabase) return
    let url: string
    try {
      url = normalizarUrl(direccion ?? entrada)
    } catch (fallo) {
      aviso(fallo instanceof Error ? fallo.message : 'La dirección no es válida.', 'error')
      return
    }
    setAnalizando(true)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
      const datos = await auditarSitio(url, token)
      const { data: creada, error: falloGuardar } = await supabase
        .from('seo_auditorias')
        .insert({ url: datos.url, dominio: datos.dominio, puntaje: datos.puntaje, datos })
        .select()
        .single()
      if (falloGuardar) throw new Error(`No se pudo guardar el informe: ${falloGuardar.message}`)
      setSeleccion(creada as AuditoriaSeo)
      setEntrada(datos.url)
      aviso(`Auditoría lista: ${datos.puntaje}/100`)
      void cargar()
    } catch (fallo) {
      aviso(fallo instanceof Error ? fallo.message : 'No se pudo completar la auditoría.', 'error')
    } finally {
      setAnalizando(false)
    }
  }

  async function medirVelocidadDe(fila: AuditoriaSeo) {
    if (!supabase) return
    setMidiendo(true)
    try {
      const velocidad = await medirVelocidad(fila.datos.urlFinal || fila.url)
      const datos: DatosSeo = { ...fila.datos, velocidad }
      const { error: falloGuardar } = await supabase.from('seo_auditorias').update({ datos }).eq('id', fila.id)
      if (falloGuardar) throw new Error(`No se pudo guardar la medición: ${falloGuardar.message}`)
      if (resultado?.id === fila.id) setSeleccion({ ...fila, datos })
      aviso('Velocidad medida con PageSpeed móvil')
      void cargar()
    } catch (fallo) {
      aviso(fallo instanceof Error ? fallo.message : 'No se pudo medir la velocidad.', 'error')
    } finally {
      setMidiendo(false)
    }
  }

  async function confirmarEliminar() {
    if (!porEliminar) return
    const eliminada = porEliminar
    setPorEliminar(null)
    if (resultado?.id === eliminada.id) setSeleccion(null)
    await eliminar(eliminada.id)
  }

  return (
    <div>
      <CabeceraSeccion
        titulo="Auditor SEO"
        descripcion="Analiza cualquier página como la ve Google: contenido, SEO técnico, archivos del sitio y velocidad. Sin claves y sin costo."
      />

      <Tarjeta className="p-4 sm:p-5">
        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            void analizar()
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Globe
                size={16}
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue"
              />
              <Entrada
                type="text"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                aria-label="Dirección del sitio a auditar"
                placeholder="tusitio.com o https://tusitio.com/pagina"
                className="pl-9"
                value={entrada}
                onChange={(evento) => setEntrada(evento.target.value)}
                disabled={analizando}
              />
            </div>
            <Boton type="submit" disabled={analizando} className="sm:w-44">
              {analizando ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Search size={16} />
              )}
              {analizando ? 'Analizando…' : 'Analizar sitio'}
            </Boton>
          </div>
        </form>
        <p className="mt-2 text-xs text-tinta-tenue">
          Se revisa la página indicada (sin rastrear el sitio completo). La velocidad se mide aparte con PageSpeed,
          que tarda unos 20 segundos.
        </p>
      </Tarjeta>

      <div aria-live="polite" className="mt-4">
        {analizando ? (
          <Tarjeta className="flex items-center gap-3 p-5 text-sm text-tinta-suave">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-borde border-t-blue-400" />
            Revisando la página, los encabezados, los enlaces y los archivos del sitio…
          </Tarjeta>
        ) : resultado ? (
          <Informe
            auditoria={resultado}
            midiendo={midiendo}
            onMedir={() => void medirVelocidadDe(resultado)}
            onReanalizar={() => void analizar(resultado.url)}
          />
        ) : null}
      </div>

      <Tarjeta className="mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-borde px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-tinta">Historial</h3>
            {filas.length > 0 && <Insignia color="slate">{filas.length}</Insignia>}
          </div>
          <span className="text-xs text-tinta-tenue">Los informes se guardan automáticamente</span>
        </div>

        {cargando ? (
          <FilasCargando filas={3} />
        ) : error ? (
          <ErrorTabla mensaje={error} />
        ) : filas.length === 0 ? (
          <Vacio
            icono={<SearchCheck size={22} />}
            titulo="Todavía no hay auditorías"
            texto="Escribe una dirección arriba y pulsa «Analizar sitio». El informe queda guardado aquí para consultarlo después."
          />
        ) : (
          <ul className="divide-y divide-borde/60">
            {filas.map((fila) => (
              <li
                key={fila.id}
                className={cx(
                  'flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2/40',
                  resultado?.id === fila.id && 'bg-blue-500/5',
                )}
              >
                <span
                  className={cx(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold',
                    clasePuntaje(fila.puntaje),
                  )}
                >
                  {fila.puntaje}
                </span>
                <button
                  type="button"
                  onClick={() => setSeleccion(fila)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-sm font-medium text-tinta">{fila.dominio}</span>
                  <span className="block truncate text-xs text-tinta-tenue">
                    {fila.url} · {fechaCompleta(fila.created_at)}
                  </span>
                </button>
                <div className="flex items-center gap-0.5">
                  <BotonIcono etiqueta="Ver informe" onClick={() => setSeleccion(fila)}>
                    <Search size={15} />
                  </BotonIcono>
                  <BotonIcono
                    etiqueta="Medir velocidad"
                    onClick={() => void medirVelocidadDe(fila)}
                    disabled={midiendo}
                  >
                    <CircleGauge size={15} />
                  </BotonIcono>
                  <BotonIcono
                    etiqueta="Volver a analizar"
                    onClick={() => void analizar(fila.url)}
                    disabled={analizando}
                  >
                    <RefreshCw size={15} />
                  </BotonIcono>
                  <BotonIcono
                    etiqueta="Eliminar auditoría"
                    className="hover:text-red-300"
                    onClick={() => setPorEliminar(fila)}
                  >
                    <Trash2 size={15} />
                  </BotonIcono>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Confirmar
        abierto={Boolean(porEliminar)}
        titulo="Eliminar auditoría"
        mensaje={
          <>
            Se eliminará el informe de <strong className="text-tinta">{porEliminar?.dominio}</strong>. No se puede
            deshacer.
          </>
        }
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => void confirmarEliminar()}
      />
    </div>
  )
}

function Informe({
  auditoria,
  midiendo,
  onMedir,
  onReanalizar,
}: {
  auditoria: AuditoriaSeo
  midiendo: boolean
  onMedir: () => void
  onReanalizar: () => void
}) {
  const datos = auditoria.datos
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
      <Tarjeta className="overflow-hidden">
        <div className="flex flex-wrap items-start gap-4 border-b border-borde p-5">
          <div
            className={cx(
              'flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border',
              clasePuntaje(datos.puntaje),
            )}
          >
            <span className="text-3xl leading-none font-semibold">{datos.puntaje}</span>
            <span className="mt-1 text-[10px] tracking-wider uppercase opacity-80">de 100</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-tinta">{datos.dominio}</h3>
              <Insignia color={colorPuntaje(datos.puntaje)}>{etiquetaPuntaje(datos.puntaje)}</Insignia>
            </div>
            <a
              href={datos.urlFinal}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex max-w-full items-center gap-1 text-xs text-blue-300 hover:text-blue-200"
            >
              <span className="truncate">{datos.urlFinal}</span>
              <ExternalLink size={12} className="shrink-0" />
            </a>
            <p className="mt-2 text-xs text-tinta-tenue">
              HTTP {datos.httpStatus} · {datos.tiempoMs} ms · {(datos.bytes / 1024).toFixed(0)} KB ·{' '}
              {fechaCompleta(datos.fecha)}
            </p>
            {datos.recortado && (
              <p className="mt-1 text-xs text-amber-300/90">Página muy grande: se analizó el inicio del HTML.</p>
            )}
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Boton variante="secundario" type="button" onClick={onReanalizar}>
              <RefreshCw size={15} /> Reanalizar
            </Boton>
            <Boton variante="secundario" type="button" onClick={onMedir} disabled={midiendo}>
              <CircleGauge size={15} /> {midiendo ? 'Midiendo…' : 'Velocidad'}
            </Boton>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {GRUPOS.map((grupo) => {
            const chequeos = datos.chequeos.filter((chequeo) => chequeo.grupo === grupo.id)
            if (chequeos.length === 0) return null
            return (
              <section key={grupo.id}>
                <h4 className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-tinta-tenue uppercase">
                  {grupo.titulo}
                </h4>
                <ul className="space-y-2.5">
                  {chequeos.map((chequeo) => (
                    <Chequeo key={chequeo.id} chequeo={chequeo} />
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </Tarjeta>

      <div className="space-y-4">
        <TarjetaVelocidad datos={datos} midiendo={midiendo} onMedir={onMedir} />
        <Tarjeta className="p-5">
          <h4 className="text-sm font-semibold text-tinta">Ficha técnica</h4>
          <dl className="mt-3 space-y-2.5 text-xs">
            <Dato etiqueta="H1" valor={datos.contenido.h1[0] || 'Sin H1'} />
            <Dato etiqueta="Canonical" valor={datos.tecnico.canonical || 'No definida'} />
            <Dato etiqueta="Idioma" valor={datos.tecnico.lang || 'Sin declarar'} />
            <Dato etiqueta="Sitemap" valor={datos.archivos.sitemapUrl || 'No encontrado'} />
            <Dato
              etiqueta="Imágenes"
              valor={`${datos.contenido.imagenesTotal} (${datos.contenido.imagenesSinAlt} sin alt)`}
            />
            <Dato
              etiqueta="Enlaces"
              valor={`${datos.contenido.enlacesInternos} internos · ${datos.contenido.enlacesExternos} externos`}
            />
          </dl>
        </Tarjeta>
      </div>
    </div>
  )
}

function Chequeo({ chequeo }: { chequeo: ChequeoSeo }) {
  const { Icono, clase } = ESTILOS_CHEQUEO[chequeo.estado]
  return (
    <li className="flex items-start gap-2.5">
      <Icono size={16} className={cx('mt-0.5 shrink-0', clase)} aria-hidden />
      <div className="min-w-0">
        <p className="text-sm font-medium text-tinta">{chequeo.titulo}</p>
        <p className="text-xs leading-relaxed text-tinta-suave">{chequeo.detalle}</p>
      </div>
    </li>
  )
}

function TarjetaVelocidad({ datos, midiendo, onMedir }: { datos: DatosSeo; midiendo: boolean; onMedir: () => void }) {
  const velocidad = datos.velocidad
  return (
    <Tarjeta className="p-5">
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-blue-300" aria-hidden />
        <h4 className="text-sm font-semibold text-tinta">Velocidad (PageSpeed móvil)</h4>
      </div>
      {velocidad ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <PuntajeMini etiqueta="Rendimiento" valor={velocidad.performance} />
            <PuntajeMini etiqueta="SEO" valor={velocidad.seo} />
            <PuntajeMini etiqueta="Accesibilidad" valor={velocidad.accesibilidad} />
            <PuntajeMini etiqueta="Buenas prácticas" valor={velocidad.buenasPracticas} />
          </div>
          {(velocidad.lcp || velocidad.cls) && (
            <p className="mt-3 text-[11px] text-tinta-tenue">
              LCP {velocidad.lcp ?? '—'} · CLS {velocidad.cls ?? '—'} · medido {fechaCompleta(velocidad.fecha)}
            </p>
          )}
          <button
            type="button"
            onClick={onMedir}
            disabled={midiendo}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-300 transition-colors hover:text-blue-200 disabled:opacity-50"
          >
            <RefreshCw size={12} /> {midiendo ? 'Midiendo…' : 'Medir de nuevo'}
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-xs leading-relaxed text-tinta-suave">
            Google mide la carga real en un móvil. Tarda unos 20 segundos y es gratis.
          </p>
          <Boton variante="secundario" type="button" className="mt-3 w-full" onClick={onMedir} disabled={midiendo}>
            <CircleGauge size={15} /> {midiendo ? 'Midiendo…' : 'Medir velocidad'}
          </Boton>
        </>
      )}
    </Tarjeta>
  )
}

function PuntajeMini({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="rounded-lg border border-borde bg-superficie-2/50 px-3 py-2">
      <p className="text-[10px] tracking-wide text-tinta-tenue uppercase">{etiqueta}</p>
      <p
        className={cx(
          'text-lg font-semibold',
          valor >= 90 ? 'text-emerald-300' : valor >= 50 ? 'text-amber-300' : 'text-red-300',
        )}
      >
        {valor}
      </p>
    </div>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-tinta-tenue">{etiqueta}</dt>
      <dd className="min-w-0 break-words text-tinta-suave">{valor}</dd>
    </div>
  )
}
