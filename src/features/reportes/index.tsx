import { BarChart3, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function Reportes() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Reportes
          </h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Análisis comparativo de ingresos mensuales, ganancias y distribución por plataforma
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' disabled className='gap-1.5'>
            <Calendar className='size-3.5' />
            <span>Últimos 12 meses</span>
          </Button>
          <Button variant='outline' size='sm' disabled className='gap-1.5'>
            <Download className='size-3.5' />
            <span>Exportar reporte</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className='pb-3 border-b'>
          <CardTitle className='text-base font-semibold'>
            Comparativa mensual
          </CardTitle>
          <CardDescription>
            Evolución de ventas, ingresos brutos y margen neto
          </CardDescription>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
            <div className='size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3'>
              <BarChart3 className='size-6' />
            </div>
            <h3 className='text-base font-semibold mb-1'>
              Sin datos para reportes
            </h3>
            <p className='text-sm text-muted-foreground max-w-sm mb-4'>
              A medida que registres ventas mensuales verás aquí gráficos
              interactivos, ranking de plataformas y variaciones porcentuales.
            </p>
            <p className='text-xs text-muted-foreground'>
              (Los reportes y analítica avanzada se habilitarán en la Fase 6)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
