import type { CampaignRewardsCompProps } from 'ui/src/CampaignRewards/types'

import styled from 'styled-components'
import Image from 'next/image'

import Tooltip from 'ui/src/Tooltip'
import TooltipMessage from 'ui/src/CampaignRewards/TooltipMessage'
import Icon from 'ui/src/Icon'

const RewardsCompSmall: React.FC<CampaignRewardsCompProps> = ({ rewardsPool, highContrast, mobile, banner }) => {
  const { platform, multiplier, platformImageSrc } = rewardsPool

  const hasMultiplier = !!multiplier

  return (
    <Tooltip
      tooltip={<TooltipMessage rewardsPool={rewardsPool} />}
      minWidth={'200px'}
      placement={mobile ? 'top' : 'auto'}
      increaseZIndex={banner}
    >
      <Container highContrast={highContrast}>
        <TokenIcon src={platformImageSrc} alt={platform} width={16} height={16} />
        {hasMultiplier && <Multiplier highContrast={highContrast}>{`${multiplier}`}</Multiplier>}
        {rewardsPool.lock && <StyledIcon size={16} name="Locked" $highContrast={highContrast} />}
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
  color: ${({ highContrast }) => (highContrast ? 'var(--white)' : 'var(--page--text-color)')};
  white-space: nowrap;
`

// note: $ prefix so prop is not passed to <Icon>
const StyledIcon = styled(Icon)<{ $highContrast?: boolean }>`
  color: ${({ $highContrast }) => ($highContrast ? 'var(--white)' : 'var(--page--text-color)')};
`

export default RewardsCompSmall
