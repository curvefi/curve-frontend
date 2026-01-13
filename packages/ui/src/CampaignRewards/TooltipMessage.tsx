import { styled } from 'styled-components'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { Box } from 'ui/src/Box'
import { ExternalLink } from 'ui/src/Link'
import { formatDate } from '../utils'

export const TooltipMessage = ({ rewardsPool }: { rewardsPool: CampaignPoolRewards }) => {
  const { campaignName, platform, description, action, dashboardLink, period, steps } = rewardsPool

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
      {period && (
        <Box flex flexColumn>
          <TooltipParagraph>{`from: ${formatDate(period[0])}`}</TooltipParagraph>
          <TooltipParagraph>{`to: ${formatDate(period[1])}`}</TooltipParagraph>
        </Box>
      )}
      <TooltipParagraph>{getDescription()}</TooltipParagraph>
      {steps && steps.length > 0 && (
        <TooltipParagraph>
          <TooltipStepsTitle>Steps:</TooltipStepsTitle>
          <ol>
            {steps.map((step) => (
              <TooltipStep key={step}>{step}</TooltipStep>
            ))}
          </ol>
        </TooltipParagraph>
      )}
      <TooltipDisclaimer>
        External rewards are project dependent, always check with the token issuer to make sure you have taken all the
        necessary actions to benefit from their rewards program.
      </TooltipDisclaimer>
      <ExternalLink $noStyles href={dashboardLink} target="_blank">
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
  font-weight: var(--bold);
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
`

const TooltipStepsTitle = styled.span`
  font-weight: bold;
`

const TooltipStep = styled.li`
  list-style: auto;
  margin: 0 0 0 2ch;
`
