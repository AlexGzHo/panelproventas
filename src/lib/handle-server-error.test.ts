import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleServerError } from './handle-server-error'

const toastError = vi.hoisted(() => vi.fn())

vi.mock('sonner', () => ({
  toast: {
    error: toastError,
  },
}))

beforeEach(() => {
  vi.mocked(toastError).mockClear()
})

describe('handleServerError', () => {
  it('translates 401 session expiration error to Spanish', () => {
    handleServerError({ status: 401 })
    expect(toastError).toHaveBeenCalledWith('Sesión expirada o no autorizada.')
  })

  it('translates 403 or code 42501 permission error to Spanish', () => {
    handleServerError({ code: '42501' })
    expect(toastError).toHaveBeenCalledWith(
      'No tienes permisos suficientes para realizar esta acción.'
    )

    handleServerError({ status: 403 })
    expect(toastError).toHaveBeenCalledWith(
      'No tienes permisos suficientes para realizar esta acción.'
    )
  })

  it('translates code 23505 unique constraint violation to Spanish', () => {
    handleServerError({ code: '23505' })
    expect(toastError).toHaveBeenCalledWith(
      'Ya existe un registro con estos datos.'
    )
  })

  it('translates network failure messages to Spanish', () => {
    handleServerError(new Error('Failed to fetch'))
    expect(toastError).toHaveBeenCalledWith(
      'Error de red. Verifica tu conexión a internet.'
    )
  })

  it('shows generic Spanish error message for unrecognized error', () => {
    handleServerError(null)
    expect(toastError).toHaveBeenCalledWith('Ha ocurrido un error inesperado.')
  })

  it('logs the error to console.error in development', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('logged')

    handleServerError(err)

    expect(errorSpy).toHaveBeenCalledTimes(1)
    errorSpy.mockRestore()
  })

  it('does not log to console in production', () => {
    vi.stubEnv('DEV', false)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const err = new Error('not logged')

    handleServerError(err)

    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
