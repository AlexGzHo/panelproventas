import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function ForbiddenError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>403</h1>
        <span className='font-medium text-lg'>Acceso no permitido</span>
        <p className='text-center text-muted-foreground'>
          No cuentas con los permisos necesarios <br />
          para acceder a este recurso.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            Regresar
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>Ir al Inicio</Button>
        </div>
      </div>
    </div>
  )
}
