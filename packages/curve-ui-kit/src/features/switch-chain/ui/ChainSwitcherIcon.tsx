import Box from '@mui/material/Box'
import { getBlockchainIconUrl } from '@ui/utils'

interface ChainIconProps {
  networkId: string
  size?: number
}

/**
 * Display a chain icon for the chain switcher.
 * This is different from icons/ChainIcon because it requires a fixed size, some padding and no responsive design.
 */
export const ChainSwitcherIcon = ({ networkId, size = 28 }: ChainIconProps) => (
  <Box component="span" data-testid={`chain-icon-${networkId}`} sx={{ alignItems: 'center', display: 'flex' }}>
    <img
      alt={`${networkId} logo`}
      // onError={(evt) => (evt.target as HTMLImageElement).src = src}
      src={getBlockchainIconUrl(networkId)}
      loading="lazy"
      width={size}
      height={size}
    />
  </Box>
)
