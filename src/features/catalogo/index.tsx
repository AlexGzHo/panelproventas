import { Package, Tv, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function Catalogo() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Catálogo
          </h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Gestiona plataformas, productos, precios, costos y márgenes de ganancia
          </p>
        </div>
      </div>

      <Tabs defaultValue='productos' className='w-full'>
        <div className='flex items-center justify-between gap-4 mb-4'>
          <TabsList>
            <TabsTrigger value='productos' className='gap-2'>
              <Package className='size-4' />
              <span>Productos</span>
            </TabsTrigger>
            <TabsTrigger value='plataformas' className='gap-2'>
              <Tv className='size-4' />
              <span>Plataformas</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='productos' className='space-y-4'>
          <Card>
            <CardHeader className='pb-3 border-b'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                <div>
                  <CardTitle className='text-base font-semibold'>
                    Productos por plataforma
                  </CardTitle>
                  <CardDescription>
                    Duración, precio sugerido, costo de adquisición y margen
                  </CardDescription>
                </div>
                <Button size='sm' disabled className='gap-1.5'>
                  <Plus className='size-3.5' />
                  Nuevo producto
                </Button>
              </div>
            </CardHeader>
            <CardContent className='pt-6'>
              <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
                <div className='size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3'>
                  <Package className='size-6' />
                </div>
                <h3 className='text-base font-semibold mb-1'>
                  No hay productos en el catálogo
                </h3>
                <p className='text-sm text-muted-foreground max-w-sm mb-4'>
                  Configura tus productos (Netflix 1 mes, ChatGPT Plus, etc.)
                  con sus precios y costos para agilizar el registro de ventas.
                </p>
                <p className='text-xs text-muted-foreground'>
                  (La gestión completa del catálogo se habilitará en la Fase 3)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='plataformas' className='space-y-4'>
          <Card>
            <CardHeader className='pb-3 border-b'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                <div>
                  <CardTitle className='text-base font-semibold'>
                    Plataformas registradas
                  </CardTitle>
                  <CardDescription>
                    Servicios de streaming e inteligencia artificial con sus colores distintivos
                  </CardDescription>
                </div>
                <Button size='sm' disabled className='gap-1.5'>
                  <Plus className='size-3.5' />
                  Nueva plataforma
                </Button>
              </div>
            </CardHeader>
            <CardContent className='pt-6'>
              <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
                <div className='size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3'>
                  <Tv className='size-6' />
                </div>
                <h3 className='text-base font-semibold mb-1'>
                  No hay plataformas configuradas
                </h3>
                <p className='text-sm text-muted-foreground max-w-sm mb-4'>
                  Crea plataformas como Netflix, Disney+, Spotify, ChatGPT o Claude
                  con su respectivo color identificador.
                </p>
                <p className='text-xs text-muted-foreground'>
                  (La gestión completa del catálogo se habilitará en la Fase 3)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
