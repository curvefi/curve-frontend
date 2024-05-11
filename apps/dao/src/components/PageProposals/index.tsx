import { PROPOSAL_FILTERS, PROPOSAL_SORTING_METHODS } from './constants'

import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect } from 'react'

import useStore from '@/store/useStore'

import ProposalsFilters from './components/ProposalsFilters'
import Proposal from './Proposal'
import Box from '@/ui/Box'
import SearchInput from '@/ui/SearchInput'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import SelectSortingMethod from '@/ui/Select/SelectSortingMethod'
import Icon from '@/ui/Icon'

type Props = {}

const Proposals = () => {
  const {
    proposalsLoading,
    filteringProposalsLoading,
    activeSortBy,
    activeSortDirection,
    setActiveSortBy,
    setActiveSortDirection,
    setActiveFilter,
    setSearchValue,
    searchValue,
    activeFilter,
    setProposals,
    proposals,
  } = useStore((state) => state.proposals)
  const isLoadingCurve = useStore((state) => state.isLoadingCurve)
  const navigate = useNavigate()

  const handleSortingMethodChange = useCallback(
    (key: React.Key) => {
      setActiveSortBy(key as SortByFilterProposals)
    },
    [setActiveSortBy]
  )

  const handleChangeSortingDirection = useCallback(() => {
    setActiveSortDirection(activeSortDirection === 'asc' ? 'desc' : 'asc')
  }, [activeSortDirection, setActiveSortDirection])

  const handleProposalClick = useCallback(
    (rProposalId: string) => {
      navigate(`/ethereum/proposals/${rProposalId}`)
    },
    [navigate]
  )

  useEffect(() => {
    if (!isLoadingCurve && !proposalsLoading) {
      setProposals(activeFilter, searchValue)
    }
  }, [activeFilter, activeSortBy, activeSortDirection, searchValue, setProposals, isLoadingCurve, proposalsLoading])

  return (
    <Wrapper>
      <PageTitle>Proposals</PageTitle>
      <ProposalsContainer variant="secondary">
        <ToolBar>
          <StyledSearchInput
            id="inpSearchProposals"
            placeholder={t`Search`}
            variant="small"
            handleInputChange={(val) => setSearchValue(val)}
            handleSearchClose={() => setSearchValue('')}
            value={searchValue}
          />
          <ListManagerContainer>
            <ProposalsFilters
              filters={PROPOSAL_FILTERS}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              listLength={proposals.length}
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
        <Box flex flexColumn padding={'var(--spacing-3) var(--spacing-3) var(--spacing-7)'}>
          {searchValue !== '' && (
            <SearchMessage>
              Showing results ({proposals.length}) for &quot;<strong>{searchValue}</strong>&quot;:
            </SearchMessage>
          )}
          <ProposalsWrapper>
            {proposalsLoading || isLoadingCurve || filteringProposalsLoading ? (
              <StyledSpinnerWrapper>
                <Spinner />
              </StyledSpinnerWrapper>
            ) : (
              proposals.map((proposal, index) => (
                <Proposal
                  proposalData={proposal}
                  handleClick={handleProposalClick}
                  key={`${proposal.voteId}-${index}`}
                />
              ))
            )}
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
  width: 60rem;
  flex-grow: 1;
  min-height: 100%;
`

const ProposalsContainer = styled(Box)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-width: 100%;
  width: 100%;
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
  margin: auto var(--spacing-2);
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
  padding: var(--spacing-3);
  background-color: var(--gray-500a20);
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
  width: 15rem;
  margin: var(--spacing-2) var(--spacing-2) var(--spacing-1) var(--spacing-2);
`

const SearchMessage = styled.p`
  font-size: var(--font-size-2);
  margin-left: var(--spacing-2);
  margin-bottom: var(--spacing-2);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  width: 100%;
`

export default Proposals
