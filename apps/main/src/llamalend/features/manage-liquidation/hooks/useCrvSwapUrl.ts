import { usePathname } from '@evm-ui/hooks/router'
import { DEX_ROUTES, getCurrentNetwork, getInternalUrl } from '@evm-ui/shared/routes'
import { CRVUSD_ADDRESS } from '@evm-ui/utils'

export const useCrvSwapUrl = () =>
  `${getInternalUrl('dex', getCurrentNetwork(usePathname()) ?? 'ethereum', DEX_ROUTES.PAGE_SWAP)}?to=${CRVUSD_ADDRESS}`
