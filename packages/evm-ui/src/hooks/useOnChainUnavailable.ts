import { useCallback } from 'react'
import {
  type AppName,
  CRVUSD_ROUTES,
  DAO_ROUTES,
  DEX_ROUTES,
  getCurrentApp,
  getCurrentNetwork,
  LEND_ROUTES,
  LLAMALEND_ROUTES,
  replaceNetworkInPath,
} from '@evm-ui/shared/routes'
import type { NetworkMapping } from '@legacy-ui/utils'
import { useLocation, useNavigate } from './router'

const defaultRoutes: Record<AppName, string> = {
  dex: DEX_ROUTES.PAGE_SWAP,
  lend: LEND_ROUTES.PAGE_MARKETS,
  crvusd: CRVUSD_ROUTES.PAGE_MARKETS,
  dao: DAO_ROUTES.PAGE_PROPOSALS,
  llamalend: LLAMALEND_ROUTES.PAGE_MARKETS,
  bridge: '',
  analytics: '/home',
}

export function useOnChainUnavailable<T extends NetworkMapping>(networks: T | undefined) {
  const navigate = useNavigate()
  const location = useLocation()
  return useCallback(
    (walletChainId?: number) => {
      const { pathname, href } = location
      const networkId = (walletChainId && networks?.[walletChainId]?.id) || ('ethereum' as const)
      const app = getCurrentApp(pathname)
      const redirectUrl = getCurrentNetwork(pathname)
        ? replaceNetworkInPath(pathname, networkId)
        : `/${app}/${networkId}${defaultRoutes[app]}`
      console.warn('Redirecting from %s to %s...', href, redirectUrl)
      return navigate(redirectUrl, { replace: true })
    },
    [networks, navigate, location],
  )
}
