import Box from '@mui/material/Box'
import { FallbackIcon } from '@ui/images'
import { getBlockchainIconUrl } from '@ui/lib/resource.constants'

const ICON_SIZE = { sm: 20, md: 28, lg: 36 } as const
type IconSize = keyof typeof ICON_SIZE

/**
 * Display a chain icon for the chain switcher.
 * This is different from icons/ChainIcon because it requires a fixed size, some padding and no responsive design.
 */
export const ChainSwitcherIcon = ({ blockchainId, size = 'md' }: { blockchainId: string; size?: IconSize }) => (
  <Box component="span" data-testid={`chain-icon-${blockchainId}`} sx={{ alignItems: 'center', display: 'flex' }}>
    <img
      alt={`${blockchainId} logo`}
      onError={({ currentTarget }) => (currentTarget.src = FallbackIcon)}
      src={getBlockchainIconUrl(blockchainId)}
      loading="lazy"
      width={ICON_SIZE[size]}
      height={ICON_SIZE[size]}
    />
  </Box>
)
