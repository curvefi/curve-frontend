import { useCallback } from 'react'
import { replaceNetworkInPath } from '@evm-ui/shared/routes'
import type { NetworkMapping } from '@legacy-ui/utils'
import { useLocation, useNavigate } from '@ui/hooks/router'

export function useOnChainUnavailable<T extends NetworkMapping>(networks: T | undefined) {
  const navigate = useNavigate()
  const location = useLocation()
  return useCallback(
    (walletChainId?: number) => {
      const { pathname, href, searchStr } = location
      const blockchainId = (walletChainId && networks?.[walletChainId]?.blockchainId) || ('ethereum' as const)
      // '/' has no app name, so default to DEX; otherwise we'd redirect back to '/' and stay loading.
      const redirectUrl = replaceNetworkInPath(pathname === '/' ? '/dex' : pathname, blockchainId)
      console.warn('Redirecting from %s to %s...', href, redirectUrl)
      return navigate(redirectUrl + searchStr, { replace: true })
    },
    [networks, navigate, location],
  )
}
