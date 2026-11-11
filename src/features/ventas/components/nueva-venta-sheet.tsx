import { useEffect } from 'react'
import { PlusCircle, ShoppingBag } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useNuevaVentaStore } from '@/stores/nueva-venta-store'

export function NuevaVentaSheet() {
  const { isOpen, setIsOpen, openNuevaVenta } = useNuevaVentaStore()

  // Atajo de teclado: pulsar 'n' o 'N' fuera de campos de texto abre el Sheet
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === 'n' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const target = event.target as HTMLElement | null
        const isEditable =
          target?.tagName === 'INPUT' ||
          target?.tagName === 'TEXTAREA' ||
          target?.tagName === 'SELECT' ||
          target?.isContentEditable

        if (!isEditable) {
          event.preventDefault()
          openNuevaVenta()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openNuevaVenta])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side='right'
        className='w-full sm:max-w-md p-0 flex flex-col'
      >
        <SheetHeader className='p-6 border-b'>
          <div className='flex items-center gap-2'>
            <div className='size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
              <ShoppingBag className='size-4' />
            </div>
            <div>
              <SheetTitle className='text-lg font-semibold'>
                Nueva venta
              </SheetTitle>
              <SheetDescription className='text-xs'>
                Registra una venta o suscripción en menos de 15 segundos
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className='flex-1 p-6 flex flex-col items-center justify-center text-center'>
          <div className='size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4'>
            <PlusCircle className='size-6' />
          </div>
          <h3 className='font-medium text-base mb-1'>Formulario de registro</h3>
          <p className='text-sm text-muted-foreground max-w-xs mb-4'>
            El formulario de alta rápida de ventas con selección de cliente y
            catálogo de productos se activará en la Fase 4.
          </p>
          <div className='rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground text-left w-full space-y-1.5'>
            <p className='font-medium text-foreground'>Flujo previsto:</p>
            <p>1. Buscar o crear cliente (combobox con autocompletado).</p>
            <p>2. Seleccionar producto (agrupado por plataforma).</p>
            <p>3. Confirmar fechas, método de pago y guardar en ≤ 4 pasos.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
