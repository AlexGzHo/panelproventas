import type { Session, User } from '@supabase/supabase-js'
import { beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { ResetPasswordForm } from './reset-password-form'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}))
const session: Session = {
  access_token: 'test-recovery',
  refresh_token: 'test-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: { id: 'recovery-user' } as User,
}
beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.getState().setSession(null)
})
it.each(['anonymous', 'ordinary', 'expired'] as const)(
  'blocks direct URL form for %s session',
  async (kind) => {
    if (kind === 'ordinary')
      useAuthStore.getState().handleAuthEvent('SIGNED_IN', session)
    if (kind === 'expired')
      useAuthStore
        .getState()
        .handleAuthEvent('PASSWORD_RECOVERY', { ...session, expires_at: 1 })
    const screen = await render(<ResetPasswordForm />)
    await expect
      .element(
        screen.getByRole('link', { name: 'Solicitar enlace de recuperación' })
      )
      .toHaveAttribute('href', '/forgot-password')
    expect(screen.container.querySelector('input')).toBeNull()
    expect(supabase.auth.updateUser).not.toHaveBeenCalled()
  }
)
it('allows a valid recovery once and consumes permission after successful update', async () => {
  useAuthStore.getState().handleAuthEvent('PASSWORD_RECOVERY', session)
  vi.mocked(supabase.auth.updateUser).mockResolvedValue({
    data: { user: session.user },
    error: null,
  })
  const screen = await render(<ResetPasswordForm />)
  await userEvent.fill(
    screen.getByLabelText('Nueva contraseña', { exact: true }),
    'NuevaClave123!'
  )
  await userEvent.fill(
    screen.getByLabelText('Confirmar nueva contraseña'),
    'NuevaClave123!'
  )
  await userEvent.click(
    screen.getByRole('button', { name: 'Guardar nueva contraseña' })
  )
  await vi.waitFor(() =>
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'NuevaClave123!',
    })
  )
  await expect
    .element(screen.getByText(/Tu contraseña ha sido actualizada/))
    .toBeInTheDocument()
  expect(useAuthStore.getState().canRecoverPassword()).toBe(false)
})
it('does not send a password if recovery is revoked after filling the form', async () => {
  useAuthStore.getState().handleAuthEvent('PASSWORD_RECOVERY', session)
  const screen = await render(<ResetPasswordForm />)
  await userEvent.fill(
    screen.getByLabelText('Nueva contraseña', { exact: true }),
    'NuevaClave123!'
  )
  await userEvent.fill(
    screen.getByLabelText('Confirmar nueva contraseña'),
    'NuevaClave123!'
  )
  useAuthStore.getState().handleAuthEvent('SIGNED_OUT', null)
  await expect
    .element(
      screen.getByRole('link', { name: 'Solicitar enlace de recuperación' })
    )
    .toBeInTheDocument()
  expect(supabase.auth.updateUser).not.toHaveBeenCalled()
})
