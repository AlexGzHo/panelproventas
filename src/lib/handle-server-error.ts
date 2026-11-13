import { AxiosError } from 'axios'
import { toast } from 'sonner'
import type { PostgrestError } from '@supabase/supabase-js'

export function extractErrorMessage(error: unknown): string {
  if (!error) return 'Ha ocurrido un error inesperado.'

  // PostgrestError o error con código de Postgres
  const maybePg = error as Partial<PostgrestError> & { status?: number; statusCode?: number }
  if (maybePg.code === '42501' || maybePg.status === 403 || maybePg.statusCode === 403) {
    return 'No tienes permisos suficientes para realizar esta acción.'
  }

  if (maybePg.status === 401 || maybePg.statusCode === 401) {
    return 'Sesión expirada o no autorizada.'
  }

  if (maybePg.code === '23505') {
    return 'Ya existe un registro con estos datos.'
  }

  if (maybePg.code === '23503') {
    return 'La operación hace referencia a un registro que no existe.'
  }

  if (typeof maybePg.message === 'string' && maybePg.message.trim().length > 0) {
    const msg = maybePg.message
    if (msg.includes('JWT expired') || msg.includes('token is expired')) {
      return 'Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.'
    }
    if (msg.includes('Failed to fetch') || msg.toLowerCase().includes('network')) {
      return 'Error de red. Verifica tu conexión a internet.'
    }
    return msg
  }

  if (error instanceof AxiosError) {
    const title = error.response?.data?.title || error.response?.data?.message
    if (typeof title === 'string' && title.length > 0) {
      return title
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Ha ocurrido un error inesperado al procesar la solicitud.'
}

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error('[API Error]:', error)
  }

  const errMsg = extractErrorMessage(error)
  toast.error(errMsg)
  return errMsg
}
