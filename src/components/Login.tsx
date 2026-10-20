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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 lg:px-8">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="animar-entrada relative grid w-full max-w-6xl items-stretch gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
        {/* Panel de marca (escritorio) */}
        <aside className="relative hidden overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#071228] via-[#0c2148] to-[#123e8c] p-10 text-white shadow-2xl shadow-blue-950/25 lg:flex lg:flex-col">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full border border-white/10"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute top-6 -right-10 h-52 w-52 rounded-full border border-white/[0.06]"
          />
          <span
            aria-hidden
            className="font-display pointer-events-none absolute -right-6 -bottom-16 text-[17rem] leading-none font-bold text-white/[0.04] select-none"
          >
            A
          </span>

          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-xl font-bold text-white shadow-md shadow-blue-950/30 ring-1 ring-white/15">
              A
            </span>
            <div>
              <p className="font-display text-lg font-semibold">AviTech Solutions Group</p>
              <p className="text-xs text-slate-400">Auditoría · Contabilidad · Software · Asesoría legal</p>
            </div>
          </div>

          <div className="relative mt-16 max-w-md">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-sky-300 uppercase">Tu firma, en orden</p>
            <h1 className="text-[34px] leading-[1.15] font-semibold tracking-tight text-white">
              El centro de operaciones de tu firma, en un solo lugar.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Clientes, igualas mensuales, pagos, facturación con NCF y reportes — sin hojas de cálculo sueltas.
            </p>

            <ul className="mt-9 space-y-3.5 text-sm text-slate-200">
              {BENEFICIOS.map((beneficio) => (
                <li key={beneficio} className="flex items-start gap-2.5">
                  <CircleCheck size={17} className="mt-0.5 shrink-0 text-sky-300" />
                  {beneficio}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative mt-auto pt-10 text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Sistema privado · Acceso restringido
          </p>
        </aside>

        {/* Tarjeta de acceso */}
        <div className="flex w-full items-center">
          <div className="w-full rounded-3xl border border-borde bg-superficie p-7 shadow-xl shadow-slate-900/10 sm:p-9">
            <header className="mb-7 text-center">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-xl font-bold text-white shadow-md shadow-blue-600/25 ring-1 ring-white/20 lg:hidden">
                A
              </span>
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
                <LockKeyhole size={12} /> Acceso privado
              </p>
              <h2 className="text-[28px] leading-tight font-semibold tracking-tight text-tinta">AviTech Panel</h2>
              <p className="mt-1.5 text-sm text-tinta-suave">Acceso del personal</p>
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
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setVerClave((valor) => !valor)}
                    title={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1.5 text-tinta-tenue transition-colors hover:bg-superficie-2 hover:text-tinta"
                  >
                    {verClave ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Campo>

              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  {error}
                </p>
              )}

              <Boton type="submit" disabled={cargando} className="w-full">
                {cargando && <Loader2 size={16} className="animate-spin" />}
                {cargando ? 'Entrando…' : 'Entrar'}
              </Boton>
            </form>

            <p className="mt-6 text-center text-xs leading-relaxed text-tinta-tenue">
              ¿Necesitas acceso? Pídele al administrador que cree tu usuario.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
