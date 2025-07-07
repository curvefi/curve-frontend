import { usePathname } from 'next/navigation'
import { CallMade } from '@mui/icons-material'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { DEX_ROUTES, getCurrentNetwork, getInternalUrl } from '@ui-kit/shared/routes'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

const CRVUSD_ADDRESS = '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e'

/**
 * Button component that redirects users to the DEX swap page with crvUSD pre-selected as the destination token.
 * Opens in a new tab and dynamically determines the network based on the current pathname.
 */
export const ButtonGetCrvUsd = () => {
  const pathname = usePathname()
  const networkId = getCurrentNetwork(pathname)
  const href = `${getInternalUrl('dex', networkId, DEX_ROUTES.PAGE_SWAP)}?to=${CRVUSD_ADDRESS}`

  return (
    <Button
      component={Link}
      color="ghost"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      size="extraSmall"
      endIcon={<CallMade sx={{ width: IconSize.md, height: IconSize.md }} />}
    >
      Get crvUSD
    </Button>
  )
}
