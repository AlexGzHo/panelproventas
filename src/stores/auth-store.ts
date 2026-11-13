import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type Perfil = Database['public']['Tables']['perfiles']['Row']

interface AuthState {
  session: Session | null
  user: User | null
  perfil: Perfil | null
  isLoading: boolean
  isInitialized: boolean

  setSession: (session: Session | null) => void
  setPerfil: (perfil: Perfil | null) => void
  fetchPerfil: (userId: string) => Promise<Perfil | null>
  initialize: () => Promise<void>
  signOut: () => Promise<void>

  // Compatibilidad con componentes existentes
  auth: {
    user: Perfil | null
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  perfil: null,
  isLoading: true,
  isInitialized: false,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      auth: {
        user: get().perfil,
        reset: () => get().signOut(),
      },
    })
  },

  setPerfil: (perfil) => {
    set({
      perfil,
      auth: {
        user: perfil,
        reset: () => get().signOut(),
      },
    })
  },

  fetchPerfil: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        // Fallback básico si aún no hay fila de perfil
        return null
      }

      get().setPerfil(data)
      return data
    } catch {
      return null
    }
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ session, user: session?.user ?? null })

      if (session?.user) {
        await get().fetchPerfil(session.user.id)
      } else {
        set({ perfil: null })
      }
    } finally {
      set({ isLoading: false, isInitialized: true })
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      set({
        session: null,
        user: null,
        perfil: null,
        isLoading: false,
        auth: {
          user: null,
          reset: () => {},
        },
      })
    }
  },

  auth: {
    user: null,
    reset: () => {
      get().signOut()
    },
  },
}))
