import { useMemo } from 'react'
import { usePathname } from '@evm-ui/hooks/router'
import { getCurrentNetwork } from '@evm-ui/shared/routes'
import type { NetworkMapping } from '@legacy-ui/utils'
import { recordValues } from '@primitives/objects.utils'

export function useNetworkFromUrl<T extends NetworkMapping>(networks: T | undefined) {
  const pathname = usePathname()
  return useMemo(
    () => networks && recordValues(networks).find(n => n.id == getCurrentNetwork(pathname)),
    [pathname, networks],
  )
}
