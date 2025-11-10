import { useCallback } from 'react'
import type { NetworkMapping } from '@ui/utils'
import { replaceNetworkInPath } from '@ui-kit/shared/routes'
import { useNavigate, usePathname } from './router'

export function useOnChainUnavailable<T extends NetworkMapping>(networks: T | undefined) {
  const pathname = usePathname()
  const push = useNavigate()
  return useCallback(
    <TChainId extends number>([networkChainId, walletChainId]: [TChainId | undefined, TChainId | undefined]) => {
      const network =
        (walletChainId && networks?.[walletChainId]?.id) || (networkChainId && networks?.[networkChainId]?.id)
      if (pathname === '/') {
        console.info(`At root path, redirecting to the available network ${network}...`)
        return push(`/dex/${network ?? 'ethereum'}/swap`)
      }
      if (network) {
        console.warn(`Network switched to ${network}, redirecting...`, pathname)
        push(replaceNetworkInPath(pathname, network))
      }
    },
    [networks, pathname, push],
  )
}
