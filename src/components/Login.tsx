import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

function mensajeDeError(mensaje: string): string {
  if (mensaje.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (mensaje.includes('Email not confirmed')) return 'Debes confirmar tu correo antes de entrar.'
  if (mensaje.includes('at least 6 characters')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (mensaje.includes('is invalid')) return 'El formato del correo no es válido.'
  return mensaje
}

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!supabase || cargando) return
    setCargando(true)
    setError(null)

    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (err) setError(mensajeDeError(err.message))
    setCargando(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">AviTech Panel</h1>
          <p className="mt-1 text-sm text-slate-500">Acceso del personal</p>
        </header>

        <form onSubmit={enviar} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">Entrar</h2>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Correo</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@correo.com"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Contraseña</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>

          {error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {cargando ? 'Procesando…' : 'Entrar'}
          </button>

          <p className="text-center text-xs text-slate-400">
            ¿Necesitas acceso? Pídele al administrador que cree tu usuario.
          </p>
        </form>
      </div>
    </div>
  )
}
