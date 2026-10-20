import { X } from 'lucide-react'
import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { claseEntrada, cx } from '../lib/estilos'
import type { ColorInsignia } from '../lib/etiquetas'

const variantesBoton = {
  primario:
    'border border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:border-blue-700 hover:bg-blue-700',
  secundario:
    'border border-borde bg-superficie text-tinta hover:border-slate-300 hover:bg-superficie-2',
  peligro:
    'border border-red-600 bg-red-600 text-white shadow-sm shadow-red-600/20 hover:border-red-700 hover:bg-red-700',
  fantasma: 'text-tinta-suave hover:bg-superficie-2 hover:text-tinta',
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
        'inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        variantesBoton[variante],
        className,
      )}
    />
  )
}

/** Botón compacto solo con icono (acciones de tablas y listas). Siempre con etiqueta accesible. */
export function BotonIcono({
  etiqueta,
  className,
  ...propiedades
}: ButtonHTMLAttributes<HTMLButtonElement> & { etiqueta: string }) {
  return (
    <button
      {...propiedades}
      type={propiedades.type ?? 'button'}
      title={etiqueta}
      aria-label={etiqueta}
      className={cx(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-tinta-tenue transition-colors duration-150 hover:bg-superficie-2 hover:text-tinta disabled:cursor-not-allowed disabled:opacity-40',
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
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
}

export function Insignia({ color = 'slate', children }: { color?: ColorInsignia; children: ReactNode }) {
  return (
    <span
      className={cx(
        'insignia inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        coloresInsignia[color],
      )}
    >
      {children}
    </span>
  )
}

export function Tarjeta({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-borde bg-superficie shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-22px_rgba(15,23,42,0.18)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CabeceraSeccion({ titulo, descripcion, acciones }: { titulo: string; descripcion?: string; acciones?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-[27px] leading-tight font-semibold tracking-tight text-tinta sm:text-[30px]">{titulo}</h2>
        {descripcion && <p className="mt-1.5 text-sm text-tinta-suave">{descripcion}</p>}
      </div>
      {acciones}
    </div>
  )
}

export function Campo({ etiqueta, className, children }: { etiqueta: string; className?: string; children: ReactNode }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1.5 block text-xs font-semibold text-tinta-suave">{etiqueta}</span>
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
  const contenedor = useRef<HTMLDivElement>(null)
  // La referencia evita reiniciar el efecto (y robar el foco) cada vez que el
  // formulario se vuelve a renderizar por una tecla.
  const cerrarRef = useRef(onCerrar)

  useEffect(() => {
    cerrarRef.current = onCerrar
  }, [onCerrar])

  useEffect(() => {
    if (!abierto) return
    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === 'Escape') cerrarRef.current()
    }
    const desbordeAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', alTeclear)
    const enfoque = window.setTimeout(() => {
      const primero =
        contenedor.current?.querySelector<HTMLElement>('[data-autofoco]') ??
        contenedor.current?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea')
      primero?.focus()
    }, 40)
    return () => {
      document.body.style.overflow = desbordeAnterior
      window.removeEventListener('keydown', alTeclear)
      window.clearTimeout(enfoque)
    }
  }, [abierto])

  if (!abierto) return null
  return (
    <div
      role="presentation"
      onMouseDown={onCerrar}
      className="animar-fundido fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center"
    >
      <div
        ref={contenedor}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onMouseDown={(evento) => evento.stopPropagation()}
        className={cx(
          'animar-modal max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-borde bg-superficie shadow-2xl shadow-slate-900/25',
          ancho,
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-borde-suave bg-superficie px-5 py-4">
          <h3 className="text-base font-semibold text-tinta">{titulo}</h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-full p-1.5 text-tinta-tenue transition-colors hover:bg-superficie-2 hover:text-tinta"
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
      <div className="text-sm text-tinta-suave">{mensaje}</div>
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

export function Vacio({
  icono,
  titulo,
  texto,
  accion,
}: {
  icono: ReactNode
  titulo: string
  texto?: string
  accion?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-14 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-superficie-2 text-tinta-tenue">
        {icono}
      </div>
      <p className="text-sm font-semibold text-tinta">{titulo}</p>
      {texto && <p className="max-w-sm text-sm text-tinta-suave">{texto}</p>}
      {accion && <div className="mt-3">{accion}</div>}
    </div>
  )
}

export function FilasCargando({ filas = 4 }: { filas?: number }) {
  return (
    <div className="space-y-2.5 p-4">
      {Array.from({ length: filas }).map((_, indice) => (
        <div key={indice} className="h-11 animate-pulse rounded-lg bg-superficie-2" />
      ))}
    </div>
  )
}

export function ErrorTabla({ mensaje }: { mensaje: string }) {
  return (
    <div className="m-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {mensaje}
    </div>
  )
}
