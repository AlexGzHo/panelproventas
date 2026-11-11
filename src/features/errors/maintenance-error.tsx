import { Button } from '@/components/ui/button'

export function MaintenanceError() {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>503</h1>
        <span className='font-medium text-lg'>Sistema en mantenimiento</span>
        <p className='text-center text-muted-foreground'>
          El servicio se encuentra temporalmente fuera de línea. <br />
          Estamos aplicando mejoras; por favor, vuelve en unos minutos.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  )
}
