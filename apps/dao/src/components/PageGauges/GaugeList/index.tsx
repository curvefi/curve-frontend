import styled from 'styled-components'
import { useEffect, useCallback } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { GAUGE_VOTES_TABLE_LABELS } from '../constants'

import Box from '@/ui/Box'
import GaugeListItem from './GaugeListItem'
import LazyItem from '@/ui/LazyItem'
import SearchInput from '@/ui/SearchInput'
import SelectSortingMethod from '@/ui/Select/SelectSortingMethod'
import Icon from '@/ui/Icon'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import PaginatedTable from '@/components/PaginatedTable'

const GaugesList = () => {
  const {
    getGauges,
    setGauges,
    gaugesLoading,
    gaugeListSortBy,
    setGaugeListSortBy,
    setSearchValue,
    searchValue,
    filteredGauges,
  } = useStore((state) => state.gauges)
  const curve = useStore((state) => state.curve)
  const isLoadingCurve = useStore((state) => state.isLoadingCurve)
  const tableMinWidth = 41.875

  const loading = gaugesLoading === 'LOADING'
  const error = gaugesLoading === 'ERROR'
  const success = gaugesLoading === 'SUCCESS'

  useEffect(() => {
    if (gaugesLoading === 'SUCCESS' && !isLoadingCurve) {
      setGauges(searchValue)
    }
  }, [curve, gaugesLoading, isLoadingCurve, searchValue, setGauges, gaugeListSortBy])

  const handleSortChange = useCallback(
    (key: keyof GaugeFormattedData) => {
      setGaugeListSortBy(key as SortByFilterGaugesKeys)
      setGauges(searchValue)
    },
    [setGaugeListSortBy, setGauges, searchValue]
  )

  return (
    <>
      <Header>
        <h3>CURVE GAUGES</h3>
        <StyledSearchInput
          id="inpSearchProposals"
          placeholder={t`Search`}
          variant="small"
          handleInputChange={(val) => setSearchValue(val)}
          handleSearchClose={() => setSearchValue('')}
          value={searchValue}
        />
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
          <PaginatedTable<GaugeFormattedData>
            data={filteredGauges}
            minWidth={tableMinWidth}
            fetchingState={gaugesLoading ?? 'LOADING'}
            columns={GAUGE_VOTES_TABLE_LABELS}
            sortBy={gaugeListSortBy}
            errorMessage={t`An error occurred while fetching gauges.`}
            setSortBy={handleSortChange}
            getData={() => getGauges(true)}
            renderRow={(gauge, index) => <GaugeListItem key={index} gaugeData={gauge} />}
            gridTemplateColumns="2fr 1fr 1fr 1fr 0.2fr"
          />
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
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
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

const GaugeListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 0 var(--spacing-5);
  @media (min-width: 29.0625rem) {
    padding: 0 0 var(--spacing-5);
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
