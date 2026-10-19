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
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 via-slate-50 to-indigo-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5">
        <header className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white shadow-lg shadow-slate-900/20">
            A
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">AviTech Panel</h1>
          <p className="mt-1 text-sm text-slate-500">Acceso del personal</p>
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

          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <Boton type="submit" disabled={cargando} className="w-full">
            {cargando ? 'Entrando…' : 'Entrar'}
          </Boton>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">¿Necesitas acceso? Pídele al administrador que cree tu usuario.</p>
      </div>
    </div>
  )
}
