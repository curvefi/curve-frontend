import styled from 'styled-components'
import { t } from '@lingui/macro'

import { formatNumberWithSuffix } from '@/ui/utils'
import { breakpoints } from '@/ui/utils'

import Box from '@/ui/Box'
import ProgressBar from '@/components/ProposalVoteStatusBox/ProgressBar'
import Tooltip, { TooltipIcon } from '@/ui/Tooltip'

type ProposalVoteStatusBoxProps = {
  proposalData: ProposalData
  className?: string
}

const ProposalVoteStatusBox = ({ proposalData, className }: ProposalVoteStatusBoxProps) => {
  const { votesFor, votesAgainst, quorumVeCrv, minAcceptQuorumPercent, minSupport, currentQuorumPercentage } =
    proposalData

  const totalVotes = votesFor + votesAgainst
  const support = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0
  const against = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0

  return (
    <Wrapper className={className}>
      {/* Quroum */}
      <Box flex flexColumn flexGap="var(--spacing-2)">
        <Box flex flexJustifyContent="space-between">
          <Box flex flexGap="var(--spacing-1)" flexAlignItems="flex-end">
            <HighlightedData>{t`Quorum`} </HighlightedData>
          </Box>
          <Box flex flexGap="var(--spacing-1)" flexAlignItems="flex-end">
            <HighlightedData>{formatNumberWithSuffix(votesFor)}</HighlightedData>{' '}
            <Data>of {formatNumberWithSuffix(quorumVeCrv)}</Data>
            <TooltipIcon>{t`The minimum number of For votes required to reach quorum is ${minAcceptQuorumPercent}%.`}</TooltipIcon>
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
            <HighlightedData>{support.toFixed(2)}%</HighlightedData>
            <Data>{t`of ${minSupport}%`}</Data>
            <TooltipIcon>{t`The minimum support required to pass the proposal is ${minSupport}%.`}</TooltipIcon>
          </Box>
        </Box>
        <ProgressBar active={totalVotes > 0} support={support} minSupport={minSupport} />
        <Box flex flexJustifyContent="space-between">
          <Box flex flexGap="var(--spacing-1)" flexAlignItems="flex-end">
            <HighlightedData className="for">{t`For`}</HighlightedData>{' '}
            <Tooltip noWrap tooltip={`${formatNumberWithSuffix(votesFor)} veCRV`}>
              <HighlightedData>{support.toFixed(2)}%</HighlightedData>
            </Tooltip>
          </Box>
          <Box flex flexGap="var(--spacing-1)" flexAlignItems="flex-end">
            <Tooltip noWrap tooltip={`${formatNumberWithSuffix(votesAgainst)} veCRV`}>
              <HighlightedData>{against.toFixed(2)}%</HighlightedData>
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

export default ProposalVoteStatusBox
