import styled from 'styled-components'

import { shortenTokenAddress } from '@/utils'

import { ExternalLink } from '@/ui/Link'
import Box from '@/ui/Box'

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
  minAcceptQuorum,
  totalSupply,
  executed,
}: Props) => {
  return (
    <ProposalContainer>
      <InformationWrapper>
        <ProposalType>
          #{voteId} | {voteType}
        </ProposalType>
        <ProposalMetadata>{metadata}</ProposalMetadata>
        <Box flex>
          <ProposalProposer>Proposer:</ProposalProposer>
          <StyledExternalLink>{shortenTokenAddress(creator)}</StyledExternalLink>
        </Box>
      </InformationWrapper>
      <VoteWrapper></VoteWrapper>
    </ProposalContainer>
  )
}

const ProposalContainer = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  background-color: var(--table--background-color);
`

const InformationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
`

const ProposalType = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  opacity: 0.7;
`

const ProposalMetadata = styled.p`
  margin: var(--spacing-4) 0;
  font-size: var(--font-size-3);
  font-weight: var(--semi-bold);
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
  margin: var(--spacing-3);
  border-left: 2px solid var(--box--primary--background);
`

const Quorum = styled.div``

export default Proposal
