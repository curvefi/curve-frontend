import { useMemo } from 'react'
import type { NetworkMapping } from '@legacy-ui/utils'
import { recordValues } from '@primitives/objects.utils'
import { usePathname } from '@ui-kit/hooks/router'
import { getCurrentNetwork } from '@ui-kit/shared/routes'

export function useNetworkFromUrl<T extends NetworkMapping>(networks: T | undefined) {
  const pathname = usePathname()
  return useMemo(
    () => networks && recordValues(networks).find(n => n.id == getCurrentNetwork(pathname)),
    [pathname, networks],
  )
}
