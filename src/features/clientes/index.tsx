import { Plus, Users, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useNuevaVentaStore } from '@/stores/nueva-venta-store'

export function Clientes() {
  const { openNuevaVenta } = useNuevaVentaStore()

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Clientes
          </h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Directorio de clientes, historial de compras y contacto rápido por WhatsApp
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={openNuevaVenta} className='gap-1.5 font-medium'>
            <Plus className='size-4' />
            <span>Nueva venta</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className='pb-3 border-b'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
            <div>
              <CardTitle className='text-base font-semibold'>
                Listado de clientes
              </CardTitle>
              <CardDescription>
                Búsqueda por nombre o teléfono
              </CardDescription>
            </div>
            <div className='relative w-full sm:w-64'>
              <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
              <Input
                placeholder='Buscar cliente o teléfono...'
                disabled
                className='pl-8 h-9 text-xs'
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
            <div className='size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3'>
              <Users className='size-6' />
            </div>
            <h3 className='text-base font-semibold mb-1'>
              No hay clientes registrados
            </h3>
            <p className='text-sm text-muted-foreground max-w-sm mb-5'>
              Los clientes se crean automáticamente al registrar una venta o
              directamente desde el formulario de ventas.
            </p>
            <Button onClick={openNuevaVenta} className='gap-2 shadow-sm'>
              <Plus className='size-4' />
              Registrar primera venta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
