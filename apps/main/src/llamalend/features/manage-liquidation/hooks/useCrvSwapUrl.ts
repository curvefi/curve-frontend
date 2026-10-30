import { DEX_ROUTES, getCurrentNetwork } from '@evm-ui/shared/routes'
import { CRVUSD_ADDRESS } from '@evm-ui/utils'
import { usePathname } from '@ui/hooks/router'

export const useCrvSwapUrl = () =>
  DEX_ROUTES.PAGE_SWAP({ app: 'dex', blockchainId: getCurrentNetwork(usePathname()) ?? 'ethereum', to: CRVUSD_ADDRESS })
