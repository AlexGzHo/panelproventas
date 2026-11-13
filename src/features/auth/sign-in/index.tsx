import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const search = useSearch({ strict: false }) as { redirect?: string }
  const redirect = search.redirect

  return (
    <AuthLayout>
      <Card className='w-full max-w-sm sm:w-[400px] border shadow-xs'>
        <CardHeader className='space-y-1 pb-4'>
          <CardTitle className='font-heading text-xl font-bold tracking-tight'>
            Iniciar sesión
          </CardTitle>
          <CardDescription className='text-xs text-muted-foreground'>
            Ingresa tu correo y contraseña para acceder al panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter className='border-t pt-3'>
          <p className='w-full text-center text-xs text-muted-foreground'>
            Sistema exclusivo para el equipo de ventas.
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
