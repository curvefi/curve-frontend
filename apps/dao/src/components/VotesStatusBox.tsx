import styled from 'styled-components'
import { t } from '@lingui/macro'

import { formatNumber, formatNumberWithSuffix } from '@/ui/utils'

import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import ProgressBar from './PageProposals/components/ProgressBar'
import { TooltipIcon } from '@/ui/Tooltip'

type Props = {
  votesFor: number
  votesAgainst: number
  totalVeCrv: number
  quorumVeCrv: number
  minAcceptQuorumPercent: number
  currentQuorumPercentage: number
  className?: string
}

const VotesStatusBox = ({
  votesFor,
  votesAgainst,
  totalVeCrv,
  quorumVeCrv,
  currentQuorumPercentage,
  minAcceptQuorumPercent,
  className,
}: Props) => {
  return (
    <Box className={className}>
      <VoteFor>
        <Box flex>
          <p className="vote-label">{t`For:`}</p>
          <p className="vote-count">{formatNumberWithSuffix(votesFor)} veCRV</p>
          <PercentageVotes>{((votesFor / totalVeCrv) * 100).toFixed(2)}%</PercentageVotes>
        </Box>
        <ProgressBar yesVote percentage={(votesFor / totalVeCrv) * 100} />
      </VoteFor>
      <VoteAgainst>
        <Box flex>
          <p className="vote-label">{t`Against:`}</p>
          <p className="vote-count">{formatNumberWithSuffix(votesAgainst)} veCRV</p>
          <PercentageVotes>{((votesAgainst / totalVeCrv) * 100).toFixed(2)}%</PercentageVotes>
        </Box>
        <ProgressBar yesVote={false} percentage={(votesAgainst / totalVeCrv) * 100} />
      </VoteAgainst>
      <Quorum>
        <Box flex flexAlignItems="center" flexGap="var(--spacing-1)">
          {votesFor >= quorumVeCrv ? (
            <QuorumPassedIcon name="CheckmarkFilled" size={16} />
          ) : (
            <QuorumFailedIcon name="Misuse" size={16} />
          )}
          <p>{t`Quorum:`}</p>
          <p>
            {formatNumberWithSuffix(votesFor)} of {formatNumberWithSuffix(quorumVeCrv)}
          </p>
          <TooltipIcon minWidth="200px">
            <TooltipText>{t`A minimum of ${minAcceptQuorumPercent}% of veCRV tokens must vote 'For' in order for a proposal to meet quorum.`}</TooltipText>
          </TooltipIcon>
        </Box>
        <ProgressBar
          yesVote={currentQuorumPercentage >= minAcceptQuorumPercent}
          percentage={currentQuorumPercentage}
          quorum
        />
      </Quorum>
    </Box>
  )
}

const Vote = styled.div`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  .vote-label {
    margin-right: var(--spacing-1);
  }
  .vote-count {
    font-weight: var(--normal);
    margin-right: auto;
  }
`

const VoteFor = styled(Vote)`
  color: var(--green-500);
  min-width: 100%;
`

const VoteAgainst = styled(Vote)`
  margin-top: var(--spacing-2);
  color: var(--red-500);
`

const PercentageVotes = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  margin-left: var(--spacing-1);
`

const Quorum = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: var(--spacing-4);
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  gap: var(--spacing-1);
  p:nth-child(2) {
    margin-right: auto;
  }
`

const QuorumPassedIcon = styled(Icon)`
  color: var(--chart-green);
  margin: auto 0;
`

const QuorumFailedIcon = styled(Icon)`
  color: var(--chart-red);
  margin: auto 0;
`

const TooltipText = styled.p`
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
`

export default VotesStatusBox
