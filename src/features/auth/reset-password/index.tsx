import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'

export function ResetPassword() {
  return (
    <AuthLayout>
      <Card className='w-full max-w-sm sm:w-[400px] border shadow-xs'>
        <CardHeader className='space-y-1 pb-4'>
          <CardTitle className='font-heading text-xl font-bold tracking-tight'>
            Nueva contraseña
          </CardTitle>
          <CardDescription className='text-xs text-muted-foreground'>
            Ingresa y confirma tu nueva contraseña para acceder al panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
