import { useEffect, useCallback, Key, Fragment } from 'react'
import { styled } from 'styled-components'
import { ErrorMessage } from '@/dao/components/ErrorMessage'
import { GaugeListItem } from '@/dao/components/PageGauges/GaugeListItem'
import { SmallScreenCard } from '@/dao/components/PageGauges/GaugeListItem/SmallScreenCard'
import { PaginatedTable } from '@/dao/components/PaginatedTable'
import { useStore } from '@/dao/store/useStore'
import { GaugeFormattedData, SortByFilterGaugesKeys } from '@/dao/types/dao.types'
import { SearchInput } from '@ui/SearchInput'
import { SelectSortingMethod } from '@ui/Select/SelectSortingMethod'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { t } from '@ui-kit/lib/i18n'
import { GAUGE_VOTES_TABLE_LABELS, GAUGE_VOTES_SORTING_METHODS } from '../constants'

export const GaugesList = () => {
  const getGauges = useStore((state) => state.gauges.getGauges)
  const setGauges = useStore((state) => state.gauges.setGauges)
  const gaugesLoading = useStore((state) => state.gauges.gaugesLoading)
  const gaugeListSortBy = useStore((state) => state.gauges.gaugeListSortBy)
  const setGaugeListSortBy = useStore((state) => state.gauges.setGaugeListSortBy)
  const setSearchValue = useStore((state) => state.gauges.setSearchValue)
  const searchValue = useStore((state) => state.gauges.searchValue)
  const filteredGauges = useStore((state) => state.gauges.filteredGauges)
  const tableMinWidth = 0
  const gridTemplateColumns = '17.5rem 1fr 1fr 1fr 0.2fr'
  const smallScreenBreakpoint = 42.3125

  const isLoading = gaugesLoading === 'LOADING'
  const isSuccess = gaugesLoading === 'SUCCESS'
  const isError = gaugesLoading === 'ERROR'

  useEffect(() => {
    if (isSuccess) {
      setGauges(searchValue)
    }
  }, [isSuccess, searchValue, setGauges, gaugeListSortBy])

  const handleSortChange = useCallback(
    (key: Key | null) => {
      if (key != null) {
        setGaugeListSortBy(key as SortByFilterGaugesKeys)
        setGauges(searchValue)
      }
    },
    [setGaugeListSortBy, setGauges, searchValue],
  )

  return (
    <>
      <Header>
        <h3>{t`CURVE GAUGES`}</h3>
        <SortingWrapper>
          <StyledSearchInput
            id="inpSearchProposals"
            placeholder={t`Search`}
            variant="small"
            handleInputChange={(val) => setSearchValue(val)}
            handleSearchClose={() => setSearchValue('')}
            value={searchValue}
          />
          <StyledSelectFilter
            selectedKey={gaugeListSortBy.key}
            smallScreenBreakpoint={smallScreenBreakpoint}
            onSelectionChange={handleSortChange}
            items={GAUGE_VOTES_SORTING_METHODS}
          />
        </SortingWrapper>
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
            isLoading={isLoading}
            isError={isError}
            isSuccess={isSuccess}
            columns={GAUGE_VOTES_TABLE_LABELS}
            sortBy={gaugeListSortBy}
            errorMessage={t`An error occurred while fetching gauges.`}
            noDataMessage={t`No gauges found`}
            setSortBy={handleSortChange}
            getData={() => getGauges(true)}
            renderRow={(gauge, index) => (
              <Fragment key={index}>
                <GaugeListItemWrapper>
                  <GaugeListItem key={index} gaugeData={gauge} gridTemplateColumns={gridTemplateColumns} />
                </GaugeListItemWrapper>
                <SmallScreenCardWrapper>
                  <SmallScreenCard gaugeData={gauge} />
                </SmallScreenCardWrapper>
              </Fragment>
            )}
            gridTemplateColumns={gridTemplateColumns}
            smallScreenBreakpoint={smallScreenBreakpoint}
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
  gap: var(--spacing-2);
  h3 {
    margin-right: auto;
  }
  @media (min-width: 34.375rem) {
    flex-direction: row;
  }
`

const SortingWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-2);
  width: 100%;
  @media (min-width: 34.375rem) {
    width: auto;
  }
`

const StyledSearchInput = styled(SearchInput)`
  width: 100%;
  margin: var(--spacing-2) 0;
  @media (min-width: 34.375rem) {
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

const GaugeListItemWrapper = styled.div`
  @media (max-width: 678px) {
    display: none;
  }
`

const SmallScreenCardWrapper = styled.div`
  display: none;

  @media (max-width: 678px) {
    display: block;
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

const StyledSelectFilter = styled(SelectSortingMethod)<{ smallScreenBreakpoint: number }>`
  display: none;
  @media (max-width: ${({ smallScreenBreakpoint }) => smallScreenBreakpoint}rem) {
    display: block;
    margin: auto 0;
  }
`
