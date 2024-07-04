import type { RewardsPool } from 'ui/src/CampaignRewards/types'

import styled from 'styled-components'

import { ExternalLink } from 'ui/src/Link'
import Box from 'ui/src/Box'

const TooltipMessage = ({ rewardsPool }: { rewardsPool: RewardsPool }) => {
  const { campaignName, platform, description, dashboardLink, campaignStart, campaignEnd } = rewardsPool

  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }

  const start = new Date(+campaignStart * 1000).toLocaleDateString(undefined, options)
  const end = new Date(+campaignEnd * 1000).toLocaleDateString(undefined, options)

  const title = () => {
    if (campaignName && platform) {
      return (
        <Box flex flexColumn>
          <TooltipTitle>{campaignName}</TooltipTitle>
          <TooltipParagraph>by {platform}</TooltipParagraph>
        </Box>
      )
    }
    if (campaignName) {
      return <TooltipTitle>{campaignName}</TooltipTitle>
    }
    return <TooltipTitle>{platform}</TooltipTitle>
  }

  return (
    <TooltipWrapper>
      {title()}
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

const TooltipWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  text-align: left;
  z-index: 2;
`

const TooltipTitle = styled.h3`
  font-size: var(--font-size-3);
  font-weight: var(--semi-bold);
  text-align: left;
`

const TooltipParagraph = styled.p`
  text-align: left;
`

export default TooltipMessage
