import Box from '@mui/material/Box'
import { ChainIcon, ChainIconProps } from '../icons/ChainIcon'
import { TokenBadge } from './TokenBadge'

type ChainIconBadgeProps = Omit<ChainIconProps, 'blockchainId'> & {
  chain: string
}
/** Chain icon to display on top of a token icon */
export const TokenChainIcon = ({ chain, ...chainProps }: ChainIconBadgeProps) => (
  <TokenBadge
    tooltipTitle={
      <Box sx={{ textTransform: 'capitalize' }} component="span">
        {chain}
      </Box>
    }
  >
    <ChainIcon blockchainId={chain} {...chainProps} />
  </TokenBadge>
)
