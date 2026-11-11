import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Laptop, Moon, Plus, Sun } from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import { useTheme } from '@/context/theme-provider'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { sidebarData } from './layout/data/sidebar-data'
import { ScrollArea } from './ui/scroll-area'
import { useNuevaVentaStore } from '@/stores/nueva-venta-store'

export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()
  const { openNuevaVenta } = useNuevaVentaStore()

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Escribe un comando o busca...' />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pe-1'>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>

          <CommandGroup heading='Acciones rápidas'>
            <CommandItem
              value='Nueva venta registrar venta'
              onSelect={() => runCommand(() => openNuevaVenta())}
            >
              <div className='flex size-4 items-center justify-center'>
                <Plus className='size-3 text-primary' />
              </div>
              <span className='font-medium'>+ Nueva venta</span>
              <kbd className='ml-auto font-mono text-[10px] text-muted-foreground'>N</kbd>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {sidebarData.navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem, i) => {
                if (navItem.url)
                  return (
                    <CommandItem
                      key={`${navItem.url}-${i}`}
                      value={`${navItem.title} ${navItem.url}`}
                      onSelect={() => {
                        runCommand(() => navigate({ to: navItem.url }))
                      }}
                    >
                      <div className='flex size-4 items-center justify-center'>
                        <ArrowRight className='size-2 text-muted-foreground/80' />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  )

                return null
              })}
            </CommandGroup>
          ))}

          <CommandSeparator />

          <CommandGroup heading='Tema'>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <Sun className='size-4' /> <span>Claro</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon className='size-4' /> <span>Oscuro</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <Laptop className='size-4' /> <span>Sistema</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
