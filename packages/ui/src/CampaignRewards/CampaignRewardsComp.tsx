import { styled } from 'styled-components'
import { CURVE_ASSETS_URL } from '@ui/utils'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import TooltipMessage from 'ui/src/CampaignRewards/TooltipMessage'
import Icon from 'ui/src/Icon'
import Tooltip from 'ui/src/Tooltip/TooltipButton'

type CampaignRewardsCompProps = {
  rewardsPool: CampaignPoolRewards
  highContrast?: boolean
  mobile?: boolean
  banner?: boolean
}

const RewardsCompSmall = ({ rewardsPool, highContrast, mobile, banner }: CampaignRewardsCompProps) => {
  const { platform, multiplier, platformImageId } = rewardsPool
  const platformImageSrc = `${CURVE_ASSETS_URL}/platforms/${platformImageId}`

  const hasMultiplier = !!multiplier

  return (
    <Tooltip
      clickable
      tooltip={<TooltipMessage rewardsPool={rewardsPool} />}
      minWidth={'400px'}
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

const TokenIcon = styled.img`
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
