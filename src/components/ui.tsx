import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
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
    'border border-accion bg-accion text-superficie shadow-[0_10px_24px_-18px_rgba(20,20,19,0.7)] hover:border-accion-hover hover:bg-accion-hover',
  secundario:
    'border border-tinta/20 bg-superficie text-tinta hover:border-tinta/45 hover:bg-arena/60',
  peligro:
    'border border-peligro bg-peligro text-white shadow-[0_10px_24px_-18px_rgba(180,35,24,0.65)] hover:border-[#991b12] hover:bg-[#991b12]',
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
        'inline-flex items-center justify-center gap-1.5 rounded-[20px] px-5 py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
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
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-tinta-tenue transition-colors duration-150 hover:bg-arena hover:text-clay disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
    />
  )
}

const coloresInsignia: Record<ColorInsignia, string> = {
  emerald: 'border-exito-borde bg-exito-suave text-exito',
  amber: 'border-aviso-borde bg-aviso-suave text-aviso',
  sky: 'border-info-borde bg-info-suave text-info',
  red: 'border-peligro-borde bg-peligro-suave text-peligro',
  slate: 'border-borde bg-superficie-2 text-tinta-suave',
  blue: 'border-arena-borde bg-arena text-clay',
  cyan: 'border-info-borde bg-info-suave text-info',
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
        'min-w-0 rounded-[28px] border border-borde bg-superficie shadow-[0_1px_0_rgba(20,20,19,0.03),0_24px_48px_-34px_rgba(20,20,19,0.3)]',
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
        <h2 className="text-[28px] leading-tight font-medium tracking-[-0.025em] text-tinta sm:text-[32px]">{titulo}</h2>
        {descripcion && <p className="mt-1.5 max-w-2xl text-sm text-tinta-suave">{descripcion}</p>}
      </div>
      {acciones}
    </div>
  )
}

export function Campo({ etiqueta, className, children }: { etiqueta: string; className?: string; children: ReactNode }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.08em] text-tinta-suave uppercase">{etiqueta}</span>
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
  return <textarea {...propiedades} className={cx(claseEntrada, 'min-h-20 resize-y rounded-[24px]', className)} />
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
  // Portal al body: evita que un ancestro con animación/transform recorte el
  // modal fijo (por ejemplo, al abrir el detalle de una solicitud).
  return createPortal(
    <div
      role="presentation"
      onMouseDown={onCerrar}
      className="animar-fundido fixed inset-0 z-50 flex items-end justify-center bg-tinta/45 p-3 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div
        ref={contenedor}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onMouseDown={(evento) => evento.stopPropagation()}
        className={cx(
          'animar-modal max-h-[90vh] w-full overflow-y-auto rounded-[32px] border border-borde bg-superficie shadow-[0_40px_90px_-40px_rgba(20,20,19,0.55)] sm:rounded-[36px]',
          ancho,
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-borde-suave bg-superficie px-5 py-4 sm:px-6">
          <h3 className="text-base font-medium tracking-tight text-tinta">{titulo}</h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-full p-1.5 text-tinta-tenue transition-colors hover:bg-arena hover:text-clay"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>,
    document.body,
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
      <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-arena text-clay ring-1 ring-arena-borde">
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
        <div key={indice} className="h-11 animate-pulse rounded-[18px] bg-superficie-2" />
      ))}
    </div>
  )
}

export function ErrorTabla({ mensaje }: { mensaje: string }) {
  return (
    <div className="m-4 rounded-[20px] border border-aviso-borde bg-aviso-suave px-4 py-3 text-sm text-aviso">
      {mensaje}
    </div>
  )
}
