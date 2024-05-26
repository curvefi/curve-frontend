import styled from 'styled-components'
import { useEffect, useCallback } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { GAUGES_SORTING_METHODS } from './constants'

import Box from '@/ui/Box'
import BarChartComponent from './components/BarChartComponent'
import GaugeListItem from './components/GaugeListItem'
import LazyItem from '@/ui/LazyItem'
import SearchInput from '@/ui/SearchInput'
import SelectSortingMethod from '@/ui/Select/SelectSortingMethod'
import Icon from '@/ui/Icon'
import UserBox from '../UserBox'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'

const Gauges = () => {
  const {
    setGauges,
    gaugesLoading,
    gaugeFormattedData,
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
    if (!gaugesLoading && !isLoadingCurve) {
      setGauges(searchValue)
    }
  }, [curve, gaugesLoading, isLoadingCurve, searchValue, setGauges, activeSortBy, activeSortDirection])

  return (
    <Wrapper>
      <PageTitle>Curve Gauges</PageTitle>
      <Box flex fillWidth flexGap={'var(--spacing-1)'}>
        <Container variant="secondary">
          <Header>
            <StyledSearchInput
              id="inpSearchProposals"
              placeholder={t`Search`}
              variant="small"
              handleInputChange={(val) => setSearchValue(val)}
              handleSearchClose={() => setSearchValue('')}
              value={searchValue}
            />
            <Box flex margin={'0 0 0 auto'}>
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
            </Box>
          </Header>
          <Box flex flexColumn padding={'0 var(--spacing-3) var(--spacing-5)'}>
            {searchValue !== '' && (
              <SearchMessage>
                {t`Showing results (${filteredGauges.length}) for`} &quot;<strong>{searchValue}</strong>&quot;:
              </SearchMessage>
            )}
            {gaugesLoading ? (
              <StyledSpinnerWrapper vSpacing={5}>
                <Spinner size={24} />
              </StyledSpinnerWrapper>
            ) : (
              <Box flex flexColumn flexGap={'var(--spacing-2)'}>
                {filteredGauges.map((gauge, index) => (
                  <LazyItem key={`gauge-${index}`} defaultHeight={'67'}>
                    <GaugeListItem gaugeData={gauge} />
                  </LazyItem>
                ))}
              </Box>
            )}
          </Box>
        </Container>
        <Box flex flexColumn flexGap={'var(--spacing-1)'}>
          <Box variant="secondary">
            <StyledUserBox snapshotVotingPower={false} />
          </Box>
          {!gaugesLoading && (
            <Box flex flexColumn padding={'0 var(--spacing-3)'} variant="secondary">
              <Box flex flexColumn padding={'var(--spacing-3) 0 0'}>
                <ChartToolBar>
                  <ChartTitle>{t`Gauges Relative Weight Distribution`}</ChartTitle>
                  <ChartDescription>{t`Showing gauges with >0.5% relative gauge weight`}</ChartDescription>
                </ChartToolBar>
                <BarChartComponent data={gaugeFormattedData} />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto var(--spacing-7);
  width: 65rem;
  max-width: 95%;
  flex-grow: 1;
  min-height: 100%;
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

const Container = styled(Box)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  row-gap: var(--spacing-3);
`

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-3) 0;
  width: 100%;
`

const StyledSearchInput = styled(SearchInput)`
  width: 15rem;
  margin: var(--spacing-2);
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

const SearchMessage = styled.p`
  font-size: var(--font-size-2);
  margin-left: var(--spacing-2);
  margin-bottom: var(--spacing-2);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  width: 100%;
  min-width: 100%;
`

const StyledUserBox = styled(UserBox)``

const ChartToolBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  margin: 0 0 var(--spacing-2);
`

const ChartTitle = styled.h4`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
`

const ChartDescription = styled.p`
  font-size: var(--font-size-1);
`

export default Gauges
