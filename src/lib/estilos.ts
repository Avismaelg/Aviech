/** Une clases de Tailwind omitiendo valores falsy. */
export function cx(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(' ')
}

/** Clase base compartida por todos los campos de formulario. */
export const claseEntrada =
  'w-full rounded-lg border border-borde bg-fondo/60 px-3 py-2 text-sm text-tinta transition-colors placeholder:text-tinta-tenue hover:border-blue-500/30 focus:border-blue-500/70 focus:bg-fondo focus:outline-none focus:ring-2 focus:ring-blue-500/20'
