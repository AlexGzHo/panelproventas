import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const store = useAuthStore.getState()

    // Si ya tenemos sesión cargada en memoria, continuamos
    if (store.session) {
      if (store.session.user && !store.perfil) {
        await store.fetchPerfil(store.session.user.id)
      }
      return
    }

    // Consultamos la sesión activa en Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }

    store.setSession(session)
    if (session.user && !store.perfil) {
      await store.fetchPerfil(session.user.id)
    }
  },
  component: AuthenticatedLayout,
})
