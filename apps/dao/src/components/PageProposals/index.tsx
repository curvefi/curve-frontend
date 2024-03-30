import { PROPOSAL_FILTERS, PROPOSAL_SORTING_METHODS } from './constants'

import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import ProposalsFilters from './components/ProposalsFilters'
import Proposal from './Proposal'
import Box from '@/ui/Box'
import SearchInput from '@/ui/SearchInput'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import SelectSortingMethod from '@/ui/Select/SelectSortingMethod'
import Icon from '@/ui/Icon'

const Proposals = () => {
  const {
    proposalsLoading,
    activeSortBy,
    activeSortDirection,
    setActiveSortBy,
    setActiveSortDirection,
    setActiveFilter,
    activeFilter,
    selectSortedProposals,
  } = useStore((state) => state.daoProposals)

  const handleSortingMethodChange = (key: React.Key) => {
    setActiveSortBy(key as SortByFilter)
  }

  const handleChangeSortingDirection = () => {
    setActiveSortDirection(activeSortDirection === 'asc' ? 'desc' : 'asc')
  }

  console.log(selectSortedProposals()[10])

  return (
    <Wrapper>
      <PageTitle>DAO Proposals</PageTitle>
      <ProposalsContainer variant="secondary">
        <ToolBar>
          <StyledSearchInput
            id="inpSearchProposals"
            placeholder={t`Search`}
            variant="small"
            handleInputChange={() => {}}
            handleSearchClose={() => {}}
            value={''}
          />
          <ListManagerContainer>
            <ProposalsFilters
              filters={PROPOSAL_FILTERS}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          </ListManagerContainer>
          <StyledSelectSortingMethod
            selectedKey={activeSortBy}
            minWidth="9rem"
            items={PROPOSAL_SORTING_METHODS}
            onSelectionChange={handleSortingMethodChange}
          />
          <ToggleDirectionIcon
            size={20}
            name={activeSortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'}
            onClick={() => handleChangeSortingDirection()}
          />
        </ToolBar>
        <ProposalsWrapper>
          {proposalsLoading ? (
            <SpinnerWrapper>
              <Spinner />
            </SpinnerWrapper>
          ) : (
            selectSortedProposals().map((proposal, index) => (
              <Proposal {...proposal} key={`${proposal.voteId}-${index}`} />
            ))
          )}
        </ProposalsWrapper>
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

const ProposalsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--spacing-4);
`

const ListManagerContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: var(--spacing-2);
`

const PageTitle = styled.h2`
  margin: var(--spacing-2) auto var(--spacing-1) var(--spacing-3);
  background-color: black;
  color: var(--nav--page--color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
`

const ToolBar = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: var(--spacing-3);
`

const StyledSelectSortingMethod = styled(SelectSortingMethod)`
  margin: auto 0 auto auto;
`

const ToggleDirectionIcon = styled(Icon)`
  margin: auto 0 auto var(--spacing-2);
  &:hover {
    cursor: pointer;
  }
`

const StyledSearchInput = styled(SearchInput)`
  margin: var(--spacing-2) var(--spacing-2) var(--spacing-1) var(--spacing-2);
`

export default Proposals
