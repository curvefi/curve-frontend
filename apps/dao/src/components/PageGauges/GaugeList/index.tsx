import styled from 'styled-components'
import { useEffect, useCallback } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { GAUGES_SORTING_METHODS } from '../constants'

import Box from '@/ui/Box'
import GaugeListItem from './GaugeListItem'
import LazyItem from '@/ui/LazyItem'
import SearchInput from '@/ui/SearchInput'
import SelectSortingMethod from '@/ui/Select/SelectSortingMethod'
import Icon from '@/ui/Icon'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ErrorMessage from '@/components/ErrorMessage'

const GaugesList = () => {
  const {
    getGauges,
    setGauges,
    gaugesLoading,
    activeSortBy,
    activeSortDirection,
    setActiveSortBy,
    setActiveSortDirection,
    setSearchValue,
    searchValue,
    filteredGauges,
  } = useStore((state) => state.gauges)
  const curve = useStore((state) => state.curve)
  const isLoadingCurve = useStore((state) => state.isLoadingCurve)

  const handleSortingMethodChange = useCallback(
    (key: React.Key) => {
      setActiveSortBy(key as SortByFilterGauges)
    },
    [setActiveSortBy]
  )

  const handleChangeSortingDirection = useCallback(() => {
    setActiveSortDirection(activeSortDirection === 'asc' ? 'desc' : 'asc')
  }, [activeSortDirection, setActiveSortDirection])

  useEffect(() => {
    if (gaugesLoading === 'SUCCESS' && !isLoadingCurve) {
      setGauges(searchValue)
    }
  }, [curve, gaugesLoading, isLoadingCurve, searchValue, setGauges, activeSortBy, activeSortDirection])

  return (
    <>
      <Header>
        <StyledSearchInput
          id="inpSearchProposals"
          placeholder={t`Search`}
          variant="small"
          handleInputChange={(val) => setSearchValue(val)}
          handleSearchClose={() => setSearchValue('')}
          value={searchValue}
        />
        <SortingBox>
          <StyledSelectSortingMethod
            selectedKey={activeSortBy}
            minWidth="9rem"
            items={GAUGES_SORTING_METHODS}
            onSelectionChange={handleSortingMethodChange}
          />
          <ToggleDirectionIcon
            size={20}
            name={activeSortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'}
            onClick={() => handleChangeSortingDirection()}
          />
        </SortingBox>
      </Header>
      <GaugeListWrapper>
        {searchValue !== '' && (
          <SearchMessage>
            {t`Showing results (${filteredGauges.length}) for`} &quot;<strong>{searchValue}</strong>&quot;:
          </SearchMessage>
        )}
        {gaugesLoading === 'LOADING' && (
          <StyledSpinnerWrapper vSpacing={5}>
            <Spinner size={24} />
          </StyledSpinnerWrapper>
        )}
        {gaugesLoading === 'ERROR' && (
          <ErrorMessageWrapper>
            <ErrorMessage message={t`Error fetching gauges`} onClick={() => getGauges(true)} />
          </ErrorMessageWrapper>
        )}
        {gaugesLoading === 'SUCCESS' && (
          <Box flex flexColumn flexGap={'var(--spacing-2)'}>
            {filteredGauges.map((gauge, index) => (
              <LazyItem key={`gauge-${index}`} defaultHeight={'67'}>
                <GaugeListItem gaugeData={gauge} />
              </LazyItem>
            ))}
          </Box>
        )}
      </GaugeListWrapper>
    </>
  )
}

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
  width: 100%;
  @media (min-width: 29.0625rem) {
    flex-direction: row;
  }
`

const StyledSearchInput = styled(SearchInput)`
  width: 100%;
  margin: var(--spacing-2);
  @media (min-width: 29.0625rem) {
    width: 15rem;
  }
`

const SortingBox = styled.div`
  display: flex;
  flex-direction: row;
  margin-right: auto;
  @media (min-width: 29.0625rem) {
    margin: 0 0 0 auto;
  }
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

const GaugeListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0 var(--spacing-5);
  @media (min-width: 29.0625rem) {
    padding: 0 var(--spacing-3) var(--spacing-5);
  }
`

const SearchMessage = styled.p`
  font-size: var(--font-size-2);
  margin-left: var(--spacing-2);
  margin-bottom: var(--spacing-2);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  width: 100%;
  min-width: 100%;
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

export default GaugesList
