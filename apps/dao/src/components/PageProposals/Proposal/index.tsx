import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useMemo } from 'react'

import { shortenTokenAddress } from '@/ui/utils'
import networks from '@/networks'

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
  status,
}: Props) => {
  return (
    <ProposalContainer>
      <InformationWrapper>
        <ProposalStatus
          className={`${status === 'Active' && 'active'} ${status === 'Denied' && 'denied'} ${
            status === 'Passed' && 'passed'
          }`}
        >
          {status}
        </ProposalStatus>
        <ProposalType>
          #{voteId} | {voteType}
        </ProposalType>
        <ProposalMetadata>{metadata}</ProposalMetadata>
        <Box flex>
          <ProposalProposer>{t`Proposer:`}</ProposalProposer>
          <StyledExternalLink href={networks[1].scanAddressPath(creator)}>
            {shortenTokenAddress(creator)}
          </StyledExternalLink>
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

const ProposalStatus = styled.h4`
  font-size: var(--font-size-1);
  text-transform: uppercase;
  background-color: var(--table--background-color);
  margin-top: calc(-1.5rem - var(--spacing-1));
  margin-bottom: var(--spacing-2);
  margin-left: var(--spacing-1);
  margin-right: auto;
  padding: 0.2rem 0.5rem;
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
  font-size: var(--font-size-2);
  font-weight: var(--bold);
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
