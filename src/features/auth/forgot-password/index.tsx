import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ForgotPasswordForm } from './components/forgot-password-form'

export function ForgotPassword() {
  return (
    <AuthLayout>
      <Card className='w-full max-w-sm sm:w-[400px] border shadow-xs'>
        <CardHeader className='space-y-1 pb-4'>
          <CardTitle className='font-heading text-xl font-bold tracking-tight'>
            ¿Olvidaste tu contraseña?
          </CardTitle>
          <CardDescription className='text-xs text-muted-foreground'>
            Ingresa tu correo electrónico registrado y te enviaremos un enlace
            para restablecerla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
