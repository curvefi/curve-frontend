import { useCallback } from 'react'
import { recordValues } from '@curvefi/prices-api/objects.util'
import type { NetworkMapping } from '@ui/utils'
import { getHashRedirectUrl } from '@ui-kit/shared/route-redirects'
import { getCurrentNetwork, replaceNetworkInPath } from '@ui-kit/shared/routes'
import { useNavigate } from './router'

export function useOnChainUnavailable<T extends NetworkMapping>(networks: T | undefined) {
  const navigate = useNavigate()
  return useCallback(
    <TChainId extends number>([networkChainId, walletChainId]: [TChainId | undefined, TChainId | undefined]) => {
      const newNetworkId =
        (walletChainId && networks?.[walletChainId]?.id) ||
        (networkChainId && networks?.[networkChainId]?.id) ||
        ('ethereum' as const)
      const { location } = window // Use window location to preserve full URL including hash
      const { pathname, href } = location
      const redirectUrl = getCurrentNetwork(pathname)
        ? replaceNetworkInPath(pathname, newNetworkId)
        : getHashRedirectUrl(location, newNetworkId)
      console.warn(
        "Redirecting from %s to %s...", href, redirectUrl,
        "Supported networks: %s.",
        recordValues(networks ?? {})
          .map((n) => n.id)
          .join(', '),
        "Wallet has chain %s app %s", walletChainId, networkChainId
      )
      return navigate(redirectUrl, { replace: true })
    },
    [networks, navigate],
  )
}
