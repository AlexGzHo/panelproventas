import { createFileRoute } from '@tanstack/react-router'
import { Ventas } from '@/features/ventas'

export const Route = createFileRoute('/_authenticated/ventas/')({
  component: Ventas,
})
