import { dexPages, getCurrentNetwork } from '@evm-ui/shared/routes'
import { CRVUSD_ADDRESS } from '@evm-ui/utils'
import { usePathname } from '@ui/hooks/router'

export const useCrvSwapUrl = () =>
  dexPages.swap({ blockchainId: getCurrentNetwork(usePathname()) ?? 'ethereum', to: CRVUSD_ADDRESS })
