import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { SignOutDialog } from './sign-out-dialog'

const navigate = vi.fn()
const signOut = vi.fn().mockResolvedValue(undefined)

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    signOut,
  }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
  }
})

describe('SignOutDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls signOut and navigates to login', async () => {
    const { getByRole } = await render(
      <SignOutDialog open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /^Cerrar sesión$/i }))

    expect(signOut).toHaveBeenCalledOnce()
    expect(navigate).toHaveBeenCalledWith({
      to: '/login',
      replace: true,
    })
  })

  it('does not call signOut or navigate when Cancel is clicked', async () => {
    const { getByRole } = await render(
      <SignOutDialog open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /^Cancelar$/i }))

    expect(signOut).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
