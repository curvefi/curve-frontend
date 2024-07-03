import type { CampaignRewardsCompProps, RewardsPool } from 'ui/src/CampaignRewards/types'

import styled from 'styled-components'
import Image from 'next/image'

import Tooltip from 'ui/src/Tooltip'
import { ExternalLink } from 'ui/src/Link'
import Box from 'ui/src/Box'

const RewardsCompSmall: React.FC<CampaignRewardsCompProps> = ({ rewardsPool, highContrast, mobile }) => {
  const { platform, multiplier, description, platformImageSrc, dashboardLink } = rewardsPool

  const isPoints = rewardsPool.tags.includes('points')

  return (
    <Tooltip tooltip={<TooltipMessage rewardsPool={rewardsPool} />} minWidth={'200px'}>
      <Container highContrast={highContrast}>
        <TokenIcon src={platformImageSrc} alt={platform} width={16} height={16} />
        {isPoints && <Multiplier highContrast={highContrast}>{`${multiplier}x`}</Multiplier>}
      </Container>
    </Tooltip>
  )
}

const TooltipMessage = ({ rewardsPool }: { rewardsPool: RewardsPool }) => {
  const { campaignName, platform, description, dashboardLink, campaignStart, campaignEnd } = rewardsPool

  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }

  const start = new Date(+campaignStart * 1000).toLocaleDateString(undefined, options)
  const end = new Date(+campaignEnd * 1000).toLocaleDateString(undefined, options)

  const title =
    campaignName && platform ? (
      <Box flex flexColumn>
        <TooltipTitle>{campaignName}</TooltipTitle>
        <TooltipParagraph>by {platform}</TooltipParagraph>
      </Box>
    ) : campaignName ? (
      <TooltipTitle>{campaignName}</TooltipTitle>
    ) : (
      <TooltipTitle>{platform}</TooltipTitle>
    )

  return (
    <TooltipWrapper>
      {title}
      {campaignStart && campaignStart !== '0' && campaignEnd && campaignEnd !== '0' && (
        <Box flex flexColumn>
          <TooltipParagraph>{`from: ${start}`}</TooltipParagraph>
          <TooltipParagraph>{`to: ${end}`}</TooltipParagraph>
        </Box>
      )}
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
  gap: var(--spacing-2);
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
  z-index: 999999;
`

const TooltipTitle = styled.h3`
  font-size: var(--font-size-3);
  font-weight: var(--semi-bold);
  text-align: left;
`

const TooltipParagraph = styled.p`
  text-align: left;
`
