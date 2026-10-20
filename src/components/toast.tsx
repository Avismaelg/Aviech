import { CircleAlert, CircleCheck } from 'lucide-react'
import { useCallback, useState, type ReactNode } from 'react'
import { ContextoAvisos, type TipoAviso } from '../lib/avisos'
import { cx } from '../lib/estilos'

interface Aviso {
  id: number
  texto: string
  tipo: TipoAviso
}

export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])

  const mostrar = useCallback((texto: string, tipo: TipoAviso = 'ok') => {
    const id = Date.now() + Math.random()
    setAvisos((anteriores) => [...anteriores, { id, texto, tipo }])
    window.setTimeout(() => {
      setAvisos((anteriores) => anteriores.filter((aviso) => aviso.id !== id))
    }, 3500)
  }, [])

  return (
    <ContextoAvisos.Provider value={mostrar}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[70] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      >
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            className={cx(
              'animar-aviso pointer-events-auto flex items-start gap-2.5 rounded-[20px] border bg-superficie/95 px-4 py-3 shadow-xl shadow-tinta/20 backdrop-blur-xl',
              aviso.tipo === 'ok' ? 'border-exito-borde' : 'border-peligro-borde',
            )}
          >
            {aviso.tipo === 'ok' ? (
              <CircleCheck size={18} className="mt-0.5 shrink-0 text-exito" />
            ) : (
              <CircleAlert size={18} className="mt-0.5 shrink-0 text-peligro" />
            )}
            <p className="text-sm text-tinta">{aviso.texto}</p>
          </div>
        ))}
      </div>
    </ContextoAvisos.Provider>
  )
}
