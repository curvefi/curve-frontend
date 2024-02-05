import type {
  TimeOptions,
  LpPriceOhlcDataFormatted,
  LabelList,
  LiqPriceRange,
  ChartType,
  FetchingStatus,
  ChartHeight,
} from './types'

import { useState, useRef } from 'react'
import styled from 'styled-components'

import DateRangePicker from 'ui/src/DateRangePicker'
import Button from 'ui/src/Button/Button'
import Icon from 'ui/src/Icon'
import Spinner, { SpinnerWrapper } from 'ui/src/Spinner'
import CandleChart from 'ui/src/Chart/CandleChart'
import DialogSelectChart from 'ui/src/Chart/DialogSelectChart'
import DialogSelectTimeOption from 'ui/src/Chart/DialogSelectTimeOption'
import Box from 'ui/src/Box'
import { cloneDeep } from 'lodash'

type Props = {
  chartType: ChartType
  chartHeight: ChartHeight
  chartStatus: FetchingStatus
  liqPriceRange?: LiqPriceRange
  chartExpanded: boolean
  themeType: string
  ohlcData: LpPriceOhlcDataFormatted[]
  selectedChartIndex: number
  setChartSelectedIndex: (index: number) => void
  timeOption: TimeOptions
  setChartTimeOption: (option: TimeOptions) => void
  flipChart: () => void
  refetchPricesData: () => void
  fetchMoreChartData: () => void
  refetchingHistory: boolean
  refetchingCapped: boolean
  lastRefetchLength: number
  selectChartList: LabelList[]
}

const ChartWrapper = ({
  chartType,
  chartStatus,
  chartHeight,
  liqPriceRange,
  chartExpanded,
  themeType,
  ohlcData,
  selectedChartIndex,
  setChartSelectedIndex,
  timeOption,
  setChartTimeOption,
  flipChart,
  refetchPricesData,
  fetchMoreChartData,
  refetchingHistory,
  refetchingCapped,
  lastRefetchLength,
  selectChartList,
}: Props) => {
  const [magnet, setMagnet] = useState(false)
  const clonedOhlcData = cloneDeep(ohlcData)

  const wrapperRef = useRef(null)

  return (
    <Wrapper>
      <ContentWrapper>
        <SectionHeader>
          <ChartSelectGroup>
            <DialogSelectChart
              isDisabled={chartStatus !== 'READY'}
              selectedChartIndex={selectedChartIndex}
              selectChartList={selectChartList}
              setChartSelectedIndex={setChartSelectedIndex}
            />
            {selectedChartIndex > 1 && (
              <StyledFlipButton onClick={() => flipChart()} variant={'icon-outlined'}>
                <StyledFLipIcon name={'ArrowsHorizontal'} size={16} aria-label={'Flip tokens'} />
              </StyledFlipButton>
            )}
          </ChartSelectGroup>
          <RefreshButton
            size="small"
            variant="select"
            onClick={() => {
              refetchPricesData()
            }}
          >
            <Icon name={'Renew'} size={16} aria-label={'Toggle magnet mode'} />
          </RefreshButton>
          <MagnetButton
            size="small"
            variant="select"
            className={magnet ? 'active' : ''}
            onClick={() => setMagnet(!magnet)}
          >
            <Icon name={'Cursor_1'} size={16} aria-label={'Toggle magnet mode'} />
          </MagnetButton>
          <DialogSelectTimeOption
            isDisabled={chartStatus !== 'READY'}
            currentTimeOption={timeOption}
            setCurrentTimeOption={setChartTimeOption}
          />
        </SectionHeader>
        {chartStatus === 'READY' && (
          <ResponsiveContainer ref={wrapperRef} chartExpanded={chartExpanded} chartHeight={chartHeight}>
            {chartType === 'crvusd' && (
              <TipContent>
                <TipIcon
                  name="StopFilledAlt"
                  size={20}
                  fill="var(--health_mode_soft_liquidation--color)"
                  stroke={'var(--health_mode_soft_liquidation--color)'}
                />{' '}
                <TipText>{'Liquidation range (${liqPriceRange?.price1} - ${liqPriceRange?.price2})'}</TipText>
              </TipContent>
            )}
            <CandleChart
              chartType={chartType}
              chartHeight={chartHeight}
              ohlcData={clonedOhlcData}
              timeOption={timeOption}
              wrapperRef={wrapperRef}
              chartExpanded={chartExpanded}
              magnet={magnet}
              themeType={themeType}
              refetchingHistory={refetchingHistory}
              refetchingCapped={refetchingCapped}
              lastRefetchLength={lastRefetchLength}
              fetchMoreChartData={fetchMoreChartData}
            />
          </ResponsiveContainer>
        )}
        {chartStatus === 'LOADING' && (
          <StyledSpinnerWrapper
            minHeight={chartExpanded ? chartHeight.expanded.toString() + 'px' : chartHeight.standard.toString() + 'px'}
          >
            <Spinner size={18} />
          </StyledSpinnerWrapper>
        )}
        {chartStatus === 'ERROR' && (
          <StyledSpinnerWrapper
            minHeight={chartExpanded ? chartHeight.expanded.toString() + 'px' : chartHeight.standard.toString() + 'px'}
          >
            <ErrorMessage>{'There was an error fetching the Chart data.'}</ErrorMessage>
          </StyledSpinnerWrapper>
        )}
      </ContentWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledFlipButton = styled(Button)`
  margin: auto var(--spacing-3) auto 0;
`

const StyledFLipIcon = styled(Icon)``

const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: var(--spacing-3);
  padding-right: var(--spacing-2);
`

const ChartSelectGroup = styled.div`
  display: flex;
  flex-direction: row;
  margin-right: auto;
`

const MagnetButton = styled(Button)`
  margin-left: var(--spacing-2);
  margin-right: var(--spacing-2);
  box-shadow: none;
  display: flex;
  display: none;
  align-items: center;
  &.active:not(:disabled) {
    box-shadow: none;
  }
  @media (min-width: 31.25rem) {
    display: flex;
  }
`

const RefreshButton = styled(Button)`
  margin-left: var(--spacing-2);
  box-shadow: none;
  display: flex;
  display: none;
  align-items: center;
  &.active:not(:disabled) {
    box-shadow: none;
  }
  @media (min-width: 31.25rem) {
    display: flex;
  }
`

const ResponsiveContainer = styled.div<{ chartExpanded: boolean; chartHeight: ChartHeight }>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-height: ${(props) =>
    props.chartExpanded ? props.chartHeight.expanded.toString() + 'px' : props.chartHeight.standard.toString() + 'px'};
  padding-bottom: var(--spacing-3);
`

const StyledDateRangePicker = styled(DateRangePicker)`
  /* margin-top: 500px; */
  margin: auto auto 0;
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  /* margin: var(--spacing-3) 0 var(--spacing-3); */
`

const ErrorMessage = styled.p`
  font-size: var(--font-size-2);
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const TipContent = styled(Box)`
  align-items: center;
  display: flex;
  justify-content: center;
`

const TipIcon = styled(Icon)`
  position: relative;
  left: -2px;
`

const TipText = styled.p`
  font-size: var(--font-size-1);
`

export default ChartWrapper
