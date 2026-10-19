import { X } from 'lucide-react'
import {
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { claseEntrada, cx } from '../lib/estilos'
import type { ColorInsignia } from '../lib/etiquetas'

const variantesBoton = {
  primario: 'bg-indigo-600 text-white hover:bg-indigo-500',
  secundario: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  peligro: 'bg-red-600 text-white hover:bg-red-500',
  fantasma: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
}

export function Boton({
  variante = 'primario',
  className,
  ...propiedades
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: keyof typeof variantesBoton }) {
  return (
    <button
      {...propiedades}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variantesBoton[variante],
        className,
      )}
    />
  )
}

const coloresInsignia: Record<ColorInsignia, string> = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  sky: 'border-sky-200 bg-sky-50 text-sky-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  slate: 'border-slate-200 bg-slate-50 text-slate-600',
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
}

export function Insignia({ color = 'slate', children }: { color?: ColorInsignia; children: ReactNode }) {
  return (
    <span className={cx('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap', coloresInsignia[color])}>
      {children}
    </span>
  )
}

export function Tarjeta({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>{children}</div>
}

export function CabeceraSeccion({ titulo, descripcion, acciones }: { titulo: string; descripcion?: string; acciones?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{titulo}</h2>
        {descripcion && <p className="mt-0.5 text-sm text-slate-500">{descripcion}</p>}
      </div>
      {acciones}
    </div>
  )
}

export function Campo({ etiqueta, className, children }: { etiqueta: string; className?: string; children: ReactNode }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1 block text-xs font-medium text-slate-600">{etiqueta}</span>
      {children}
    </label>
  )
}

export function Entrada({ className, ...propiedades }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...propiedades} className={cx(claseEntrada, className)} />
}

export function Selector({ className, ...propiedades }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...propiedades} className={cx(claseEntrada, className)} />
}

export function AreaTexto({ className, ...propiedades }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...propiedades} className={cx(claseEntrada, 'min-h-20 resize-y', className)} />
}

export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
  ancho = 'sm:max-w-lg',
}: {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  ancho?: string
}) {
  useEffect(() => {
    if (!abierto) return
    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [abierto, onCerrar])

  if (!abierto) return null
  return (
    <div
      role="presentation"
      onMouseDown={onCerrar}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-[2px] sm:items-center"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onMouseDown={(evento) => evento.stopPropagation()}
        className={cx('max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-xl', ancho)}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3.5">
          <h3 className="text-base font-semibold text-slate-900">{titulo}</h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export function Confirmar({
  abierto,
  titulo,
  mensaje,
  textoBoton = 'Eliminar',
  onCancelar,
  onConfirmar,
}: {
  abierto: boolean
  titulo: string
  mensaje: ReactNode
  textoBoton?: string
  onCancelar: () => void
  onConfirmar: () => void
}) {
  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCancelar} ancho="sm:max-w-md">
      <div className="text-sm text-slate-600">{mensaje}</div>
      <div className="mt-4 flex justify-end gap-2">
        <Boton variante="secundario" type="button" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton variante="peligro" type="button" onClick={onConfirmar}>
          {textoBoton}
        </Boton>
      </div>
    </Modal>
  )
}

export function Vacio({ icono, titulo, texto }: { icono: ReactNode; titulo: string; texto?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-14 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">{icono}</div>
      <p className="text-sm font-medium text-slate-700">{titulo}</p>
      {texto && <p className="max-w-sm text-sm text-slate-500">{texto}</p>}
    </div>
  )
}

export function FilasCargando({ filas = 4 }: { filas?: number }) {
  return (
    <div className="space-y-2.5 p-4">
      {Array.from({ length: filas }).map((_, indice) => (
        <div key={indice} className="h-11 animate-pulse rounded-lg bg-slate-100" />
      ))}
    </div>
  )
}

export function ErrorTabla({ mensaje }: { mensaje: string }) {
  return <div className="m-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{mensaje}</div>
}
