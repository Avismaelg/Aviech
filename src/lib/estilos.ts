/** Une clases de Tailwind omitiendo valores falsy. */
export function cx(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(' ')
}

/** Clase base compartida por todos los campos de formulario. */
export const claseEntrada =
  'w-full rounded-[20px] border border-borde bg-superficie px-4 py-2.5 text-base text-tinta shadow-[inset_0_1px_2px_rgba(20,20,19,0.03)] transition-colors placeholder:text-tinta-tenue hover:border-tinta/30 focus:border-acento focus:bg-superficie focus:outline-none focus:ring-4 focus:ring-acento/15 sm:text-sm'
