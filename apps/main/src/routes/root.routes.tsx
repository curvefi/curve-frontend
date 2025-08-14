// Create root route
import { ClientWrapper } from '@/app/ClientWrapper'
import { getNetworkDefs } from '@/dex/lib/networks'
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const rootRoute = createRootRoute({
  loader: async () => {
    const networks = await getNetworkDefs()
    const preferredScheme = null // Handle client-side. todo: delete the prop!
    return { networks, preferredScheme }
  },
  component: () => {
    const { networks, preferredScheme } = rootRoute.useLoaderData()
    return (
      <ClientWrapper networkDefs={networks} preferredScheme={preferredScheme}>
        <HeadContent />
        <Outlet />
        <TanStackRouterDevtools />
      </ClientWrapper>
    )
  },
})
