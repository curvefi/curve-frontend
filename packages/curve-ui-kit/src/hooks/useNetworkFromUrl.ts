import { useMemo } from 'react'
import { recordValues } from '@curvefi/primitives/objects.utils'
import type { NetworkMapping } from '@ui/utils'
import { usePathname } from '@ui-kit/hooks/router'
import { getCurrentNetwork } from '@ui-kit/shared/routes'

export function useNetworkFromUrl<T extends NetworkMapping>(networks: T | undefined) {
  const pathname = usePathname()
  return useMemo(
    () => networks && recordValues(networks).find((n) => n.id == getCurrentNetwork(pathname)),
    [pathname, networks],
  )
}
