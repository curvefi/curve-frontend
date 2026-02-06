import Box from '@mui/material/Box'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { ChainIcon, ChainIconProps } from '../icons/ChainIcon'

type ChainIconBadgeProps = {
  chain: string
  size?: ChainIconProps['size']
}
/** Chain icon to display on top of a token icon */
export const TokenChainIcon = ({ chain, size = 'sm' }: ChainIconBadgeProps) => (
  <Tooltip title={chain} placement="top" slotProps={{ popper: { sx: { textTransform: 'capitalize' } } }}>
    <Box sx={{ position: 'absolute', top: '-16.66%', left: '-16.66%' }}>
      <ChainIcon size={size} blockchainId={chain} />
    </Box>
  </Tooltip>
)
