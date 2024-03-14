import type {
  TimeOptions,
  LpPriceOhlcDataFormatted,
  LabelList,
  LiquidationRanges,
  ChartType,
  FetchingStatus,
  ChartHeight,
  VolumeData,
  OraclePriceData,
  ChartColors,
} from './types'

import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { cloneDeep } from 'lodash'

import DateRangePicker from 'ui/src/DateRangePicker'
import Button from 'ui/src/Button/Button'
import Icon from 'ui/src/Icon'
import Spinner, { SpinnerWrapper } from 'ui/src/Spinner'
import CandleChart from 'ui/src/Chart/CandleChart'
import DialogSelectChart from 'ui/src/Chart/DialogSelectChart'
import DialogSelectTimeOption from 'ui/src/Chart/DialogSelectTimeOption'
import Box from 'ui/src/Box'

type Props = {
  chartType: ChartType
  chartHeight: ChartHeight
  chartStatus: FetchingStatus
  chartExpanded: boolean
  themeType: string
  ohlcData: LpPriceOhlcDataFormatted[]
  volumeData?: VolumeData[]
  oraclePriceData?: OraclePriceData[]
  liquidationRange?: LiquidationRanges
  selectedChartIndex?: number
  setChartSelectedIndex?: (index: number) => void
  timeOption: TimeOptions
  setChartTimeOption: (option: TimeOptions) => void
  flipChart?: () => void
  refetchPricesData: () => void
  fetchMoreChartData: (lastFetchEndTime: number) => void
  lastFetchEndTime: number
  refetchingCapped: boolean
  selectChartList?: LabelList[]
}

const DEFAULT_CHART_COLORS: ChartColors = {
  backgroundColor: '#fafafa',
  lineColor: '#2962FF',
  textColor: 'black',
  areaTopColor: '#2962FF',
  areaBottomColor: 'rgba(41, 98, 255, 0.28)',
  chartGreenColor: '#2962FF',
  chartRedColor: '#ef5350',
  chartLabelColor: '#9B7DFF',
  chartVolumeRed: '#ef53507e',
  chartVolumeGreen: '#26a6997e',
  chartOraclePrice: '#3360c9c0',
  rangeColor: '#dfb316',
  rangeColorA25: '#dfb4167f',
  rangeColorOld: '#ab792f',
  rangeColorA25Old: '#ab792f25',
}

