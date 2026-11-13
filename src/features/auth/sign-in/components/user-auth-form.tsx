import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { AlertCircle, Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
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
import { PasswordInput } from '@/components/password-input'
import { Alert, AlertDescription } from '@/components/ui/alert'

const formSchema = z.object({
  email: z
    .string()
    .min(1, 'Ingresa tu correo electrónico.')
    .email('Ingresa un correo electrónico válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const { setSession, fetchPerfil } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      })

      if (error) {
        let msg = 'Correo o contraseña incorrectos.'
        const lower = error.message.toLowerCase()
        if (lower.includes('email not confirmed')) {
          msg = 'El correo electrónico no ha sido confirmado.'
        } else if (lower.includes('rate limit')) {
          msg = 'Demasiados intentos fallidos. Intenta más tarde.'
        }
        setErrorMessage(msg)
        toast.error(msg)
        setIsLoading(false)
        return
      }

      if (authData.session) {
        setSession(authData.session)
        if (authData.user) {
          await fetchPerfil(authData.user.id)
        }
      }

      toast.success('Sesión iniciada con éxito')
      const target =
        redirectTo && redirectTo.startsWith('/') ? redirectTo : '/'
      navigate({ to: target, replace: true })
    } catch {
      const fallbackMsg = 'Ocurrió un error inesperado al iniciar sesión.'
      setErrorMessage(fallbackMsg)
      toast.error(fallbackMsg)
    } finally {
      setIsLoading(false)
    }
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

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <div className='flex items-center justify-between'>
                <FormLabel>Contraseña</FormLabel>
                <Link
                  to='/forgot-password'
                  className='text-xs text-muted-foreground hover:text-primary hover:underline'
                  tabIndex={-1}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <FormControl>
                <PasswordInput
                  autoComplete='current-password'
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
              <Loader2 className='size-4 animate-spin mr-2' />
              Iniciando sesión...
            </>
          ) : (
            <>
              <LogIn className='size-4 mr-2' />
              Iniciar sesión
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
