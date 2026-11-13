import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Ingresa la nueva contraseña.')
      .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export function ResetPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()
  const canRecover = useAuthStore((state) => state.canRecoverPassword())

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof resetPasswordSchema>) {
    if (!useAuthStore.getState().canRecoverPassword()) {
      setErrorMessage('Solicita un nuevo enlace de recuperación.')
      return
    }
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        let msg =
          'No se pudo actualizar la contraseña. El enlace puede haber caducado.'
        if (error.message.toLowerCase().includes('same_password')) {
          msg = 'La nueva contraseña no puede ser igual a la anterior.'
        }
        setErrorMessage(msg)
        toast.error(msg)
        return
      }

      useAuthStore.getState().finishRecovery()
      setIsSuccess(true)
      toast.success('Contraseña actualizada correctamente')
      setTimeout(() => {
        navigate({ to: '/', replace: true })
      }, 1500)
    } catch {
      const fallback =
        'Ocurrió un error inesperado al actualizar la contraseña.'
      setErrorMessage(fallback)
      toast.error(fallback)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Alert className='border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'>
        <CheckCircle2 className='size-4 text-emerald-600 dark:text-emerald-400' />
        <AlertDescription className='text-xs font-medium'>
          Tu contraseña ha sido actualizada. Redirigiendo al panel...
        </AlertDescription>
      </Alert>
    )
  }

  if (!canRecover) {
    return (
      <div className='grid gap-4' role='status'>
        <p>
          Necesitas un enlace de recuperación válido para cambiar tu contraseña.
        </p>
        <Button asChild className='min-h-11'>
          <Link to='/forgot-password'>Solicitar enlace de recuperación</Link>
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        {errorMessage && (
          <Alert variant='destructive' className='py-2.5'>
            <AlertCircle className='size-4' />
            <AlertDescription className='text-xs font-medium'>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva contraseña</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete='new-password'
                  placeholder='••••••••'
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar nueva contraseña</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete='new-password'
                  placeholder='••••••••'
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className='mt-2 w-full font-medium' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className='mr-2 size-4 animate-spin' />
              Guardando contraseña...
            </>
          ) : (
            <>
              <KeyRound className='mr-2 size-4' />
              Guardar nueva contraseña
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
