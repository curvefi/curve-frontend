import { DEX_ROUTES, getCurrentNetwork, getInternalUrl } from '@evm-ui/shared/routes'
import { CRVUSD_ADDRESS } from '@evm-ui/utils'
import { usePathname } from '@ui/hooks/router'

export const useCrvSwapUrl = () =>
  `${getInternalUrl('dex', getCurrentNetwork(usePathname()) ?? 'ethereum', DEX_ROUTES.PAGE_SWAP)}?to=${CRVUSD_ADDRESS}`
