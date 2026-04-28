import { getBlockchainIconUrl } from '@ui/utils'
import { BadgeIcon, type BadgeIconProps } from '../ui/BadgeIcon'

export type ChainIconProps = Omit<BadgeIconProps, 'src' | 'alt' | 'testId'> & {
  blockchainId: string
}

export const ChainIcon = ({ blockchainId, ...badgeProps }: ChainIconProps) => (
  <BadgeIcon
    testId={`chain-icon-${blockchainId}`}
    alt={blockchainId}
    src={getBlockchainIconUrl(blockchainId)}
    {...badgeProps}
  />
)
