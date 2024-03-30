import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useMemo } from 'react'

import { shortenTokenAddress, formatNumber } from '@/ui/utils'
import networks from '@/networks'

import { ExternalLink } from '@/ui/Link'
import Box from '@/ui/Box'
import ProgressBar from '../components/ProgressBar'

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
          <ProposalId>#{voteId}</ProposalId>
          <ProposalStatus
            className={`${status === 'Active' && 'active'} ${status === 'Denied' && 'denied'} ${
              status === 'Passed' && 'passed'
            }`}
          >
            {status}
          </ProposalStatus>
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
        <VoteFor>
          <Box display="grid" gridTemplateColumns="2.2rem 1fr 0.2fr">
            <p className="vote-label">Yes:</p>
            {formatNumber(votesFor.toFixed(0))} veCRV
            <PercentageVotes>{((votesFor / totalVeCrv) * 100).toFixed(2)}%</PercentageVotes>
          </Box>
          <ProgressBar yesVote percentage={(votesFor / totalVeCrv) * 100} />
        </VoteFor>
        <VoteAgainst>
          <Box display="grid" gridTemplateColumns="2.2rem 1fr 0.2fr">
            <p className="vote-label">No:</p>
            {formatNumber(votesAgainst.toFixed(0))} veCRV
            <PercentageVotes>{((votesAgainst / totalVeCrv) * 100).toFixed(2)}%</PercentageVotes>
          </Box>
          <ProgressBar yesVote={false} percentage={(votesAgainst / totalVeCrv) * 100} />
        </VoteAgainst>
        <Quorum>
          <p>Quorum:</p>
          <p>{formatNumber(minAcceptQuorumPercent * 100)}%</p>
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
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  padding-right: var(--spacing-2);
  border-right: 2px solid var(--gray-500);
`

const ProposalStatus = styled.h4`
  font-size: var(--font-size-1);
  text-transform: uppercase;
  border-right: 2px solid var(--gray-500);
  padding-right: var(--spacing-2);
  /* &.passed {
    border-left: 0.4rem solid green;
  }
  &.denied {
    border-left: 0.4rem solid red;
  }
  &.active {
    border-left: 0.4rem solid yellow;
  } */
`

const ProposalType = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  padding-right: var(--spacing-2);
`

const ProposalMetadata = styled.p`
  margin: var(--spacing-4) 0;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
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
  justify-content: center;
  padding: var(--spacing-3);
  background-color: var(--summary_content--background-color);
`

const Vote = styled.div`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`

const VoteFor = styled(Vote)`
  color: var(--green-500);
  min-width: 100%;
  .vote-label {
    margin-right: var(--spacing-1);
  }
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
