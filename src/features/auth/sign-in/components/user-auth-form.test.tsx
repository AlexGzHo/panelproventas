import type { AuthError, Session, User } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { UserAuthForm } from './user-auth-form'
import { supabase } from '@/lib/supabase'

const navigate = vi.fn()
const setSessionMock = vi.fn()
const fetchPerfilMock = vi.fn().mockResolvedValue(null)

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}))

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    setSession: setSessionMock,
    fetchPerfil: fetchPerfilMock,
  }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
    Link: ({
      children,
      to,
      className,
      ...rest
    }: {
      children?: React.ReactNode
      to: string
      className?: string
    }) => (
      <a href={to} className={className} {...rest}>
        {children}
      </a>
    ),
  }
})

describe('UserAuthForm', () => {
  describe('Rendering without redirectTo', () => {
    let screen: RenderResult
    let emailInput: Locator
    let passwordInput: Locator
    let signInButton: Locator
    let forgotPasswordLink: Locator

    beforeEach(async () => {
      vi.clearAllMocks()
      screen = await render(<UserAuthForm />)
      emailInput = screen.getByRole('textbox', {
        name: /correo electrónico/i,
      })
      passwordInput = screen.getByLabelText(/contraseña/i)
      signInButton = screen.getByRole('button', {
        name: /iniciar sesión/i,
      })
      forgotPasswordLink = screen.getByText(/¿olvidaste tu contraseña\?/i)
    })

    it('renders fields, submit button, and forgot password link', async () => {
      await expect.element(emailInput).toBeInTheDocument()
      await expect.element(passwordInput).toBeInTheDocument()
      await expect.element(signInButton).toBeInTheDocument()
      await expect.element(forgotPasswordLink).toBeInTheDocument()
    })

    it('shows validation messages when submitting empty form', async () => {
      await userEvent.click(signInButton)

      await expect
        .element(screen.getByText(/ingresa tu correo electrónico/i))
        .toBeInTheDocument()
      await expect
        .element(screen.getByText(/ingresa tu contraseña/i))
        .toBeInTheDocument()
    })

    it('authenticates and navigates to default route on success', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          session: {
            user: { id: 'user-123', email: 'admin@proventas.pe' },
          } as unknown as Session,
          user: { id: 'user-123', email: 'admin@proventas.pe' } as unknown as User,
        },
        error: null,
      })

      await userEvent.fill(emailInput, 'admin@proventas.pe')
      await userEvent.fill(passwordInput, 'secreto123')

      await userEvent.click(signInButton)

      await vi.waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'admin@proventas.pe',
          password: 'secreto123',
        })
      })

      await vi.waitFor(() => {
        expect(setSessionMock).toHaveBeenCalledOnce()
        expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true })
      })
    })

    it('shows error alert on invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { session: null, user: null },
        error: {
          name: 'AuthApiError',
          message: 'Invalid login credentials',
          status: 400,
        } as unknown as AuthError,
      })

      await userEvent.fill(emailInput, 'err@proventas.pe')
      await userEvent.fill(passwordInput, 'malaclave')
      await userEvent.click(signInButton)

      await vi.waitFor(() => {
        expect(
          screen.getByText(/correo o contraseña incorrectos/i)
        ).toBeInTheDocument()
      })
      expect(navigate).not.toHaveBeenCalled()
    })
  })

  it('navigates to redirectTo when provided on success', async () => {
    vi.clearAllMocks()

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'user-123', email: 'admin@proventas.pe' },
        } as unknown as Session,
        user: { id: 'user-123', email: 'admin@proventas.pe' } as unknown as User,
      },
      error: null,
    })

    const screen = await render(<UserAuthForm redirectTo='/ventas' />)

    await userEvent.fill(
      screen.getByRole('textbox', { name: /correo electrónico/i }),
      'admin@proventas.pe'
    )
    await userEvent.fill(screen.getByLabelText(/contraseña/i), 'secreto123')

    await userEvent.click(
      screen.getByRole('button', { name: /iniciar sesión/i })
    )

    await vi.waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        to: '/ventas',
        replace: true,
      })
    })
  })
})
