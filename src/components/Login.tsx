import { CircleCheck, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { Boton, Campo, Entrada } from './ui'

const BENEFICIOS = [
  'Igualas mensuales de contabilidad, software y asesoría legal',
  'Pagos, facturas con NCF/ITBIS y gastos bajo control',
  'Reportes por cliente y mensuales, listos para imprimir',
]

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verClave, setVerClave] = useState(false)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!supabase) return
    setCargando(true)
    setError(null)
    const { error: errorAcceso } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (errorAcceso) {
      setError(
        errorAcceso.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : `No se pudo entrar: ${errorAcceso.message}`,
      )
    }
    setCargando(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="animar-entrada grid w-full max-w-6xl items-stretch gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
        {/* Panel de marca: tinta cálida, arcos orbitales y tipografía editorial */}
        <aside className="relative hidden min-h-[680px] overflow-hidden rounded-[40px] bg-tinta p-10 text-superficie shadow-[0_40px_90px_-48px_rgba(20,20,19,0.6)] lg:flex lg:flex-col">
          <svg
            aria-hidden
            viewBox="0 0 520 520"
            className="pointer-events-none absolute -top-32 -right-32 h-[560px] w-[560px] text-acento-claro"
            fill="none"
          >
            <circle cx="260" cy="260" r="214" stroke="currentColor" strokeOpacity="0.16" />
            <circle cx="260" cy="260" r="150" stroke="currentColor" strokeOpacity="0.1" />
            <path d="M46 300C130 146 330 104 486 216" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5" />
            <circle cx="486" cy="216" r="6" fill="currentColor" />
          </svg>
          <span
            aria-hidden
            className="font-display pointer-events-none absolute -right-10 -bottom-24 text-[20rem] leading-none font-semibold text-superficie/[0.035] select-none"
          >
            A
          </span>

          <div className="relative flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-superficie text-lg font-semibold text-tinta">
              A
              <span aria-hidden className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-tinta bg-acento-claro" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold tracking-[-0.02em]">AviTech Solutions Group</p>
              <p className="text-[11px] tracking-[0.06em] text-superficie/55 uppercase">
                Auditoría · Contabilidad · Software · Asesoría legal
              </p>
            </div>
          </div>

          <div className="relative my-auto max-w-md py-12">
            <p className="mb-4 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-acento-claro uppercase">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-acento-claro" />
              Tu firma, en orden
            </p>
            <h1 className="text-[44px] leading-[1.02] font-medium tracking-[-0.035em] text-superficie xl:text-[52px]">
              El centro de operaciones de tu firma, en un solo lugar.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-superficie/65">
              Clientes, igualas mensuales, pagos, facturación con NCF y reportes — sin hojas de cálculo sueltas.
            </p>

            <ul className="mt-9 space-y-4 text-sm text-superficie/80">
              {BENEFICIOS.map((beneficio) => (
                <li key={beneficio} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-acento/15 text-acento-claro">
                    <CircleCheck size={13} />
                  </span>
                  {beneficio}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative flex items-center gap-2 text-[9px] font-semibold tracking-[0.18em] text-superficie/45 uppercase">
            <LockKeyhole size={12} /> Sistema privado · Acceso restringido
          </p>
        </aside>

        {/* Tarjeta de acceso */}
        <div className="flex w-full items-center">
          <div className="w-full rounded-[40px] border border-borde bg-superficie p-7 shadow-[0_40px_90px_-50px_rgba(20,20,19,0.45)] sm:p-10">
            <header className="mb-8">
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accion text-sm font-semibold text-superficie">
                  A
                  <span aria-hidden className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-superficie bg-acento" />
                </span>
                <div className="leading-tight">
                  <p className="font-display text-sm font-semibold text-tinta">AviTech Solutions Group</p>
                  <p className="text-[10px] tracking-[0.08em] text-tinta-tenue uppercase">Panel interno</p>
                </div>
              </div>

              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-arena-borde bg-arena px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-clay uppercase">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-acento" /> Acceso privado
              </p>
              <h2 className="text-[32px] leading-tight font-medium tracking-[-0.03em] text-tinta">AviTech Panel</h2>
              <p className="mt-1.5 text-sm text-tinta-suave">Acceso del personal autorizado.</p>
            </header>

            <form onSubmit={enviar} className="space-y-4">
              <Campo etiqueta="Correo">
                <Entrada
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(evento) => setEmail(evento.target.value)}
                  placeholder="tu@correo.com"
                />
              </Campo>
              <Campo etiqueta="Contraseña">
                <div className="relative">
                  <Entrada
                    type={verClave ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(evento) => setPassword(evento.target.value)}
                    placeholder="••••••••"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setVerClave((valor) => !valor)}
                    title={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1.5 text-tinta-tenue transition-colors hover:bg-arena hover:text-clay"
                  >
                    {verClave ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Campo>

              {error && (
                <p role="alert" className="rounded-[20px] border border-peligro-borde bg-peligro-suave px-4 py-3 text-sm text-peligro">
                  {error}
                </p>
              )}

              <Boton type="submit" disabled={cargando} className="w-full">
                {cargando && <Loader2 size={16} className="animate-spin" />}
                {cargando ? 'Entrando…' : 'Entrar al panel'}
              </Boton>
            </form>

            <p className="mt-6 border-t border-borde-suave pt-5 text-center text-xs leading-relaxed text-tinta-tenue">
              ¿Necesitas acceso? Pídele al administrador que cree tu usuario.
            </p>
            <a
              href="/"
              className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-tinta-suave transition-colors hover:text-clay"
            >
              ← Volver al sitio web
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
