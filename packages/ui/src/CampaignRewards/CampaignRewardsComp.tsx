import { styled } from 'styled-components'
import { TooltipMessage } from '@ui/CampaignRewards/TooltipMessage'
import { Icon } from '@ui/Icon'
import { TooltipButton as Tooltip } from '@ui/Tooltip/TooltipButton'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'
import { aprToApy, formatNumber } from '@ui-kit/utils'

type CampaignRewardsCompProps = {
  rewardsPool: CampaignRewards
  highContrast?: boolean
  mobile?: boolean
  banner?: boolean
}

export const RewardsCompSmall = ({ rewardsPool, highContrast, mobile, banner }: CampaignRewardsCompProps) => {
  const { platform, reward, platformImageId, action, symbol } = rewardsPool

  return (
    <Tooltip
      clickable
      tooltip={<TooltipMessage rewardsPool={rewardsPool} />}
      minWidth="400px"
      placement={mobile ? 'top' : 'auto'}
      increaseZIndex={banner}
    >
      <Container highContrast={highContrast}>
        <TokenIcon src={platformImageId} alt={platform} width={16} height={16} />
        {(reward != null || symbol) && (
          <Multiplier highContrast={highContrast}>
            {action != 'lp' && `${action} `}
            {reward?.value
              ? reward.type === 'apr'
                ? formatNumber(action === 'supply' ? aprToApy(reward.value) : reward.value, 'percent.rate')
                : formatNumber(reward.value, 'multiplier')
              : symbol}
          </Multiplier>
        )}
        {rewardsPool.lock && <StyledIcon size={16} name="Locked" $highContrast={highContrast} />}
      </Container>
    </Tooltip>
  )
}

const Container = styled.span<{ highContrast?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1);
  border: ${({ highContrast }) => (highContrast ? '1px solid var(--white)' : '1px solid var(--gray-500a25)')};
`

const TokenIcon = styled.img`
  border: 1px solid transparent;
  border-radius: 50%;
`

const Multiplier = styled.span<{ highContrast?: boolean }>`
  text-transform: uppercase;
  font-size: var(--font-size-3);
  color: ${({ highContrast }) => (highContrast ? 'var(--white)' : 'var(--page--text-color)')};
  white-space: nowrap;
`

// note: $ prefix so prop is not passed to <Icon>
const StyledIcon = styled(Icon)<{ $highContrast?: boolean }>`
  color: ${({ $highContrast }) => ($highContrast ? 'var(--white)' : 'var(--page--text-color)')};
`
