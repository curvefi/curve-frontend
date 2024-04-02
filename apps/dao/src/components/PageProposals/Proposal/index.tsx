import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useMemo } from 'react'

import { shortenTokenAddress, formatNumber } from '@/ui/utils'
import networks from '@/networks'

import { ExternalLink } from '@/ui/Link'
import Box from '@/ui/Box'
import ProgressBar from '../components/ProgressBar'
import VoteCountdown from '../components/VoteCountdown'

type Props = ProposalData

const Proposal = ({
  voteId,
  voteType,
  creator,
  startDate,
  snapshotBlock,
  ipfsMetadata,
  metadata,
  votesFor,
  votesAgainst,
  voteCount,
  supportRequired,
  minAcceptQuorumPercent,
  totalVeCrv,
  executed,
  status,
}: Props) => {
  return (
    <ProposalContainer>
      <InformationWrapper>
        <ProposalDetailsRow>
          <ProposalStatus
            className={`${status === 'Active' && 'active'} ${status === 'Denied' && 'denied'} ${
              status === 'Passed' && 'passed'
            }`}
          >
            {status}
          </ProposalStatus>
          <ProposalId>#{voteId}</ProposalId>
          <ProposalType>{voteType}</ProposalType>
        </ProposalDetailsRow>
        <ProposalMetadata>{metadata}</ProposalMetadata>
        <Box flex>
          <ProposalProposer>{t`Proposer:`}</ProposalProposer>
          <StyledExternalLink href={networks[1].scanAddressPath(creator)}>
            {shortenTokenAddress(creator)}
          </StyledExternalLink>
        </Box>
      </InformationWrapper>
      <VoteWrapper>
        <VoteCountdown startDate={startDate} />
        <VoteFor>
          <Box display="grid" gridTemplateColumns="2.2rem 1fr 0.2fr">
            <p className="vote-label">Yes:</p>
            <p className="vote-count">{formatNumber(votesFor.toFixed(0))} veCRV</p>
            <PercentageVotes>{((votesFor / totalVeCrv) * 100).toFixed(2)}%</PercentageVotes>
          </Box>
          <ProgressBar yesVote percentage={(votesFor / totalVeCrv) * 100} />
        </VoteFor>
        <VoteAgainst>
          <Box display="grid" gridTemplateColumns="2.2rem 1fr 0.2fr">
            <p className="vote-label">No:</p>
            <p className="vote-count">{formatNumber(votesAgainst.toFixed(0))} veCRV</p>
            <PercentageVotes>{((votesAgainst / totalVeCrv) * 100).toFixed(2)}%</PercentageVotes>
          </Box>
          <ProgressBar yesVote={false} percentage={(votesAgainst / totalVeCrv) * 100} />
        </VoteAgainst>
        <Quorum>
          <p>Quorum:</p>
          <p>{formatNumber(minAcceptQuorumPercent)}%</p>
        </Quorum>
      </VoteWrapper>
    </ProposalContainer>
  )
}

const ProposalContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
`

const InformationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--spacing-3);
  background-color: var(--summary_content--background-color);
  min-width: 100%;
`

const ProposalDetailsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-2);
`

const ProposalId = styled.h4`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  padding-right: var(--spacing-2);
  padding-left: var(--spacing-1);
  border-right: 2px solid var(--gray-500);
`

const ProposalStatus = styled.h4`
  border: 1px solid var(--gray-500);
  font-size: var(--font-size-1);
  text-transform: uppercase;
  /* border-right: 2px solid var(--gray-500); */
  padding: 0.2rem 0.4rem;
  &.passed {
    :before {
      display: inline-block;
      content: '';
      margin: auto 0.3rem auto 0;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--success-400);
      border-radius: 50%;
    }
  }
  &.denied {
    :before {
      display: inline-block;
      content: '';
      margin: auto 0.3rem auto 0;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--danger-400);
      border-radius: 50%;
    }
  }
  &.active {
    :before {
      display: inline-block;
      content: '';
      margin: auto 0.3rem auto 0;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--warning-400);
      border-radius: 50%;
    }
  }
`

const ProposalType = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
`

const ProposalMetadata = styled.p`
  margin: var(--spacing-4) 0;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  width: 37.5rem;
  line-height: 1.5;
`

const ProposalProposer = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  opacity: 0.7;
`

const StyledExternalLink = styled(ExternalLink)`
  margin-left: var(--spacing-1);
  color: var(--page--text-color);
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  &:hover {
    cursor: pointer;
  }
`

const VoteWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  background-color: var(--summary_header--background-color);
`

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
    font-weight: var(--semi-bold);
  }
`

const VoteFor = styled(Vote)`
  color: var(--green-500);
  min-width: 100%;
`

const PercentageVotes = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  margin-left: auto;
`

const VoteAgainst = styled(Vote)`
  margin-top: var(--spacing-2);
  color: var(--red-500);
`

const Quorum = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: var(--spacing-3);
  font-size: var(--font-size-2);
  font-weight: var(--bold);
`

export default Proposal
