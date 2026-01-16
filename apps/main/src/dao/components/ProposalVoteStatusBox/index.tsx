import { styled } from 'styled-components'
import { ProgressBar } from '@/dao/components/ProposalVoteStatusBox/ProgressBar'
import { ProposalData } from '@/dao/entities/proposals-mapper'
import { Box } from '@ui/Box'
import { TooltipButton as Tooltip } from '@ui/Tooltip/TooltipButton'
import { TooltipIcon } from '@ui/Tooltip/TooltipIcon'
import { breakpoints, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

type ProposalVoteStatusBoxProps = {
  proposalData: ProposalData
  className?: string
}

export const ProposalVoteStatusBox = ({ proposalData, className }: ProposalVoteStatusBoxProps) => {
  const { votesFor, votesAgainst, quorum, support, currentQuorumPercentage } = proposalData
  const minAcceptQuorumPercent = quorum * 100
  const minSupport = support * 100

  const totalVotes = votesFor + votesAgainst
  const currentSupport = totalVotes > 0 ? votesFor / totalVotes : 0
  const against = totalVotes > 0 ? votesAgainst / totalVotes : 0

  return (
    <Wrapper className={className}>
      {/* Quroum */}
      <Box flex flexColumn flexGap="var(--spacing-2)">
        <Box flex flexJustifyContent="space-between">
          <Box flex flexGap="var(--spacing-1)" flexAlignItems="flex-end">
            <HighlightedData>{t`Quorum`} </HighlightedData>
          </Box>
          <Box flex flexGap="var(--spacing-1)" flexAlignItems="flex-end">
            <HighlightedData>
              {formatNumber(currentQuorumPercentage, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
            </HighlightedData>{' '}
            <Data>
              ({formatNumber(minAcceptQuorumPercent, { notation: 'compact' })}% {t`needed`})
            </Data>
            <TooltipIcon>{t`The minimum share of For votes required to reach quorum is ${minAcceptQuorumPercent}% for this proposal.`}</TooltipIcon>
          </Box>
        </Box>
        <ProgressBar
          active={totalVotes > 0}
          support={currentQuorumPercentage}
          minSupport={minAcceptQuorumPercent}
          quorum
        />
      </Box>

      <Box flex flexColumn flexGap="var(--spacing-2)">
        <Box flex flexGap="var(--spacing-1)" flexJustifyContent="space-between">
          <Box flex flexGap="var(--spacing-1)" flexAlignItems="flex-end">
            <HighlightedData>{t`Min Support`}</HighlightedData>
          </Box>
          <Box flex flexGap="var(--spacing-1)" flexAlignItems="flex-end">
            <HighlightedData>
              {formatNumber(currentSupport * 100, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
            </HighlightedData>
            <Data>({t`${minSupport}% needed`})</Data>
            <TooltipIcon>{t`The minimum support required to pass this proposal is ${minSupport}%.`}</TooltipIcon>
          </Box>
        </Box>
        <ProgressBar active={totalVotes > 0} support={currentSupport * 100} minSupport={minSupport} />
        <Box flex flexJustifyContent="space-between">
          <Box flex flexGap="var(--spacing-1)" flexAlignItems="flex-end">
            <HighlightedData className="for">{t`For`}</HighlightedData>{' '}
            <Tooltip noWrap tooltip={`${formatNumber(votesFor, { notation: 'compact' })} veCRV`}>
              <HighlightedData>
                {formatNumber(currentSupport * 100, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </HighlightedData>
            </Tooltip>
          </Box>
          <Box flex flexGap="var(--spacing-1)" flexAlignItems="flex-end">
            <Tooltip noWrap tooltip={`${formatNumber(votesAgainst, { notation: 'compact' })} veCRV`}>
              <HighlightedData>
                {formatNumber(against * 100, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </HighlightedData>
            </Tooltip>
            <HighlightedData className="against">{t`Against`}</HighlightedData>
          </Box>
        </Box>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`

const Data = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  padding-bottom: var(--spacing-1);
  &.for {
    color: var(--chart-green);
  }
  &.against {
    color: var(--chart-red);
  }
  &.align-right {
    text-align: right;
  }
  &.fade {
  }
  @media (min-width: ${breakpoints.sm}rem) {
    align-self: flex-end;
    padding-bottom: 0;
  }
`

const HighlightedData = styled(Data)`
  font-weight: var(--bold);
  padding-bottom: var(--spacing-1);
  align-self: flex-end;
  @media (min-width: ${breakpoints.sm}rem) {
    padding-bottom: 0;
  }
`
