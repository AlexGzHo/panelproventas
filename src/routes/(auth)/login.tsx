import { z } from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignIn } from '@/features/auth/sign-in'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/login')({
  component: SignIn,
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const store = useAuthStore.getState()
    if (store.session) {
      throw redirect({ to: '/' })
    }
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      store.setSession(session)
      throw redirect({ to: '/' })
    }
  },
})
