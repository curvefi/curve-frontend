import type { CampaignRewardsCompProps } from 'ui/src/CampaignRewards/types'

import styled from 'styled-components'
import Image from 'next/image'

import Tooltip from 'ui/src/Tooltip'
import TooltipMessage from 'ui/src/CampaignRewards/TooltipMessage'

const RewardsCompSmall: React.FC<CampaignRewardsCompProps> = ({ rewardsPool, highContrast, mobile, banner }) => {
  const { platform, multiplier, platformImageSrc } = rewardsPool

  const isPoints = rewardsPool.tags.includes('points')

  return (
    <Tooltip
      tooltip={<TooltipMessage rewardsPool={rewardsPool} />}
      minWidth={'200px'}
      placement={mobile ? 'top' : 'auto'}
      increaseZIndex={banner}
    >
      <Container highContrast={highContrast}>
        <TokenIcon src={platformImageSrc} alt={platform} width={16} height={16} />
        {isPoints && <Multiplier highContrast={highContrast}>{`${multiplier}x`}</Multiplier>}
      </Container>
    </Tooltip>
  )
}

const Container = styled.div<{ highContrast?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1);
  border: ${({ highContrast }) => (highContrast ? '1px solid var(--white)' : '1px solid var(--gray-500a25)')};
`

const TokenIcon = styled(Image)`
  border: 1px solid transparent;
  border-radius: 50%;
`

const Multiplier = styled.p<{ highContrast?: boolean }>`
  text-transform: uppercase;
  font-size: var(--font-size-3);
  color: ${({ highContrast }) => (highContrast ? 'var(--white)' : '--page--text-color')};
  white-space: nowrap;
`

export default RewardsCompSmall
