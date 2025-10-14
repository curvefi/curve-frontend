import { useCallback } from 'react'
import type { NetworkMapping } from '@ui/utils'
import { replaceNetworkInPath } from '@ui-kit/shared/routes'
import { useNavigate, usePathname } from './router'

export function useOnChainUnavailable<T extends NetworkMapping>(networks: T | undefined) {
  const pathname = usePathname()
  const push = useNavigate()
  return useCallback(
    <TChainId extends number>([walletChainId]: [TChainId, TChainId]) => {
      const network = networks?.[walletChainId]?.id
      if (pathname && network) {
        console.warn(`Network switched to ${network}, redirecting...`, pathname)
        push(replaceNetworkInPath(pathname, network))
      }
    },
    [networks, pathname, push],
  )
}
