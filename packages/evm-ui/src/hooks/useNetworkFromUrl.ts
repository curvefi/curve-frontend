import { useMemo } from 'react'
import { getCurrentNetwork } from '@evm-ui/shared/routes'
import type { NetworkMapping } from '@legacy-ui/utils'
import { recordValues } from '@primitives/objects.utils'
import { usePathname } from '@ui/hooks/router'

export function useNetworkFromUrl<T extends NetworkMapping>(networks: T | undefined) {
  const pathname = usePathname()
  return useMemo(
    () => networks && recordValues(networks).find(n => n.blockchainId == getCurrentNetwork(pathname)),
    [pathname, networks],
  )
}
