import { getBlockchainIconUrl } from '@legacy-ui/utils'
import Box from '@mui/material/Box'

type ChainIconProps = {
  blockchainId: string
  size?: number
}

/**
 * Display a chain icon for the chain switcher.
 * This is different from icons/ChainIcon because it requires a fixed size, some padding and no responsive design.
 */
export const ChainSwitcherIcon = ({ blockchainId, size = 28 }: ChainIconProps) => (
  <Box component="span" data-testid={`chain-icon-${blockchainId}`} sx={{ alignItems: 'center', display: 'flex' }}>
    <img
      alt={`${blockchainId} logo`}
      // onError={(evt) => (evt.target as HTMLImageElement).src = src}
      src={getBlockchainIconUrl(blockchainId)}
      loading="lazy"
      width={size}
      height={size}
    />
  </Box>
)
