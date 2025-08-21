import { useEffect, useMemo } from 'react'
import type { NetworkDef } from '@ui/utils'
import { useNavigate, usePathname } from '@ui-kit/hooks/router'
import { getHashRedirectUrl } from '@ui-kit/shared/route-redirects'
import { getCurrentNetwork, replaceNetworkInPath } from '@ui-kit/shared/routes'

export function useNetworkFromUrl(networks: NetworkDef[]) {
  const navigate = useNavigate()
  const pathname = usePathname()
  const networkId = getCurrentNetwork(pathname)
  const network = useMemo(() => networks.find((n) => n.id == networkId), [networkId, networks])
  useEffect(() => {
    if (network || !pathname) {
      return
    }
    const redirectUrl = networkId ? replaceNetworkInPath(pathname, 'ethereum') : getHashRedirectUrl(window.location)
    console.warn(`Network unknown in ${window.location.href}, redirecting to ${redirectUrl}...`)
    navigate(redirectUrl, { replace: true })
  }, [network, networkId, pathname, navigate])
  return network
}
