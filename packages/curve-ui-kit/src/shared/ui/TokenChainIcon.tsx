import { ChainIcon, ChainIconProps } from '../icons/ChainIcon'
import { TokenBadge } from './TokenBadge'

type ChainIconBadgeProps = Omit<ChainIconProps, 'blockchainId'> & {
  chain: string
}
/** Chain icon to display on top of a token icon */
export const TokenChainIcon = ({ chain, ...chainProps }: ChainIconBadgeProps) => (
  <TokenBadge tooltipTitle={chain}>
    <ChainIcon blockchainId={chain} {...chainProps} />
  </TokenBadge>
)
