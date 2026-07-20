import { usePathname } from '@ui-kit/hooks/router'
import { DEX_ROUTES, getCurrentNetwork, getInternalUrl } from '@ui-kit/shared/routes'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

export const useCrvSwapUrl = () =>
  `${getInternalUrl('dex', getCurrentNetwork(usePathname()) ?? 'ethereum', DEX_ROUTES.PAGE_SWAP)}?to=${CRVUSD_ADDRESS}`
