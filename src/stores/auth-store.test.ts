import type { Session, User } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from './auth-store'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(),
  },
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      session: null,
      user: null,
      perfil: null,
      isLoading: false,
      isInitialized: false,
      auth: {
        user: null,
        reset: () => {},
      },
    })
  })

  it('starts with empty session, user and perfil', () => {
    const state = useAuthStore.getState()
    expect(state.session).toBeNull()
    expect(state.user).toBeNull()
    expect(state.perfil).toBeNull()
  })

  it('sets session and derives user', () => {
    const mockSession = {
      user: { id: 'usr-1', email: 'test@proventas.pe' },
    } as unknown as Session

    useAuthStore.getState().setSession(mockSession)

    const state = useAuthStore.getState()
    expect(state.session).toBe(mockSession)
    expect(state.user?.id).toBe('usr-1')
  })

  it('sets perfil and mirrors to auth.user', () => {
    const mockPerfil = {
      id: 'usr-1',
      nombre: 'Administradora',
      rol: 'admin',
      creado_en: '2026-11-11T00:00:00Z',
    }

    useAuthStore.getState().setPerfil(mockPerfil)

    const state = useAuthStore.getState()
    expect(state.perfil).toBe(mockPerfil)
    expect(state.auth.user).toBe(mockPerfil)
  })

  it('signOut clears session, user, and perfil', async () => {
    useAuthStore.setState({
      session: { user: { id: 'usr-1' } } as unknown as Session,
      user: { id: 'usr-1' } as unknown as User,
      perfil: { id: 'usr-1', nombre: 'Admin', rol: 'admin', creado_en: '' },
    })

    await useAuthStore.getState().signOut()

    expect(supabase.auth.signOut).toHaveBeenCalledOnce()
    const state = useAuthStore.getState()
    expect(state.session).toBeNull()
    expect(state.user).toBeNull()
    expect(state.perfil).toBeNull()
  })
})
