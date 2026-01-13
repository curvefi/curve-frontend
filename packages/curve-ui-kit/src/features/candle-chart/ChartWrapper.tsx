import { useMemo, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { useTheme } from '@mui/material/styles'
import { Button } from '@ui/Button/Button'
import { Checkbox } from '@ui/Checkbox'
import { Icon } from '@ui/Icon'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { CandleChart } from '@ui-kit/features/candle-chart/CandleChart'
import { DialogSelect as DialogSelectChart } from '@ui-kit/features/candle-chart/DialogSelectChart'
import { DialogSelect as DialogSelectTimeOption } from '@ui-kit/features/candle-chart/DialogSelectTimeOption'
import { useChartPalette } from '@ui-kit/features/candle-chart/hooks/useChartPalette'
import type {
  ChartType,
  FetchingStatus,
  LabelList,
  LiquidationRanges,
  LpPriceOhlcDataFormatted,
  OraclePriceData,
  TimeOptions,
} from './types'

export type ChartWrapperProps = {
  /**
   * If the chart is used on a Llamalend market page we hide the candle series label and label line.
   */
  hideCandleSeriesLabel: boolean
  chartType: ChartType
  chartHeight: number
  chartStatus: FetchingStatus
  betaBackgroundColor?: string // Used during the beta phase of the new theme migration to pass theme bg color
  themeType: string
  ohlcData: LpPriceOhlcDataFormatted[]
  oraclePriceData?: OraclePriceData[]
  liquidationRange?: LiquidationRanges
  selectedChartIndex?: number
  setChartSelectedIndex?: (index: number) => void
  timeOption: TimeOptions
  setChartTimeOption: (option: TimeOptions) => void
  flipChart?: () => void
  refetchPricesData: () => void
  fetchMoreChartData: (lastFetchEndTime: number) => void
  toggleOraclePriceVisible?: () => void
  toggleLiqRangeCurrentVisible?: () => void
  toggleLiqRangeNewVisible?: () => void
  oraclePriceVisible?: boolean
  liqRangeCurrentVisible?: boolean
  liqRangeNewVisible?: boolean
  lastFetchEndTime: number
  refetchingCapped: boolean
  selectChartList: LabelList[]
  latestOraclePrice?: string
}

export const ChartWrapper = ({
  hideCandleSeriesLabel,
  chartType,
  chartStatus,
  chartHeight,
  betaBackgroundColor,
  ohlcData,
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
  oraclePriceVisible,
  liqRangeCurrentVisible,
  liqRangeNewVisible,
  toggleOraclePriceVisible,
  toggleLiqRangeCurrentVisible,
  toggleLiqRangeNewVisible,
  latestOraclePrice,
}: ChartWrapperProps) => {
  const [magnet, setMagnet] = useState(false)
  const clonedOhlcData = useMemo(() => [...ohlcData], [ohlcData])
  const theme = useTheme()

  const wrapperRef = useRef(null)

  const colors = useChartPalette({ backgroundOverride: betaBackgroundColor })

  return (
    <Wrapper>
      <ContentWrapper>
        <SectionHeader>
          <ChartSelectGroup>
            {selectedChartIndex !== undefined && setChartSelectedIndex !== undefined ? (
              <>
                <DialogSelectChart
                  isDisabled={false}
                  selectedChartIndex={selectedChartIndex}
                  selectChartList={selectChartList ?? []}
                  setChartSelectedIndex={setChartSelectedIndex}
                />
                {selectedChartIndex > 1 && flipChart !== undefined && (
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
            <Icon name={'Renew'} size={16} aria-label={'Refresh chart'} />
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
        {chartType === 'crvusd' &&
          toggleOraclePriceVisible &&
          toggleLiqRangeNewVisible &&
          toggleLiqRangeCurrentVisible && (
            <TipWrapper>
              {oraclePriceData && oraclePriceData?.length > 0 && (
                <StyledCheckbox
                  fillColor={theme.palette.primary.main}
                  blank
                  isSelected={oraclePriceVisible}
                  onChange={() => toggleOraclePriceVisible()}
                >
                  Oracle Price
                </StyledCheckbox>
              )}
              {liquidationRange?.new && toggleLiqRangeNewVisible && (
                <StyledCheckbox
                  fillColor={theme.design.Chart.LiquidationZone.Future}
                  blank
                  isSelected={liqRangeNewVisible}
                  onChange={() => toggleLiqRangeNewVisible()}
                >
                  <TipText>Liquidation Range (New)</TipText>
                </StyledCheckbox>
              )}
              {liquidationRange?.current && (
                <StyledCheckbox
                  fillColor={theme.design.Chart.LiquidationZone.Current}
                  blank
                  isSelected={liqRangeCurrentVisible}
                  onChange={() => toggleLiqRangeCurrentVisible()}
                >
                  <TipText>Liquidation Range (Current)</TipText>
                </StyledCheckbox>
              )}
            </TipWrapper>
          )}
        {chartStatus === 'READY' && (
          <ResponsiveContainer ref={wrapperRef} chartHeight={chartHeight}>
            <CandleChart
              hideCandleSeriesLabel={hideCandleSeriesLabel}
              chartHeight={chartHeight}
              ohlcData={clonedOhlcData}
              oraclePriceData={oraclePriceData}
              liquidationRange={liquidationRange}
              timeOption={timeOption}
              wrapperRef={wrapperRef}
              magnet={magnet}
              colors={colors}
              refetchingCapped={refetchingCapped}
              fetchMoreChartData={fetchMoreChartData}
              lastFetchEndTime={lastFetchEndTime}
              liqRangeCurrentVisible={liqRangeCurrentVisible}
              liqRangeNewVisible={liqRangeNewVisible}
              oraclePriceVisible={oraclePriceVisible}
              latestOraclePrice={latestOraclePrice}
            />
          </ResponsiveContainer>
        )}
        {chartStatus === 'LOADING' && (
          <StyledSpinnerWrapper minHeight={`${chartHeight}px`}>
            <Spinner size={18} />
          </StyledSpinnerWrapper>
        )}
        {chartStatus === 'ERROR' && (
          <StyledSpinnerWrapper minHeight={`${chartHeight}px`}>
            <ErrorMessage>{`Unable to fetch ${selectChartList?.[selectedChartIndex ?? 0]?.label ?? ''} data.`}</ErrorMessage>
            <RefreshButton
              size="small"
              variant="text"
              onClick={() => {
                refetchPricesData()
              }}
            >
              <Icon name={'Renew'} size={16} aria-label={'Refresh chart'} />
            </RefreshButton>
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
  display: none;
  align-items: center;
  &.active:not(:disabled) {
    box-shadow: none;
  }
  @media (min-width: 31.25rem) {
    display: flex;
  }
`

const ResponsiveContainer = styled.div<{ chartHeight: number }>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  min-height: ${(props) => `${props.chartHeight}px`};
  padding-bottom: var(--spacing-3);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  flex-direction: column;
  gap: var(--spacing-2);
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
  flex-wrap: wrap;
  gap: var(--spacing-2);
`

const StyledCheckbox = styled(Checkbox)`
  align-items: center;
  justify-content: center;
  display: flex;
  font-size: var(--font-size-1);
  font-weight: var(--font-weight);
  margin-right: 0;
  svg {
    margin-right: 0;
  }
`

const TipText = styled.p`
  font-size: var(--font-size-1);
  font-weight: none;
`
