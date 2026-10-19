import { CircleCheck, Eye, EyeOff, Loader2 } from 'lucide-react'
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 lg:px-10">
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-indigo-600/25 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-violet-600/25 blur-[110px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"
      />

      <div className="animar-entrada relative grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        {/* Panel de marca (escritorio) */}
        <aside className="hidden lg:block">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/40 ring-1 ring-white/20">
              A
            </span>
            <div>
              <p className="text-lg font-semibold text-white">AviTech Solutions Group</p>
              <p className="text-xs text-slate-400">Auditoría · Contabilidad · Software · Asesoría legal</p>
            </div>
          </div>

          <h1 className="mt-10 max-w-md text-3xl font-semibold tracking-tight text-white">
            El centro de operaciones de tu firma, en un solo lugar.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
            Clientes, igualas mensuales, pagos, facturación con NCF y reportes — sin hojas de cálculo sueltas.
          </p>

          <ul className="mt-10 space-y-3.5 text-sm text-slate-300">
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio} className="flex items-start gap-2.5">
                <CircleCheck size={17} className="mt-0.5 shrink-0 text-emerald-400" />
                {beneficio}
              </li>
            ))}
          </ul>
        </aside>

        {/* Tarjeta de acceso */}
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/60 backdrop-blur-2xl">
          <header className="mb-7 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/40 ring-1 ring-white/20 lg:hidden">
              A
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-white">AviTech Panel</h2>
            <p className="mt-1 text-sm text-slate-400">Acceso del personal</p>
          </header>

          <form onSubmit={enviar} className="space-y-4">
            <Campo etiqueta="Correo">
              <Entrada
                type="email"
                autoComplete="email"
                autoFocus
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
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setVerClave((valor) => !valor)}
                  title={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-tinta-tenue transition-colors hover:text-tinta"
                >
                  {verClave ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Campo>

            {error && (
              <p role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <Boton type="submit" disabled={cargando} className="w-full">
              {cargando && <Loader2 size={16} className="animate-spin" />}
              {cargando ? 'Entrando…' : 'Entrar'}
            </Boton>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            ¿Necesitas acceso? Pídele al administrador que cree tu usuario.
          </p>
        </div>
      </div>
    </div>
  )
}
