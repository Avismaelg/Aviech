import { Pencil, Plus, Receipt, Search, Trash2, TrendingDown, Wallet } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { CATEGORIAS_GASTO, colorCategoriaGasto, etiquetaCategoriaGasto } from '../lib/etiquetas'
import { formatoDinero, formatoFecha, hoyISO, mesActualISO } from '../lib/formato'
import { useTabla } from '../lib/useTabla'
import type { Gasto } from '../types/gasto'
import {
  AreaTexto,
  Boton,
  BotonIcono,
  CabeceraSeccion,
  Campo,
  Confirmar,
  Entrada,
  ErrorTabla,
  FilasCargando,
  Insignia,
  Modal,
  Selector,
  Tarjeta,
  Vacio,
} from './ui'

interface FormularioGasto {
  concepto: string
  categoria: string
  monto: string
  fecha: string
  notas: string
}

const FORMULARIO_VACIO: FormularioGasto = {
  concepto: '',
  categoria: 'operativo',
  monto: '',
  fecha: hoyISO(),
  notas: '',
}

export function Gastos() {
  const { filas: gastos, cargando, error, guardar, eliminar } = useTabla<Gasto>('gastos', '*', 'fecha')
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<FormularioGasto>(FORMULARIO_VACIO)
  const [porEliminar, setPorEliminar] = useState<Gasto | null>(null)
  const [guardando, setGuardando] = useState(false)

  const mesActual = mesActualISO()
  const gastosMes = gastos
    .filter((gasto) => (gasto.fecha ?? '').slice(0, 7) === mesActual)
    .reduce((total, gasto) => total + Number(gasto.monto), 0)
  const totalHistorico = gastos.reduce((total, gasto) => total + Number(gasto.monto), 0)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return gastos.filter((gasto) => {
      const coincideCategoria = filtroCategoria === 'todas' || gasto.categoria === filtroCategoria
      const coincideTexto = !texto || gasto.concepto.toLowerCase().includes(texto)
      return coincideCategoria && coincideTexto
    })
  }, [gastos, busqueda, filtroCategoria])

  function abrirNuevo() {
    setEditandoId(null)
    setFormulario(FORMULARIO_VACIO)
    setModalAbierto(true)
  }

  function abrirEdicion(gasto: Gasto) {
    setEditandoId(gasto.id)
    setFormulario({
      concepto: gasto.concepto,
      categoria: gasto.categoria,
      monto: String(gasto.monto),
      fecha: gasto.fecha,
      notas: gasto.notas ?? '',
    })
    setModalAbierto(true)
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando || !formulario.concepto.trim() || formulario.monto === '') return
    setGuardando(true)
    const guardado = await guardar(
      {
        concepto: formulario.concepto.trim(),
        categoria: formulario.categoria,
        monto: Number(formulario.monto),
        fecha: formulario.fecha || hoyISO(),
        notas: formulario.notas.trim() || null,
      },
      editandoId ?? undefined,
    )
    setGuardando(false)
    if (guardado) setModalAbierto(false)
  }

  return (
    <section>
      <CabeceraSeccion
        titulo="Gastos"
        descripcion={`${gastos.length} registrado${gastos.length === 1 ? '' : 's'} · regla del dinero ×3`}
        acciones={
          <Boton onClick={abrirNuevo}>
            <Plus size={16} /> Nuevo gasto
          </Boton>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-400/10 text-rose-300">
            <TrendingDown size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Gastos este mes</p>
            <p className="text-base font-semibold text-tinta">{formatoDinero(gastosMes)}</p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3 p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-superficie-2 text-tinta-suave">
            <Wallet size={17} />
          </span>
          <div>
            <p className="text-xs text-tinta-suave">Total histórico</p>
            <p className="text-base font-semibold text-tinta">{formatoDinero(totalHistorico)}</p>
          </div>
        </Tarjeta>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por concepto…"
            className="pl-9"
          />
        </div>
        <Selector value={filtroCategoria} onChange={(evento) => setFiltroCategoria(evento.target.value)} className="sm:w-44">
          <option value="todas">Todas las categorías</option>
          {CATEGORIAS_GASTO.map((categoria) => (
            <option key={categoria} value={categoria}>
              {etiquetaCategoriaGasto[categoria]}
            </option>
          ))}
        </Selector>
      </div>

      <Tarjeta>
        {error && <ErrorTabla mensaje={error} />}
        {cargando && !error && <FilasCargando />}
        {!cargando && !error && filtrados.length === 0 && (
          gastos.length === 0 ? (
            <Vacio
              icono={<Receipt size={22} />}
              titulo="Todavía no hay gastos"
              texto="Registra el primero con el botón «Nuevo gasto». Recuerda la regla: cada gasto se cubre con ingresos ×3."
            />
          ) : (
            <Vacio icono={<Search size={22} />} titulo="Sin resultados" texto="Prueba otra búsqueda o quita el filtro." />
          )
        )}
        {!cargando && !error && filtrados.length > 0 && (
          <ul className="divide-y divide-borde-suave">
            {filtrados.map((gasto) => (
              <li key={gasto.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-400/10 text-rose-300">
                  <Receipt size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-tinta">{gasto.concepto}</p>
                  <p className="truncate text-xs text-tinta-suave">
                    {[etiquetaCategoriaGasto[gasto.categoria] ?? gasto.categoria, formatoFecha(gasto.fecha), gasto.notas]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-rose-300 tabular-nums">{formatoDinero(gasto.monto)}</span>
                <div className="hidden shrink-0 sm:block">
                  <Insignia color={colorCategoriaGasto[gasto.categoria] ?? 'slate'}>
                    {etiquetaCategoriaGasto[gasto.categoria] ?? gasto.categoria}
                  </Insignia>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <BotonIcono etiqueta="Editar" onClick={() => abrirEdicion(gasto)}>
                    <Pencil size={15} />
                  </BotonIcono>
                  <BotonIcono
                    etiqueta="Eliminar"
                    onClick={() => setPorEliminar(gasto)}
                    className="hover:bg-red-400/10 hover:text-red-300"
                  >
                    <Trash2 size={15} />
                  </BotonIcono>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Modal abierto={modalAbierto} titulo={editandoId ? 'Editar gasto' : 'Nuevo gasto'} onCerrar={() => setModalAbierto(false)}>
        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Concepto *" className="sm:col-span-2">
            <Entrada
              required
              value={formulario.concepto}
              onChange={(evento) => setFormulario({ ...formulario, concepto: evento.target.value })}
              placeholder="Ej. Hosting, publicidad, honorarios…"
            />
          </Campo>
          <Campo etiqueta="Categoría">
            <Selector
              value={formulario.categoria}
              onChange={(evento) => setFormulario({ ...formulario, categoria: evento.target.value })}
            >
              {CATEGORIAS_GASTO.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {etiquetaCategoriaGasto[categoria]}
                </option>
              ))}
            </Selector>
          </Campo>
          <Campo etiqueta="Monto (RD$) *">
            <Entrada
              required
              type="number"
              min="0"
              step="0.01"
              value={formulario.monto}
              onChange={(evento) => setFormulario({ ...formulario, monto: evento.target.value })}
              placeholder="0.00"
            />
          </Campo>
          <Campo etiqueta="Fecha">
            <Entrada
              type="date"
              value={formulario.fecha}
              onChange={(evento) => setFormulario({ ...formulario, fecha: evento.target.value })}
            />
          </Campo>
          <Campo etiqueta="Notas" className="sm:col-span-2">
            <AreaTexto
              value={formulario.notas}
              onChange={(evento) => setFormulario({ ...formulario, notas: evento.target.value })}
              placeholder="Detalle del gasto (opcional)"
            />
          </Campo>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Registrar gasto'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar gasto"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          if (porEliminar) void eliminar(porEliminar.id)
          setPorEliminar(null)
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar el gasto{' '}
              <strong className="text-tinta">{porEliminar.concepto}</strong>? Esta acción no se puede deshacer.
            </>
          ) : null
        }
      />
    </section>
  )
}
