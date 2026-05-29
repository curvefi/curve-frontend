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
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
      const networkId = (walletChainId && networks?.[walletChainId]?.id) || ('ethereum' as const)
      const redirectUrl = getCurrentNetwork(pathname)
        ? replaceNetworkInPath(pathname, networkId)
        : // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
          getHashRedirectUrl(location, networkId)
      console.warn('Redirecting from %s to %s...', href, redirectUrl)
      return navigate(redirectUrl, { replace: true })
    },
    [networks, navigate, location],
  )
}
