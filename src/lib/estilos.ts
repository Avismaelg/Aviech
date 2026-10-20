/** Une clases de Tailwind omitiendo valores falsy. */
export function cx(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(' ')
}

/** Clase base compartida por todos los campos de formulario. */
export const claseEntrada =
  'w-full rounded-xl border border-borde bg-superficie px-3.5 py-2.5 text-sm text-tinta shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition-colors placeholder:text-tinta-tenue hover:border-slate-300 focus:border-blue-500 focus:bg-superficie focus:outline-none focus:ring-4 focus:ring-blue-500/10'
