import { BadgeIcon, type BadgeIconProps } from '@ui/components/BadgeIcon'
import { getBlockchainIconUrl } from '@ui/lib/resource.constants'

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