const ChartWrapper = ({
  chartType,
  chartStatus,
  chartHeight,
  chartExpanded,
  themeType,
  ohlcData,
  volumeData,
  oraclePriceData,
  liquidationRange,
  selectedChartIndex,
  setChartSelectedIndex,
  timeOption,
  setChartTimeOption,
  flipChart,
  refetchPricesData,
  fetchMoreChartData,
  lastFetchEndTime,
  refetchingCapped,
  selectChartList,
}: Props) => {
  const [magnet, setMagnet] = useState(false)
  const clonedOhlcData = cloneDeep(ohlcData)

  const wrapperRef = useRef(null)

  const [lastTheme, setLastTheme] = useState(themeType)
  const [colors, setColors] = useState<ChartColors>(DEFAULT_CHART_COLORS)

  useEffect(() => {
    const style = getComputedStyle(document.body)
    const backgroundColor =
      chartType === 'crvusd' && !chartExpanded
        ? style.getPropertyValue('--tab-secondary--content--background-color')
        : style.getPropertyValue('--box--secondary--background-color')
    const lineColor = style.getPropertyValue('--line-color')
    const textColor = style.getPropertyValue('--page--text-color')
    const areaTopColor = style.getPropertyValue('--area-top-color')
    const areaBottomColor = style.getPropertyValue('--area-bottom-color')
    const chartGreenColor = style.getPropertyValue('--chart-green')
    const chartRedColor = style.getPropertyValue('--chart-red')
    const chartLabelColor = style.getPropertyValue('--chart-label')
    const chartVolumeGreen = style.getPropertyValue('--chart-volume-green')
    const chartVolumeRed = style.getPropertyValue('--chart-volume-red')
    const chartOraclePrice = style.getPropertyValue('--chart-oracle-price-line')
    const rangeColor = style.getPropertyValue('--chart-liq-range')
    const rangeColorA25 = style.getPropertyValue('--chart-liq-range-a25')
    const rangeColorOld = style.getPropertyValue('--chart-liq-range-old')
    const rangeColorA25Old = style.getPropertyValue('--chart-liq-range-a25-old')

    setColors({
      backgroundColor,
      lineColor,
      textColor,
      areaTopColor,
      areaBottomColor,
      chartGreenColor,
      chartRedColor,
      chartLabelColor,
      chartVolumeRed,
      chartVolumeGreen,
      chartOraclePrice,
      rangeColor,
      rangeColorA25,
      rangeColorOld,
      rangeColorA25Old,
    })
    setLastTheme(themeType)
  }, [chartExpanded, chartType, lastTheme, themeType])

  return (
    <Wrapper>
      <ContentWrapper>
        <SectionHeader>
          <ChartSelectGroup>
            {selectedChartIndex !== undefined && setChartSelectedIndex !== undefined && flipChart !== undefined ? (
              <>
                <DialogSelectChart
                  isDisabled={chartStatus !== 'READY'}
                  selectedChartIndex={selectedChartIndex}
                  selectChartList={selectChartList ?? []}
                  setChartSelectedIndex={setChartSelectedIndex}
                />
                {selectedChartIndex > 1 && (
                  <StyledFlipButton onClick={() => flipChart()} variant={'icon-outlined'}>
                    <StyledFLipIcon name={'ArrowsHorizontal'} size={16} aria-label={'Flip tokens'} />
                  </StyledFlipButton>
                )}
              </>
            ) : (
              <DialogSelectChart
                isDisabled={false}
                selectedChartIndex={0}
                selectChartList={selectChartList ?? []}
                setChartSelectedIndex={() => 0}
              />
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
        {chartType === 'crvusd' && (
          <TipWrapper>
            <TipContent>
              <TipIcon name="StopFilledAlt" size={20} fill="var(--chart-oracle-price-line)" />
              Oracle Price
            </TipContent>
            <TipContent>
              <TipIcon name="StopFilledAlt" size={20} fill="var(--chart-liq-range)" />
              <TipText>Liquidation Range {liquidationRange?.current && liquidationRange.new && '(New)'}</TipText>
            </TipContent>
            {liquidationRange?.current && liquidationRange.new && (
              <TipContent>
                <TipIcon name="StopFilledAlt" size={20} fill="var(--chart-liq-range-old)" />
                <TipText>Liquidation Range (Current)</TipText>
              </TipContent>
            )}
          </TipWrapper>
        )}
        {chartStatus === 'READY' && (
          <ResponsiveContainer ref={wrapperRef} chartExpanded={chartExpanded} chartHeight={chartHeight}>
            <CandleChart
              chartType={chartType}
              chartHeight={chartHeight}
              ohlcData={clonedOhlcData}
              volumeData={volumeData}
              oraclePriceData={oraclePriceData}
              liquidationRange={liquidationRange}
              timeOption={timeOption}
              wrapperRef={wrapperRef}
              chartExpanded={chartExpanded}
              magnet={magnet}
              colors={colors}
              refetchingCapped={refetchingCapped}
              fetchMoreChartData={fetchMoreChartData}
              lastFetchEndTime={lastFetchEndTime}
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

const TipWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: var(--spacing-2);
`

const TipContent = styled(Box)`
  align-items: center;
  justify-content: center;
  display: flex;
  font-size: var(--font-size-1);
  font-weight: var(--font-weight);
`

const TipIcon = styled(Icon)`
  position: relative;
  left: -2px;
`

const TipText = styled.p`
  font-size: var(--font-size-1);
`

export default ChartWrapper
