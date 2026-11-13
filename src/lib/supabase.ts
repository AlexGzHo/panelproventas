import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const mensaje =
    'Faltan variables de entorno de Supabase. Asegúrate de configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env.local.'
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error(mensaje)
  }
  throw new Error(mensaje)
}

/**
 * Cliente de Supabase tipado con el esquema de PANEL PROVENTAS.
 * Usa exclusivamente la clave pública anon (RLS activo en base de datos).
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
