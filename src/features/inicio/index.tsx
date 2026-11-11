import { Link } from '@tanstack/react-router'
import {
  TrendingUp,
  Receipt,
  PiggyBank,
  AlertTriangle,
  Plus,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useNuevaVentaStore } from '@/stores/nueva-venta-store'
import { formatoMoneda } from '@/lib/formato'

export function Inicio() {
  const { openNuevaVenta } = useNuevaVentaStore()

  // Fecha actual en formato amigable para el header
  const hoy = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const mesCapitalizado = hoy.charAt(0).toUpperCase() + hoy.slice(1)

  return (
    <div className='flex flex-col gap-6'>
      {/* Encabezado */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Inicio
          </h1>
          <p className='text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5'>
            <Calendar className='size-3.5' />
            <span>Resumen de ventas y suscripciones · {mesCapitalizado}</span>
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            onClick={openNuevaVenta}
            className='gap-1.5 font-medium'
          >
            <Plus className='size-4' />
            <span>Nueva venta</span>
            <kbd className='hidden sm:inline-flex h-5 items-center rounded border border-primary-foreground/30 bg-primary-foreground/15 px-1.5 font-mono text-[10px] text-primary-foreground'>
              N
            </kbd>
          </Button>
        </div>
      </div>

      {/* 4 Tarjetas KPI del mes en curso - Interfaz neutra, cifras tabulares */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* KPI 1: Ingresos */}
        <Card className='shadow-none border'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Ingresos del mes
            </CardTitle>
            <div className='size-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground'>
              <TrendingUp className='size-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold tracking-tight tabular-nums'>
              {formatoMoneda(0)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Sin ventas el mes anterior
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: Ventas */}
        <Card className='shadow-none border'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Ventas del mes
            </CardTitle>
            <div className='size-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground'>
              <Receipt className='size-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold tracking-tight tabular-nums'>
              0
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Suscripciones registradas
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Ganancia */}
        <Card className='shadow-none border'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Ganancia estimada
            </CardTitle>
            <div className='size-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground'>
              <PiggyBank className='size-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold tracking-tight tabular-nums'>
              {formatoMoneda(0)}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              Ingresos menos costos
            </p>
          </CardContent>
        </Card>

        {/* KPI 4: Por vencer (color semántico reservado estrictamente al estado con ícono y texto) */}
        <Card className='shadow-none border'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Por vencer (3 días)
            </CardTitle>
            <div className='size-8 rounded-md bg-estado-por-vencer-bg flex items-center justify-center text-estado-por-vencer'>
              <AlertTriangle className='size-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold tracking-tight tabular-nums text-foreground'>
              0
            </div>
            <p className='text-xs text-estado-por-vencer font-medium mt-1 flex items-center gap-1'>
              <span>Requieren renovación próxima</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado vacío principal según docs/PRD.md 4.1 */}
      <Card className='border-dashed shadow-none'>
        <CardContent className='flex flex-col items-center justify-center py-12 px-4 text-center'>
          <div className='size-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mb-4'>
            <Layers className='size-6' />
          </div>
          <h2 className='text-lg font-semibold tracking-tight mb-1'>
            Aún no hay ventas registradas este mes
          </h2>
          <p className='text-sm text-muted-foreground max-w-md mb-6'>
            Comienza a registrar las suscripciones de tus clientes (Netflix,
            ChatGPT, Spotify, etc.) para ver tus ingresos, ganancias y cuentas
            por vencer en tiempo real.
          </p>
          <div className='flex flex-wrap items-center justify-center gap-3'>
            <Button onClick={openNuevaVenta} className='gap-2'>
              <Plus className='size-4' />
              <span>Registrar primera venta</span>
            </Button>
            <Button variant='outline' asChild className='gap-2'>
              <Link to='/catalogo'>
                <BookOpen className='size-4' />
                <span>Revisar catálogo</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Secciones complementarias de Inicio */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='shadow-none border'>
          <CardHeader>
            <CardTitle className='text-base font-semibold'>
              Vencimientos próximos
            </CardTitle>
            <CardDescription>
              Cuentas por vencer en los próximos 3 días y vencidas recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='py-8 text-center text-sm text-muted-foreground'>
              No hay cuentas pendientes de renovación en este momento.
            </div>
          </CardContent>
        </Card>

        <Card className='shadow-none border'>
          <CardHeader>
            <CardTitle className='text-base font-semibold'>
              Historial de ingresos mensuales
            </CardTitle>
            <CardDescription>
              Comparativa de ventas e ingresos de los últimos 12 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='py-8 text-center text-sm text-muted-foreground'>
              El gráfico de evolución mensual estará disponible al registrar ventas.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
