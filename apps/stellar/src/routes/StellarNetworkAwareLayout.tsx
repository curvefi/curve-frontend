import { HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { IS_CYPRESS } from '@ui/lib/env'

const DEV_TOOLS = !IS_CYPRESS

export const StellarNetworkAwareLayout = () => (
  <>
    <HeadContent />
    <Outlet />
    {DEV_TOOLS && <TanStackRouterDevtools />}
  </>
)
