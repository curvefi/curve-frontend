import styled from 'styled-components'
import { useEffect, useCallback } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { GAUGES_SORTING_METHODS } from './constants'

import Box from '@/ui/Box'
import PieChartComponent from './components/PieChartComponent'
import BarChartComponent from './components/BarChartComponent'
import GaugeListItem from './components/GaugeListItem'
import SearchInput from '@/ui/SearchInput'
import SelectSortingMethod from '@/ui/Select/SelectSortingMethod'
import Icon from '@/ui/Icon'
import UserBox from '../UserBox'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'

const Gauges = () => {
  const {
    getGauges,
    gaugeMapper,
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
    if (curve) {
      getGauges(curve)
    }
  }, [curve, getGauges])

  return (
    <Wrapper>
      <PageTitle>Curve Gauges</PageTitle>
      <Box flex flexGap={'var(--spacing-1)'} fillWidth>
        {/* <Container variant="secondary">
            <Header></Header>
            <Box flex flexColumn padding={'0 var(--spacing-3) var(--spacing-3)'}>
              {gaugesLoading ? (
                <StyledSpinnerWrapper vSpacing={5}>
                  <Spinner size={24} />
                </StyledSpinnerWrapper>
              ) : (
                <BarChartComponent data={gaugeFormattedData} />
              )}
            </Box>
          </Container> */}
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
          <Box flex flexColumn padding={'0 var(--spacing-3) var(--spacing-3)'}>
            {gaugesLoading ? (
              <StyledSpinnerWrapper vSpacing={5}>
                <Spinner size={24} />
              </StyledSpinnerWrapper>
            ) : (
              // <TableGrid>
              //   <TableTitleRow key="titles">
              //     <TableTitles>Gauge</TableTitles>
              //     <TableTitles>Weight</TableTitles>
              //     <TableTitles>7d Delta</TableTitles>
              //     <TableTitles>60d Delta</TableTitles>
              //   </TableTitleRow>
              //   {gaugeFormattedData.map((gauge, index) => (
              //     <TableRow key={`gauge-row-${index}`}>
              //       <TableCell>{gauge.title}</TableCell>
              //       <TableCell>{gauge.gauge_relative_weight}</TableCell>
              //       <TableCell>{gauge.gauge_weight_7d_delta}</TableCell>
              //       <TableCell>{gauge.gauge_weight_60d_delta}</TableCell>
              //     </TableRow>
              //   ))}
              // </TableGrid>
              //   {gaugeFormattedData.map((gauge, index) => (
              <Box flex flexColumn flexGap={'var(--spacing-2)'}>
                {gaugeFormattedData.map((gauge, index) => (
                  <GaugeListItem key={`gauge-${index}`} gaugeData={gauge} />
                ))}
              </Box>
            )}
          </Box>
        </Container>
        <StyledUserBox />
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-5) auto 0;
  width: 60rem;
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
  background-color: var(--gray-500a20);
  padding: var(--spacing-3);
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

const StyledUserBox = styled(UserBox)`
  margin-bottom: auto;
`

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto;
  gap: var(--spacing-1);
  width: 100%;
  min-width: 100%;
`

const TableRow = styled.div`
  display: contents;
`

const TableCell = styled.div`
  padding: var(--spacing-1);
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
`

const TableTitleRow = styled.div`
  display: contents;
`

const TableTitles = styled.div`
  margin: var(--spacing-1);
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.5;
`

export default Gauges
