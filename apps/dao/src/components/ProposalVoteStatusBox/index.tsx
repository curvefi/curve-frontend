import styled from 'styled-components'
import { t } from '@lingui/macro'

import { formatNumber, formatNumberWithSuffix } from '@/ui/utils'

import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import ProgressBar from '@/components/ProposalVoteStatusBox/ProgressBar'
import { TooltipIcon } from '@/ui/Tooltip'

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
          <Box flex flexGap="var(--spacing-1)">
            <Data>Participation</Data>
          </Box>
          <Box flex flexGap="var(--spacing-1)">
            <HighlightedData>{formatNumberWithSuffix(votesFor)}</HighlightedData>{' '}
            <Data>of {formatNumberWithSuffix(quorumVeCrv)}</Data>
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
        <ProgressBar active={totalVotes > 0} support={support} minSupport={minSupport} />
        <Box flex flexJustifyContent="space-between">
          <Box flex flexGap="var(--spacing-1)">
            <Data className="for">For</Data> <HighlightedData>{support.toFixed(2)}%</HighlightedData>
          </Box>
          <Box flex flexGap="var(--spacing-1)">
            <HighlightedData>{against.toFixed(2)}%</HighlightedData>
            <Data className="against">Against</Data>
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
  &.for {
    color: var(--chart-green);
  }
  &.against {
    color: var(--chart-red);
  }
`

const HighlightedData = styled(Data)`
  font-weight: var(--bold);
`

export default ProposalVoteStatusBox
