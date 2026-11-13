import { TrendingUp } from 'lucide-react'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='container grid min-h-svh max-w-none items-center justify-center p-4'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-4 py-8 sm:p-8'>
        <div className='mb-2 flex items-center justify-center gap-2'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <TrendingUp className='size-5' />
          </div>
          <span className='font-heading text-lg font-bold tracking-tight'>
            PROVENTAS
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
