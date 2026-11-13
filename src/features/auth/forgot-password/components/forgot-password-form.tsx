import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Ingresa tu correo electrónico.')
    .email('Ingresa un correo electrónico válido.'),
})

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true)

    try {
      const email = data.email.trim()
      const redirectTo = `${window.location.origin}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) {
        toast.error(
          'No se pudo enviar el correo de recuperación. Intenta más tarde.'
        )
        return
      }

      setSentEmail(email)
      setIsSuccess(true)
      toast.success('Correo de recuperación enviado')
    } catch {
      toast.error('Ocurrió un error inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className='space-y-4'>
        <Alert className='border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'>
          <CheckCircle2 className='size-4 text-emerald-600 dark:text-emerald-400' />
          <AlertTitle className='font-semibold'>
            ¡Revisa tu bandeja de entrada!
          </AlertTitle>
          <AlertDescription className='text-xs mt-1'>
            Hemos enviado un enlace de recuperación a{' '}
            <strong className='font-medium'>{sentEmail}</strong>. Haz clic en el
            enlace para definir tu nueva contraseña.
          </AlertDescription>
        </Alert>

        <Button variant='outline' asChild className='w-full'>
          <Link to='/login'>
            <ArrowLeft className='size-4 mr-2' />
            Volver a iniciar sesión
          </Link>
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
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  autoComplete='email'
                  placeholder='nombre@ejemplo.pe'
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className='mt-1 w-full font-medium' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className='size-4 animate-spin mr-2' />
              Enviando enlace...
            </>
          ) : (
            <>
              <Mail className='size-4 mr-2' />
              Enviar enlace de recuperación
            </>
          )}
        </Button>

        <div className='text-center mt-2'>
          <Link
            to='/login'
            className='inline-flex items-center text-xs text-muted-foreground hover:text-primary hover:underline'
          >
            <ArrowLeft className='size-3 mr-1' />
            Volver a iniciar sesión
          </Link>
        </div>
      </form>
    </Form>
  )
}
