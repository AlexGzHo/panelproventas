import { Link } from '@tanstack/react-router'
import { ShieldCheck } from 'lucide-react'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function AppTitle() {
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='gap-2.5 py-2 hover:bg-sidebar-accent active:bg-sidebar-accent'
          asChild
        >
          <Link to='/' onClick={() => setOpenMobile(false)}>
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm'>
              <ShieldCheck className='size-5' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-bold tracking-tight text-foreground'>
                PROVENTAS
              </span>
              <span className='truncate text-[11px] text-muted-foreground'>
                Suscripciones & IA
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
