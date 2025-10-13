import { CallMade } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { usePathname } from '@ui-kit/hooks/router'
import { DEX_ROUTES, getCurrentNetwork, getInternalUrl } from '@ui-kit/shared/routes'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

const { IconSize } = SizesAndSpaces

/**
 * Button component that redirects users to the DEX swap page with crvUSD pre-selected as the destination token.
 * Opens in a new tab and dynamically determines the network based on the current pathname.
 */
export const ButtonGetCrvUsd = () => {
  const pathname = usePathname()
  const networkId = getCurrentNetwork(pathname) ?? 'ethereum'
  return (
    <Button
      component={Link}
      color="ghost"
      href={`${getInternalUrl('dex', networkId, DEX_ROUTES.PAGE_SWAP)}?to=${CRVUSD_ADDRESS}`}
      target="_blank"
      size="extraSmall"
      endIcon={<CallMade sx={{ width: IconSize.md, height: IconSize.md }} />}
    >
      Get crvUSD
    </Button>
  )
}
