import { useEffect, useMemo } from 'react'
import { recordValues } from '@curvefi/prices-api/objects.util'
import type { NetworkMapping } from '@ui/utils'
import { useNavigate, usePathname } from '@ui-kit/hooks/router'
import { getHashRedirectUrl } from '@ui-kit/shared/route-redirects'
import { getCurrentNetwork, replaceNetworkInPath } from '@ui-kit/shared/routes'

export function useNetworkFromUrl<T extends NetworkMapping>(networks: T | undefined) {
  const navigate = useNavigate()
  const pathname = usePathname()
  const networkId = getCurrentNetwork(pathname)
  const network = useMemo(
    () => networks && recordValues(networks).find((n) => n.id == networkId),
    [networkId, networks],
  )
  useEffect(() => {
    if (network || !pathname || !networks || pathname === '/') {
      return // Do not auto-redirect on while loading or on root (let `ConnectionProvider` decide based on the wallet state)
    }
    const { location } = window
    const redirectUrl = networkId ? replaceNetworkInPath(pathname, 'ethereum') : getHashRedirectUrl(location)
    const ids = recordValues(networks)
      .map((n) => n.id)
      .join(', ')
    console.warn(`Network unknown in ${location.href}, redirecting to ${redirectUrl}... Supported networks: ${ids}`)
    navigate(redirectUrl, { replace: true })
  }, [network, networkId, pathname, navigate, networks])
  return network
}
