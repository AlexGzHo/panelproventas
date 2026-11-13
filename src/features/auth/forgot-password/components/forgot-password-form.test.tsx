import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { userEvent, type Locator } from 'vitest/browser'
import { ForgotPasswordForm } from './forgot-password-form'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}))

vi.mock('@tanstack/react-router', async (orig) => {
  const actual = await orig<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
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

describe('ForgotPasswordForm', () => {
  let screen: RenderResult
  let emailInput: Locator
  let submitButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()

    screen = await render(<ForgotPasswordForm />)
    emailInput = screen.getByRole('textbox', { name: /correo electrónico/i })
    submitButton = screen.getByRole('button', {
      name: /enviar enlace de recuperación/i,
    })
  })

  it('renders email field and submit button', async () => {
    await expect.element(emailInput).toBeInTheDocument()
    await expect.element(submitButton).toBeInTheDocument()
  })

  it('shows validation when submitting empty form', async () => {
    await userEvent.click(submitButton)
    await expect
      .element(screen.getByText(/ingresa tu correo electrónico/i))
      .toBeInTheDocument()
  })

  it('calls resetPasswordForEmail and shows confirmation message on success', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
      data: {},
      error: null,
    } as unknown as Awaited<
      ReturnType<typeof supabase.auth.resetPasswordForEmail>
    >)

    await userEvent.fill(emailInput, 'vendedor@ejemplo.pe')
    await userEvent.click(submitButton)

    await vi.waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'vendedor@ejemplo.pe',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/reset-password'),
        })
      )
    })

    await expect
      .element(screen.getByText(/¡revisa tu bandeja de entrada!/i))
      .toBeInTheDocument()
  })
})
