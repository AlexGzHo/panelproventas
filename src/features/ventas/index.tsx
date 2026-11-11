import { Plus, Receipt, SlidersHorizontal, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useNuevaVentaStore } from '@/stores/nueva-venta-store'

export function Ventas() {
  const { openNuevaVenta } = useNuevaVentaStore()

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Historial de ventas
          </h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Consulta, filtra y exporta las ventas y suscripciones registradas
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' disabled className='gap-1.5'>
            <Download className='size-3.5' />
            <span>Exportar</span>
          </Button>
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
                Listado de suscripciones
              </CardTitle>
              <CardDescription>
                Filtra por periodo, plataforma, estado o cliente
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' disabled className='gap-1.5 text-xs'>
                <SlidersHorizontal className='size-3' />
                Filtros avanzados
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
            <div className='size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3'>
              <Receipt className='size-6' />
            </div>
            <h3 className='text-base font-semibold mb-1'>
              No hay ventas registradas
            </h3>
            <p className='text-sm text-muted-foreground max-w-sm mb-5'>
              Las suscripciones de streaming e IA que registres aparecerán en
              esta tabla con su estado (vigente, por vencer, vencida o renovada).
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
