import { CalendarClock, Gauge, Target, Trophy } from 'lucide-react'
import { useCallback, useMemo, useState, type KeyboardEvent } from 'react'
import { cx } from '../../lib/estilos'
import { ETAPAS_CRM_ABIERTAS } from '../../lib/etiquetas'
import { formatoDinero, hoyISO } from '../../lib/formato'
import { useTabla } from '../../lib/useTabla'
import type { ActividadCrm, ContactoCrm, EmpresaCrm, OportunidadCrm } from '../../types/crm'
import { CabeceraSeccion, Tarjeta } from '../ui'
import { Actividades } from './Actividades'
import { Contactos } from './Contactos'
import { Empresas } from './Empresas'
import { Pipeline } from './Pipeline'
import type { PestanaCrm, TablaCrm } from './tipos'

const PESTANAS: Array<{ id: PestanaCrm; etiqueta: string }> = [
  { id: 'pipeline', etiqueta: 'Pipeline' },
  { id: 'empresas', etiqueta: 'Empresas' },
  { id: 'contactos', etiqueta: 'Contactos' },
  { id: 'actividades', etiqueta: 'Actividades' },
]

export function Crm() {
  const oportunidadesHook = useTabla<OportunidadCrm>(
    'crm_oportunidades',
    '*, crm_empresas(id, nombre, cliente_id), crm_contactos(nombre)',
  )
  const empresasHook = useTabla<EmpresaCrm>('crm_empresas')
  const contactosHook = useTabla<ContactoCrm>('crm_contactos', '*, crm_empresas(nombre)')
  const actividadesHook = useTabla<ActividadCrm>(
    'crm_actividades',
    '*, crm_oportunidades(titulo, crm_empresas(nombre)), crm_contactos(nombre)',
  )

  const [pestana, setPestana] = useState<PestanaCrm>('pipeline')

  // Se extraen para que useCallback tenga dependencias estables (useTabla las memoriza).
  const cargarOportunidades = oportunidadesHook.cargar
  const cargarEmpresas = empresasHook.cargar
  const cargarContactos = contactosHook.cargar
  const cargarActividades = actividadesHook.cargar

  const empresas = useMemo(
    () => [...empresasHook.filas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [empresasHook.filas],
  )
  const contactos = useMemo(
    () => [...contactosHook.filas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [contactosHook.filas],
  )

  const abiertas = useMemo(
    () =>
      oportunidadesHook.filas.filter((oportunidad) =>
        (ETAPAS_CRM_ABIERTAS as readonly string[]).includes(oportunidad.etapa),
      ),
    [oportunidadesHook.filas],
  )
  const ganadas = useMemo(
    () => oportunidadesHook.filas.filter((oportunidad) => oportunidad.etapa === 'ganado'),
    [oportunidadesHook.filas],
  )

  const montoAbierto = abiertas.reduce((total, oportunidad) => total + Number(oportunidad.monto || 0), 0)
  const ponderado = abiertas.reduce(
    (total, oportunidad) => total + (Number(oportunidad.monto || 0) * Number(oportunidad.probabilidad || 0)) / 100,
    0,
  )
  const ganado = ganadas.reduce((total, oportunidad) => total + Number(oportunidad.monto || 0), 0)
  const pendientes = actividadesHook.filas.filter((actividad) => !actividad.completada).length
  const atrasadas = actividadesHook.filas.filter(
    (actividad) => !actividad.completada && actividad.fecha < hoyISO(),
  ).length

  const refrescar = useCallback(async () => {
    await Promise.all([cargarOportunidades(), cargarEmpresas(), cargarContactos(), cargarActividades()])
  }, [cargarOportunidades, cargarEmpresas, cargarContactos, cargarActividades])

  const tablaOportunidades: TablaCrm<OportunidadCrm> = {
    filas: oportunidadesHook.filas,
    cargando: oportunidadesHook.cargando,
    error: oportunidadesHook.error,
    cargar: oportunidadesHook.cargar,
    guardar: oportunidadesHook.guardar,
    eliminar: oportunidadesHook.eliminar,
  }
  const tablaEmpresas: TablaCrm<EmpresaCrm> = {
    filas: empresas,
    cargando: empresasHook.cargando,
    error: empresasHook.error,
    cargar: empresasHook.cargar,
    guardar: empresasHook.guardar,
    eliminar: empresasHook.eliminar,
  }
  const tablaContactos: TablaCrm<ContactoCrm> = {
    filas: contactos,
    cargando: contactosHook.cargando,
    error: contactosHook.error,
    cargar: contactosHook.cargar,
    guardar: contactosHook.guardar,
    eliminar: contactosHook.eliminar,
  }
  const tablaActividades: TablaCrm<ActividadCrm> = {
    filas: actividadesHook.filas,
    cargando: actividadesHook.cargando,
    error: actividadesHook.error,
    cargar: actividadesHook.cargar,
    guardar: actividadesHook.guardar,
    eliminar: actividadesHook.eliminar,
  }

  const contadores: Record<PestanaCrm, number> = {
    pipeline: abiertas.length,
    empresas: empresas.length,
    contactos: contactos.length,
    actividades: pendientes,
  }

  const descripcion = `${empresas.length} empresa${empresas.length === 1 ? '' : 's'} · ${abiertas.length} oportunidad${
    abiertas.length === 1 ? '' : 'es'
  } abierta${abiertas.length === 1 ? '' : 's'} · ${formatoDinero(montoAbierto)} en pipeline`

  function alTeclearPestana(evento: KeyboardEvent<HTMLDivElement>) {
    const actual = PESTANAS.findIndex((fila) => fila.id === pestana)
    let destino = actual
    if (evento.key === 'ArrowRight') destino = (actual + 1) % PESTANAS.length
    else if (evento.key === 'ArrowLeft') destino = (actual - 1 + PESTANAS.length) % PESTANAS.length
    else if (evento.key === 'Home') destino = 0
    else if (evento.key === 'End') destino = PESTANAS.length - 1
    else return
    evento.preventDefault()
    const id = PESTANAS[destino].id
    setPestana(id)
    window.setTimeout(() => document.getElementById(`pestana-${id}`)?.focus(), 0)
  }

  return (
    <section>
      <CabeceraSeccion titulo="CRM" descripcion={descripcion} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Target size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Pipeline abierto</p>
            <p className="text-base font-semibold text-tinta">{formatoDinero(montoAbierto)}</p>
            <p className="text-xs text-tinta-tenue">
              {abiertas.length} oportunidad{abiertas.length === 1 ? '' : 'es'}
            </p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <Gauge size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Ponderado</p>
            <p className="text-base font-semibold text-tinta">{formatoDinero(ponderado)}</p>
            <p className="text-xs text-tinta-tenue">monto × probabilidad</p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Trophy size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Ganado</p>
            <p className="text-base font-semibold text-tinta">{formatoDinero(ganado)}</p>
            <p className="text-xs text-tinta-tenue">
              {ganadas.length} oportunidad{ganadas.length === 1 ? '' : 'es'}
            </p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <CalendarClock size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Actividades pendientes</p>
            <p className="text-base font-semibold text-tinta">{pendientes}</p>
            <p className={cx('text-xs', atrasadas > 0 ? 'text-red-700' : 'text-tinta-tenue')}>
              {atrasadas > 0 ? `${atrasadas} atrasada${atrasadas === 1 ? '' : 's'}` : 'al día'}
            </p>
          </div>
        </Tarjeta>
      </div>

      <div
        role="tablist"
        aria-label="Secciones del CRM"
        onKeyDown={alTeclearPestana}
        className="mb-4 flex gap-1 overflow-x-auto rounded-2xl border border-borde bg-superficie p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        {PESTANAS.map(({ id, etiqueta }) => {
          const activa = pestana === id
          return (
            <button
              key={id}
              id={`pestana-${id}`}
              type="button"
              role="tab"
              aria-selected={activa}
              aria-controls={`panel-${id}`}
              tabIndex={activa ? 0 : -1}
              onClick={() => setPestana(id)}
              className={cx(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150',
                activa
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-tinta-suave hover:bg-superficie-2 hover:text-tinta',
              )}
            >
              {etiqueta}
              <span
                className={cx(
                  'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                  activa ? 'bg-white/20 text-white' : 'bg-superficie-2 text-tinta-tenue',
                )}
              >
                {contadores[id]}
              </span>
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={`panel-${pestana}`} aria-labelledby={`pestana-${pestana}`}>
        {pestana === 'pipeline' && (
          <Pipeline
            oportunidades={tablaOportunidades}
            empresas={empresas}
            contactos={contactos}
            refrescar={refrescar}
            onIrAEmpresas={() => setPestana('empresas')}
          />
        )}
        {pestana === 'empresas' && (
          <Empresas
            empresas={tablaEmpresas}
            contactos={contactos}
            oportunidades={oportunidadesHook.filas}
            refrescar={refrescar}
          />
        )}
        {pestana === 'contactos' && (
          <Contactos
            contactos={tablaContactos}
            empresas={empresas}
            refrescar={refrescar}
            onIrAEmpresas={() => setPestana('empresas')}
          />
        )}
        {pestana === 'actividades' && (
          <Actividades
            actividades={tablaActividades}
            oportunidades={oportunidadesHook.filas}
            contactos={contactos}
          />
        )}
      </div>
    </section>
  )
}
