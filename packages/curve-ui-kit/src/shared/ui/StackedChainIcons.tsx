import { ChainIcon, type ChainIconProps } from '../icons/ChainIcon'
import { DEFAULT_OVERLAP, StackedIcons } from './StackedIcons'

type StackedChainIconsProps = {
  blockchainIds: string[]
  size?: ChainIconProps['size']
  /** Percentage of the ChainIcon's width to overlap */
  overlap?: number
}

export const StackedChainIcons = ({
  blockchainIds,
  size = 'md',
  overlap = DEFAULT_OVERLAP,
}: StackedChainIconsProps) => (
  <StackedIcons
    items={blockchainIds}
    getKey={blockchainId => blockchainId}
    renderIcon={blockchainId => <ChainIcon blockchainId={blockchainId} size={size} border />}
    size={size}
    overlap={overlap}
  />
)
