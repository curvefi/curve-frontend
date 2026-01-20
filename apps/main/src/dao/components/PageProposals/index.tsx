import { useCallback } from 'react'
import { styled } from 'styled-components'
import { ErrorMessage } from '@/dao/components/ErrorMessage'
import { useStore } from '@/dao/store/useStore'
import { SortByFilterProposals, type ProposalListFilter } from '@/dao/types/dao.types'
import { getEthPath } from '@/dao/utils'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import { SearchInput } from '@ui/SearchInput'
import { SelectSortingMethod } from '@ui/Select/SelectSortingMethod'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { DAO_ROUTES } from '@ui-kit/shared/routes'
import { invalidateProposals } from '../../entities/proposals-mapper'
import { useProposalsList } from '../../hooks/useProposalsList'
import { ProposalsFilters } from './components/ProposalsFilters'
import { PROPOSAL_FILTERS, PROPOSAL_SORTING_METHODS } from './constants'
import { Proposal } from './Proposal'

export const Proposals = () => {
  const activeSortBy = useStore((state) => state.proposals.activeSortBy)
  const activeSortDirection = useStore((state) => state.proposals.activeSortDirection)
  const setActiveSortBy = useStore((state) => state.proposals.setActiveSortBy)
  const setActiveSortDirection = useStore((state) => state.proposals.setActiveSortDirection)
  const setActiveFilter = useStore((state) => state.proposals.setActiveFilter)
  const setSearchValue = useStore((state) => state.proposals.setSearchValue)
  const searchValue = useStore((state) => state.proposals.searchValue)
  const activeFilter = useStore((state) => state.proposals.activeFilter)
  const push = useNavigate()

  const { data: proposalsList, isLoading, isError, isSuccess } = useProposalsList()

  const handleChangeSortingDirection = useCallback(() => {
    setActiveSortDirection(activeSortDirection === 'asc' ? 'desc' : 'asc')
  }, [activeSortDirection, setActiveSortDirection])

  const handleProposalClick = useCallback(
    (rProposalId: string) => {
      push(getEthPath(`${DAO_ROUTES.PAGE_PROPOSALS}/${rProposalId}`))
    },
    [push],
  )

  return (
    <Wrapper>
      <ProposalsContainer variant="secondary">
        <Header>
          <h3 data-testid="proposal-title">{t`PROPOSALS`}</h3>
          <StyledSearchInput
            id="inpSearchProposals"
            placeholder={t`Search`}
            variant="small"
            handleInputChange={(val) => setSearchValue(val)}
            handleSearchClose={() => setSearchValue('')}
            value={searchValue}
          />
        </Header>
        <SortingBox>
          <ListManagerContainer>
            <StyledSelectFilter
              items={PROPOSAL_FILTERS}
              selectedKey={activeFilter}
              minWidth="9rem"
              onSelectionChange={(key) => key != null && setActiveFilter(key as ProposalListFilter)}
            />
            <StyledProposalsFilters
              filters={PROPOSAL_FILTERS}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              listLength={proposalsList.length}
              proposalsLoading={isLoading}
            />
          </ListManagerContainer>
          <SortingMethodContainer>
            <StyledSelectSortingMethod
              selectedKey={activeSortBy}
              minWidth="9rem"
              items={PROPOSAL_SORTING_METHODS}
              onSelectionChange={(key) => key != null && setActiveSortBy(key as SortByFilterProposals)}
            />
            <ToggleDirectionIcon
              size={20}
              name={activeSortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'}
              onClick={() => handleChangeSortingDirection()}
            />
          </SortingMethodContainer>
        </SortingBox>
        <Box flex flexColumn>
          {searchValue !== '' && (
            <SearchMessage>
              Showing results ({proposalsList.length}) for &quot;<strong>{searchValue}</strong>&quot;:
            </SearchMessage>
          )}
          <ProposalsWrapper>
            {isLoading && (
              <StyledSpinnerWrapper>
                <Spinner />
              </StyledSpinnerWrapper>
            )}
            {isError && (
              <ErrorMessageWrapper>
                <ErrorMessage message={t`Error fetching proposals`} onClick={() => invalidateProposals({})} />
              </ErrorMessageWrapper>
            )}
            {isSuccess &&
              proposalsList.map((proposal, index) => (
                <Proposal proposalData={proposal} handleClick={handleProposalClick} key={`${proposal.id}-${index}`} />
              ))}
          </ProposalsWrapper>
        </Box>
      </ProposalsContainer>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto 0;
  width: 65rem;
  max-width: 100%;
  flex-grow: 1;
  min-height: 100%;
  @media (min-width: 49.6875rem) {
    max-width: 95%;
  }
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
  width: 100%;
  @media (min-width: 29.375rem) {
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
  }
`

const ProposalsContainer = styled(Box)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-width: 100%;
  width: 100%;
  max-width: 100vw;
`

const ProposalsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: var(--spacing-3);
  padding: 0 0 var(--spacing-7);
  @media (min-width: 25rem) {
    padding: 0 var(--spacing-3) var(--spacing-7);
  }
`

const SortingBox = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  padding: 0 var(--spacing-3) var(--spacing-3);
  @media (min-width: 63rem) {
    display: flex;
  }
`

const StyledSearchInput = styled(SearchInput)`
  width: calc(100vw - var(--spacing-3) - var(--spacing-3));
  @media (min-width: 29.375rem) {
    width: 15rem;
    grid-row: 1/2;
    grid-column: 1/2;
  }
`

const ListManagerContainer = styled.div`
  display: flex;
  flex-direction: row;
  @media (min-width: 37.4375rem) {
    margin: var(--spacing-1) 0 var(--spacing-2) 0;
  }
  @media (min-width: 63rem) {
    margin: auto 0;
  }
`

const SortingMethodContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: auto 0 auto auto;
  @media (min-width: 28.1875rem) {
    grid-row: 1/2; // Changed to second row
    grid-column: 2/3;
  }
`

const StyledSelectFilter = styled(SelectSortingMethod)`
  margin: auto 0;
  grid-column: 1/2;
  grid-row: 2/3;
  @media (min-width: 37.5rem) {
    display: none;
  }
`

const StyledProposalsFilters = styled(ProposalsFilters)`
  display: flex;
  @media (max-width: 37.4375rem) {
    display: none;
  }
`

const StyledSelectSortingMethod = styled(SelectSortingMethod)`
  margin: auto 0;
  @media (min-width: 28.1875rem) {
    grid-column: 1/2;
    grid-row: 1/2;
  }
`

const ToggleDirectionIcon = styled(Icon)`
  margin: auto 0 auto var(--spacing-2);
  &:hover {
    cursor: pointer;
  }
`

const SearchMessage = styled.p`
  font-size: var(--font-size-2);
  margin-left: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  padding: 0 var(--spacing-3);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  width: 100%;
`

const ErrorMessageWrapper = styled.div`
  width: 100%;
  min-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-5) 0;
  @media (min-width: 25rem) {
    padding: var(--spacing-5) var(--spacing-3);
  }
`
