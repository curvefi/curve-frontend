import { useCallback } from 'react'
import type { NetworkMapping } from '@ui/utils'
import { getHashRedirectUrl } from '@ui-kit/shared/route-redirects'
import { getCurrentNetwork, replaceNetworkInPath } from '@ui-kit/shared/routes'
import { useLocation, useNavigate } from './router'

export function useOnChainUnavailable<T extends NetworkMapping>(networks: T | undefined) {
  const navigate = useNavigate()
  const location = useLocation()
  return useCallback(
    (walletChainId?: number) => {
      const { pathname, href } = location
      const networkId = (walletChainId && networks?.[walletChainId]?.id) || ('ethereum' as const)
      const redirectUrl = getCurrentNetwork(pathname)
        ? replaceNetworkInPath(pathname, networkId)
        : getHashRedirectUrl(location, networkId)
      console.warn('Redirecting from %s to %s...', href, redirectUrl)
      return navigate(redirectUrl, { replace: true })
    },
    [networks, navigate, location],
  )
}
