import { Link } from '@tanstack/react-router'
import { LayoutDashboard, Receipt, Plus, Users, Layers } from 'lucide-react'
import { useNuevaVentaStore } from '@/stores/nueva-venta-store'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const { openNuevaVenta } = useNuevaVentaStore()

  const navItems = [
    {
      to: '/',
      label: 'Inicio',
      icon: LayoutDashboard,
    },
    {
      to: '/ventas',
      label: 'Ventas',
      icon: Receipt,
    },
    // Centro: botón Nueva venta
    {
      to: '/clientes',
      label: 'Clientes',
      icon: Users,
    },
    {
      to: '/catalogo',
      label: 'Catálogo',
      icon: Layers,
    },
  ]

  return (
    <nav
      aria-label='Navegación móvil'
      className='fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur-md md:hidden safe-area-pb'
    >
      <div className='flex h-16 items-center justify-around px-2 relative'>
        {/* Ítems izquierdos */}
        <Link
          to={navItems[0].to}
          activeProps={{ className: 'text-primary font-semibold' }}
          inactiveProps={{ className: 'text-muted-foreground' }}
          className='flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] transition-colors hover:text-foreground'
        >
          <LayoutDashboard className='size-5' />
          <span>{navItems[0].label}</span>
        </Link>

        <Link
          to={navItems[1].to}
          activeProps={{ className: 'text-primary font-semibold' }}
          inactiveProps={{ className: 'text-muted-foreground' }}
          className='flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] transition-colors hover:text-foreground'
        >
          <Receipt className='size-5' />
          <span>{navItems[1].label}</span>
        </Link>

        {/* Botón central + Nueva venta */}
        <div className='flex flex-1 flex-col items-center justify-center -mt-5'>
          <button
            type='button'
            onClick={openNuevaVenta}
            aria-label='Registrar nueva venta'
            className={cn(
              'flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg',
              'ring-4 ring-background transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
          >
            <Plus className='size-6 stroke-[2.5]' />
          </button>
          <span className='mt-1 text-[10px] font-medium text-foreground'>
            + Venta
          </span>
        </div>

        {/* Ítems derechos */}
        <Link
          to={navItems[2].to}
          activeProps={{ className: 'text-primary font-semibold' }}
          inactiveProps={{ className: 'text-muted-foreground' }}
          className='flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] transition-colors hover:text-foreground'
        >
          <Users className='size-5' />
          <span>{navItems[2].label}</span>
        </Link>

        <Link
          to={navItems[3].to}
          activeProps={{ className: 'text-primary font-semibold' }}
          inactiveProps={{ className: 'text-muted-foreground' }}
          className='flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] transition-colors hover:text-foreground'
        >
          <Layers className='size-5' />
          <span>{navItems[3].label}</span>
        </Link>
      </div>
    </nav>
  )
}
