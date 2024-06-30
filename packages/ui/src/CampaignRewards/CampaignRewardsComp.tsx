import type { CampaignRewardsCompProps } from 'ui/src/CampaignRewards/types'

import styled from 'styled-components'
import Image from 'next/image'

import Tooltip from 'ui/src/Tooltip'
import { ExternalLink } from 'ui/src/Link'

const RewardsCompSmall: React.FC<CampaignRewardsCompProps> = ({ rewardsPool, highContrast }) => {
  const { platform, multiplier, description, platformImageSrc, dashboardLink } = rewardsPool

  return (
    <Tooltip
      tooltip={<TooltipMessage platform={platform} description={description} dashboardLink={dashboardLink} />}
      minWidth={'170px'}
    >
      <Container highContrast={highContrast}>
        <TokenIcon src={platformImageSrc} alt={platform} width={16} height={16} />
        <Multiplier highContrast={highContrast}>{`${multiplier}x`}</Multiplier>
      </Container>
    </Tooltip>
  )
}

const TooltipMessage = ({
  platform,
  description,
  dashboardLink,
}: {
  platform: string
  description: string
  dashboardLink: string
}) => {
  return (
    <TooltipWrapper>
      <TooltipTitle>{platform}</TooltipTitle>
      <TooltipParagraph>{description}</TooltipParagraph>
      <ExternalLink $noStyles href={dashboardLink}>
        Learn more
      </ExternalLink>
    </TooltipWrapper>
  )
}

export default RewardsCompSmall

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
`

const TooltipWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  text-align: left;
`

const TooltipTitle = styled.h3`
  font-size: var(--font-size-3);
  font-weight: var(--semi-bold);
  text-align: left;
`

const TooltipParagraph = styled.p`
  text-align: left;
`
