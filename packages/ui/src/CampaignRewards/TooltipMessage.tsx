import styled from 'styled-components'
import Box from 'ui/src/Box'
import type { RewardsPool } from 'ui/src/CampaignRewards/types'
import { ExternalLink } from 'ui/src/Link'
import { formatDate } from '../utils'

const TooltipMessage = ({ rewardsPool }: { rewardsPool: RewardsPool }) => {
  const { campaignName, platform, description, action, dashboardLink, campaignStart, campaignEnd } = rewardsPool

  const start = formatDate(new Date(+campaignStart * 1000))
  const end = formatDate(new Date(+campaignEnd * 1000))

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

  const getDescription = () => {
    if (action === 'lp') {
      return description
    }

    if (action === 'supply') {
      return 'Earn points by supplying liquidity.'
    }

    return 'Earn points by borrowing.'
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
      <TooltipParagraph>{getDescription()}</TooltipParagraph>
      <TooltipDisclaimer>
        External rewards are project dependent, always check with the token issuer to make sure you have taken all the
        necessary actions to benefit from their rewards program.
      </TooltipDisclaimer>
      <ExternalLink $noStyles href={dashboardLink}>
        Go to issuer
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
  font-weight: normal;
`

const TooltipDisclaimer = styled.p`
  text-align: left;
  font-weight: normal;
  font-size: var(--font-size-2);
  font-style: italic;
`

export default TooltipMessage
