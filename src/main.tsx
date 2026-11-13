import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { handleServerError } from '@/lib/handle-server-error'
import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { ThemeProvider } from './context/theme-provider'
// Generated Routes
import { routeTree } from './routeTree.gen'
// Styles
import './styles/index.css'

function isAuthOrForbiddenError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const err = error as { status?: number; statusCode?: number; code?: string }
  const status = err.status ?? err.statusCode
  return status === 401 || status === 403 || err.code === '42501'
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // No reintentar en errores de autenticación o permisos (401, 403, 42501)
        if (isAuthOrForbiddenError(error)) return false
        // Límite de reintentos
        if (failureCount >= 2) return false
        return true
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutos
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      handleServerError(error)

      const err = error as { status?: number; statusCode?: number }
      const status = err?.status ?? err?.statusCode
      if (status === 401) {
        useAuthStore.getState().signOut()
        const redirect = `${router.history.location.href}`
        router.navigate({ to: '/login', search: { redirect } })
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handleServerError(error)
    },
  }),
})

// Create a new router instance
export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Sincronizar estado de sesión de Supabase
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState()
  store.setSession(session)

  if (event === 'SIGNED_IN' && session?.user) {
    await store.fetchPerfil(session.user.id)
  } else if (event === 'SIGNED_OUT') {
    store.setPerfil(null)
  }
})

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <RouterProvider router={router} />
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
