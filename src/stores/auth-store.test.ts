import { isCancelledError, QueryClient } from '@tanstack/react-query'
import { AuthError, type Session, type User } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registerAuthQueryClient } from '@/lib/auth-cache'
import { supabase } from '@/lib/supabase'
import { useAuthStore, type Perfil } from './auth-store'

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
      recoverySession: null,
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

const sessionFor = (id: string, token = id): Session => ({
  access_token: token,
  refresh_token: 'test-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: { id } as User,
})

describe('security regressions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().setSession(null)
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })
  })

  it.each(['logout', 'SIGNED_OUT', 'identity'] as const)(
    'clears queries, mutations and previous profile on %s',
    async (action) => {
      const client = new QueryClient()
      registerAuthQueryClient(client)
      const store = useAuthStore.getState()
      store.setSession(sessionFor('first'))
      store.setPerfil({
        id: 'first',
        nombre: 'Privado',
        rol: 'admin',
        creado_en: '',
      })
      client.setQueryData(['clientes'], [{ nombre: 'Privado' }])
      await client
        .getMutationCache()
        .build(client, { mutationFn: async () => 'Privado' })
        .execute(undefined)
      if (action === 'logout') await store.signOut()
      else if (action === 'SIGNED_OUT')
        store.handleAuthEvent('SIGNED_OUT', null)
      else store.handleAuthEvent('SIGNED_IN', sessionFor('second'))
      expect(client.getQueryCache().getAll()).toHaveLength(0)
      expect(client.getMutationCache().getAll()).toHaveLength(0)
      expect(useAuthStore.getState().perfil).toBeNull()
      expect(useAuthStore.getState().auth.user).toBeNull()
      if (action !== 'identity') expect(useAuthStore.getState().user).toBeNull()
    }
  )

  it('ignores a profile response that arrives after logout', async () => {
    let resolve!: (value: { data: Perfil; error: null }) => void
    const response = new Promise<{ data: Perfil; error: null }>((done) => {
      resolve = done
    })
    const single = vi.fn().mockReturnValue(response)
    vi.mocked(supabase.from).mockReturnValue({
      select: () => ({ eq: () => ({ single }) }),
    } as unknown as ReturnType<typeof supabase.from>)
    useAuthStore.getState().setSession(sessionFor('first'))
    const pending = useAuthStore.getState().fetchPerfil('first')
    await useAuthStore.getState().signOut()
    resolve({
      data: { id: 'first', nombre: 'Anterior', rol: 'admin', creado_en: '' },
      error: null,
    })
    await pending
    expect(useAuthStore.getState().perfil).toBeNull()
    expect(useAuthStore.getState().auth.user).toBeNull()
  })

  it('cancels an in-flight query so it cannot restore private cache', async () => {
    const client = new QueryClient()
    registerAuthQueryClient(client)
    useAuthStore.getState().setSession(sessionFor('first'))
    let resolve!: (value: string) => void
    const pending = client
      .fetchQuery({
        queryKey: ['secret'],
        queryFn: () =>
          new Promise<string>((done) => {
            resolve = done
          }),
      })
      .catch((error: unknown) => {
        expect(isCancelledError(error)).toBe(true)
      })
    await useAuthStore.getState().signOut()
    resolve('old private data')
    await pending
    expect(client.getQueryData(['secret'])).toBeUndefined()
  })

  it('falls back to local logout if remote revocation fails', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
      error: new AuthError('offline'),
    })
    await useAuthStore.getState().signOut()
    expect(supabase.auth.signOut).toHaveBeenLastCalledWith({ scope: 'local' })
    expect(useAuthStore.getState().session).toBeNull()
  })

  it('requires PASSWORD_RECOVERY, a matching unexpired session and consumes permission', () => {
    const store = useAuthStore.getState()
    const session = sessionFor('first')
    store.handleAuthEvent('SIGNED_IN', session)
    expect(store.canRecoverPassword()).toBe(false)
    store.handleAuthEvent('PASSWORD_RECOVERY', session)
    expect(store.canRecoverPassword()).toBe(true)
    store.finishRecovery()
    expect(store.canRecoverPassword()).toBe(false)
    store.handleAuthEvent('PASSWORD_RECOVERY', { ...session, expires_at: 1 })
    expect(store.canRecoverPassword()).toBe(false)
    store.handleAuthEvent('PASSWORD_RECOVERY', session)
    store.handleAuthEvent('SIGNED_IN', sessionFor('second'))
    expect(store.canRecoverPassword()).toBe(false)
  })

  it('never calls another Supabase method within the auth event callback', () => {
    useAuthStore.getState().handleAuthEvent('SIGNED_IN', sessionFor('first'))
    expect(supabase.from).not.toHaveBeenCalled()
    expect(supabase.auth.getSession).not.toHaveBeenCalled()
  })
})
