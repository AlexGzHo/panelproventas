import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { Shield, User as UserIcon, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { user, perfil } = useAuthStore()

  const nombre = perfil?.nombre || user?.email?.split('@')[0] || 'Usuario'
  const email = user?.email || 'usuario@proventas.pe'
  const esAdmin = perfil?.rol === 'admin'
  const rolTexto = esAdmin ? 'Administrador(a)' : 'Operador(a)'
  const iniciales =
    nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U'

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarFallback className='bg-primary/10 text-primary font-semibold text-xs'>
                {iniciales}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1'>
              <p className='text-sm leading-none font-medium truncate'>{nombre}</p>
              <p className='text-xs leading-none text-muted-foreground truncate'>
                {email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className='px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5'>
            {esAdmin ? (
              <Shield className='size-3.5 text-primary' />
            ) : (
              <UserIcon className='size-3.5 text-primary' />
            )}
            <span>Rol: {rolTexto}</span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
            <LogOut className='size-4 mr-2' />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
