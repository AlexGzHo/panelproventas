import type { QueryClient } from '@tanstack/react-query'

let client: QueryClient | undefined

export function registerAuthQueryClient(queryClient: QueryClient) {
  client = queryClient
}

export function clearAuthCache() {
  // clear() cancels active queries and removes both query and mutation caches.
  client?.clear()
}
