import type { Database } from '@/types/database'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { clearAuthCache } from '@/lib/auth-cache'
import { supabase } from '@/lib/supabase'

export type Perfil = Database['public']['Tables']['perfiles']['Row']

interface AuthState {
  session: Session | null
  user: User | null
  perfil: Perfil | null
  isLoading: boolean
  isInitialized: boolean
  recoverySession: string | null
  setSession: (session: Session | null) => void
  setPerfil: (perfil: Perfil | null) => void
  fetchPerfil: (userId: string) => Promise<Perfil | null>
  initialize: () => Promise<void>
  handleAuthEvent: (event: AuthChangeEvent, session: Session | null) => void
  canRecoverPassword: () => boolean
  finishRecovery: () => void
  signOut: () => Promise<void>
  auth: { user: Perfil | null; reset: () => void }
}

// Ignore responses from requests started before logout or an identity change.
let generation = 0
let initialization: Promise<void> | undefined

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  perfil: null,
  isLoading: true,
  isInitialized: false,
  recoverySession: null,

  setSession: (session) => {
    const changedIdentity = get().session?.user.id !== session?.user.id
    if (changedIdentity || !session) {
      generation++
      clearAuthCache()
      set({
        perfil: null,
        recoverySession: null,
        auth: {
          user: null,
          reset: () => {
            void get().signOut()
          },
        },
      })
    }
    set({ session, user: session?.user ?? null })
  },

  setPerfil: (perfil) => {
    set({
      perfil,
      auth: {
        user: perfil,
        reset: () => {
          void get().signOut()
        },
      },
    })
  },

  fetchPerfil: async (userId) => {
    const started = generation
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (started !== generation || get().user?.id !== userId) return null
      if (error || !data) {
        get().setPerfil(null)
        return null
      }
      get().setPerfil(data)
      return data
    } catch {
      if (started === generation) get().setPerfil(null)
      return null
    }
  },

  initialize: () => {
    if (initialization) return initialization
    const started = generation
    set({ isLoading: true })
    initialization = (async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error
        if (started !== generation) return
        get().setSession(session)
        if (session?.user) await get().fetchPerfil(session.user.id)
      } finally {
        set({ isLoading: false, isInitialized: true })
        initialization = undefined
      }
    })()
    return initialization
  },

  handleAuthEvent: (event, session) => {
    get().setSession(session)
    if (event === 'PASSWORD_RECOVERY' && session) {
      set({ recoverySession: session.access_token })
    } else if (
      event === 'TOKEN_REFRESHED' &&
      session &&
      get().recoverySession
    ) {
      set({ recoverySession: session.access_token })
    } else if (
      event === 'SIGNED_IN' ||
      event === 'SIGNED_OUT' ||
      event === 'USER_UPDATED'
    ) {
      set({ recoverySession: null })
    }
  },

  canRecoverPassword: () => {
    const { session, recoverySession } = get()
    return (
      !!session &&
      recoverySession === session.access_token &&
      typeof session.expires_at === 'number' &&
      session.expires_at * 1000 > Date.now()
    )
  },
  finishRecovery: () => set({ recoverySession: null }),

  signOut: async () => {
    get().setSession(null)
    set({ isLoading: false, isInitialized: true })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        const result = await supabase.auth.signOut({ scope: 'local' })
        if (result.error) throw result.error
      }
    } finally {
      get().setSession(null)
    }
  },

  auth: {
    user: null,
    reset: () => {
      void get().signOut()
    },
  },
}))
