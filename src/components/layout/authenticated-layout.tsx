import { Outlet } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { SkipToMain } from '@/components/skip-to-main'
import { BottomNav } from '@/components/layout/bottom-nav'
import { NuevaVentaSheet } from '@/features/ventas/components/nueva-venta-sheet'
import { useNuevaVentaStore } from '@/stores/nueva-venta-store'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const { openNuevaVenta } = useNuevaVentaStore()

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              '@container/content',
              'has-data-[layout=fixed]:h-svh',
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            <Header fixed className='border-b'>
              <Search className='me-auto' />
              <div className='flex items-center gap-2'>
                <Button
                  onClick={openNuevaVenta}
                  size='sm'
                  className='hidden sm:inline-flex gap-1.5 font-medium shadow-sm'
                >
                  <Plus className='size-4' />
                  <span>+ Nueva venta</span>
                  <kbd className='ml-1 font-mono text-[10px] bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded'>
                    N
                  </kbd>
                </Button>
                <ThemeSwitch />
                <ProfileDropdown />
              </div>
            </Header>

            <Main className='pb-24 md:pb-6 flex-1'>
              {children ?? <Outlet />}
            </Main>

            <BottomNav />
            <NuevaVentaSheet />
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
