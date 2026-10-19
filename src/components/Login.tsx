import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { Boton, Campo, Entrada } from './ui'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-indigo-600/25 blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-violet-600/25 blur-[110px]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"
      />

      <div className="animar-entrada relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/60 backdrop-blur-2xl">
        <header className="mb-7 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/40 ring-1 ring-white/20">
            A
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-white">AviTech Panel</h1>
          <p className="mt-1 text-sm text-slate-400">Acceso del personal</p>
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
            <Entrada
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              placeholder="••••••••"
            />
          </Campo>

          {error && (
            <p className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}

          <Boton type="submit" disabled={cargando} className="w-full">
            {cargando ? 'Entrando…' : 'Entrar'}
          </Boton>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">¿Necesitas acceso? Pídele al administrador que cree tu usuario.</p>
      </div>
    </div>
  )
}
