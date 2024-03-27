import type { ProposalListFilter } from './types'

import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useMemo } from 'react'

import useStore from '@/store/useStore'

import ProposalsFilters from './Proposal/components/ProposalsFilters'
import Proposal from './Proposal'
import Box from '@/ui/Box'
import SearchInput from '@/ui/SearchInput'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'

const Proposals = () => {
  const { proposalsLoading, proposals } = useStore((state) => state.daoProposals)

  const tempProposal: ProposalData[] = [
    {
      creator: '0x0fc59c9c998537c940a9dfc7dacde533a9c496fe',
      executed: false,
      ipfsMetadata: 'ipfs:QmRuJpbQVYEh5Myjn35tCX1MtmmtVPpYo3Pxv8kok6GSBi',
      metadata: 'Add a gauge for the following pool: https://gov.curve.fi/t/proposal-to-add-eeth-rsweth-gauge/9924',
      minAcceptQuorum: '300000000000000000',
      snapshotBlock: 19125887,
      startDate: 1706697143,
      supportRequired: '510000000000000000',
      totalSupply: '647386881479492571972543950',
      voteCount: 1,
      voteId: 596,
      voteType: 'OWNERSHIP',
      votesAgainst: '0',
      votesFor: '273493296797183379082898042',
      status: 'Active',
    },
  ]

  const FILTERS: ProposalListFilter[] = useMemo(
    () => [
      { key: 'all', label: 'All' },
      { key: 'active', label: 'Active' },
      { key: 'passed', label: 'Passed' },
      { key: 'denied', label: 'Denied' },
    ],
    []
  )

  return (
    <Wrapper>
      <PageTitle>DAO Proposals</PageTitle>
      <ProposalsContainer variant="primary">
        <StyledSearchInput
          id="inpSearchProposals"
          placeholder={t`Search`}
          variant="small"
          handleInputChange={() => {}}
          handleSearchClose={() => {}}
          value={''}
        />
        <ListManagerContainer>
          <ProposalsFilters filters={FILTERS} />
        </ListManagerContainer>
        <Box>
          {proposalsLoading ? (
            <SpinnerWrapper>
              <Spinner />
            </SpinnerWrapper>
          ) : (
            tempProposal.map((proposal) => <Proposal {...proposal} key={proposal.voteId} />)
          )}
        </Box>
      </ProposalsContainer>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-5) auto 0;
  max-width: 60rem;
  flex-grow: 1;
  min-height: 100%;
`

const ProposalsContainer = styled(Box)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-3);
  row-gap: var(--spacing-3);
`

const ListManagerContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: var(--spacing-2);
`

const PageTitle = styled.h2`
  margin: var(--spacing-2) auto var(--spacing-1) var(--spacing-2);
  background-color: black;
  color: var(--nav--page--color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
`

const StyledSearchInput = styled(SearchInput)`
  margin: var(--spacing-2) auto var(--spacing-1) var(--spacing-2);
`

export default Proposals
