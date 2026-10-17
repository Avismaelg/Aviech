import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import type { Cliente } from '../types/cliente'

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    if (!supabase) return
    const { data, error: err } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError(
        err.code === 'PGRST205' || err.message.includes('does not exist')
          ? 'La tabla "clientes" todavía no existe. Ejecuta supabase/sql/001_clientes.sql en el SQL Editor de Supabase.'
          : `No se pudieron cargar los clientes: ${err.message}`,
      )
    } else {
      setError(null)
      setClientes((data ?? []) as Cliente[])
    }
    setCargando(false)
  }, [])

  useEffect(() => {
    // Carga inicial desde Supabase (sistema externo). El setState ocurre después del
    // await, por lo que el aviso "set-state-in-effect" no aplica aquí.
    // eslint-disable-next-line react/set-state-in-effect
    void cargar()
  }, [cargar])

  async function agregar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!supabase || guardando || !nombre.trim()) return
    setGuardando(true)
    setError(null)

    const { error: err } = await supabase.from('clientes').insert({
      nombre: nombre.trim(),
      email: email.trim() || null,
      telefono: telefono.trim() || null,
    })

    if (err) {
      setError(`No se pudo guardar: ${err.message}`)
    } else {
      setNombre('')
      setEmail('')
      setTelefono('')
      setCargando(true)
      await cargar()
    }
    setGuardando(false)
  }

  async function eliminar(cliente: Cliente) {
    if (!supabase) return
    if (!window.confirm(`¿Eliminar a ${cliente.nombre}?`)) return

    const { error: err } = await supabase.from('clientes').delete().eq('id', cliente.id)
    if (err) {
      setError(`No se pudo eliminar: ${err.message}`)
    } else {
      setCargando(true)
      await cargar()
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-medium text-slate-900">Clientes</h2>

      <form onSubmit={agregar} className="mt-4 grid gap-3 sm:grid-cols-4">
        <input
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none sm:col-span-2"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo (opcional)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <input
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Teléfono (opcional)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 sm:col-span-4 sm:justify-self-start"
        >
          {guardando ? 'Guardando…' : 'Agregar cliente'}
        </button>
      </form>

      {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <ul className="mt-6 divide-y divide-slate-100">
        {cargando && <li className="py-3 text-sm text-slate-500">Cargando…</li>}
        {!cargando && clientes.length === 0 && !error && (
          <li className="py-3 text-sm text-slate-500">Todavía no hay clientes registrados.</li>
        )}
        {!cargando &&
          clientes.map((cliente) => (
            <li key={cliente.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{cliente.nombre}</p>
                <p className="truncate text-sm text-slate-500">
                  {[cliente.email, cliente.telefono].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <time className="text-xs text-slate-400">
                  {new Date(cliente.created_at).toLocaleDateString('es')}
                </time>
                <button
                  type="button"
                  onClick={() => void eliminar(cliente)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
      </ul>
    </section>
  )
}
