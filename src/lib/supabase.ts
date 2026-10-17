import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** true cuando el archivo .env tiene configurado el proyecto de Supabase */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Cliente compartido de Supabase (null mientras .env no esté configurado).
 * La clave anónima es pública por diseño: la seguridad real se define con
 * Row Level Security (RLS) en la base de datos.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
