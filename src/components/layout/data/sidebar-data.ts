import {
  LayoutDashboard,
  Receipt,
  Users,
  Layers,
  BarChart3,
  ShieldCheck,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Administradora',
    email: 'admin@proventas.pe',
    avatar: '',
  },
  teams: [
    {
      name: 'PANEL PROVENTAS',
      logo: ShieldCheck,
      plan: 'Streaming e IA',
    },
  ],
  navGroups: [
    {
      title: 'Menú principal',
      items: [
        {
          title: 'Inicio',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Ventas',
          url: '/ventas',
          icon: Receipt,
        },
        {
          title: 'Clientes',
          url: '/clientes',
          icon: Users,
        },
        {
          title: 'Catálogo',
          url: '/catalogo',
          icon: Layers,
        },
        {
          title: 'Reportes',
          url: '/reportes',
          icon: BarChart3,
        },
      ],
    },
  ],
}
