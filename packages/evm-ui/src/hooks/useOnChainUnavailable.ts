import { useCallback } from 'react'
import { getHashRedirectUrl } from '@evm-ui/shared/route-redirects'
import { getCurrentNetwork, replaceNetworkInPath } from '@evm-ui/shared/routes'
import type { NetworkMapping } from '@legacy-ui/utils'
import { useLocation, useNavigate } from './router'

export function useOnChainUnavailable<T extends NetworkMapping>(networks: T | undefined) {
  const navigate = useNavigate()
  const location = useLocation()
  return useCallback(
    (walletChainId?: number) => {
      const { pathname, href } = location
      const blockchainId = (walletChainId && networks?.[walletChainId]?.blockchainId) || ('ethereum' as const)
      const redirectUrl = getCurrentNetwork(pathname)
        ? replaceNetworkInPath(pathname, blockchainId)
        : getHashRedirectUrl(location, blockchainId)
      console.warn('Redirecting from %s to %s...', href, redirectUrl)
      return navigate(redirectUrl, { replace: true })
    },
    [networks, navigate, location],
  )
}
