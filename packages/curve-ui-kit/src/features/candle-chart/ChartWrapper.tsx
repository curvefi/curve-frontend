import { useMemo, useRef } from 'react'
import { styled } from 'styled-components'
import Box from '@mui/material/Box'
import { Button } from '@ui/Button/Button'
import { Icon } from '@ui/Icon'
import { CandleChart } from '@ui-kit/features/candle-chart/CandleChart'
import { useChartPalette } from '@ui-kit/features/candle-chart/hooks/useChartPalette'
import type { ChartSelections } from '@ui-kit/shared/ui/ChartHeader'
import { Spinner } from '@ui-kit/shared/ui/Spinner'
import type { FetchingStatus, LiquidationRanges, LpPriceOhlcDataFormatted, OraclePriceData, TimeOption } from './types'

export type OhlcChartProps = {
  /**
   * If the chart is used on a Llamalend market page we hide the candle series label and label line.
   */
  hideCandleSeriesLabel: boolean
  chartHeight: number
  chartStatus: FetchingStatus
  betaBackgroundColor?: string // Used during the beta phase of the new theme migration to pass theme bg color
  ohlcData: LpPriceOhlcDataFormatted[]
  oraclePriceData?: OraclePriceData[]
  liquidationRange?: LiquidationRanges
  selectedChartKey: string
  timeOption: TimeOption
  refetchPricesData: () => void
  fetchMoreChartData: (lastFetchEndTime: number) => void
  oraclePriceVisible?: boolean
  liqRangeCurrentVisible?: boolean
  liqRangeNewVisible?: boolean
  lastFetchEndTime: number
  refetchingCapped: boolean
  selectChartList: ChartSelections[]
  latestOraclePrice?: string
}

export const ChartWrapper = ({
  hideCandleSeriesLabel,
  chartHeight,
  chartStatus,
  betaBackgroundColor,
  ohlcData,
  oraclePriceData,
  liquidationRange,
  selectedChartKey,
  timeOption,
  refetchPricesData,
  fetchMoreChartData,
  oraclePriceVisible,
  liqRangeCurrentVisible,
  liqRangeNewVisible,
  lastFetchEndTime,
  refetchingCapped,
  selectChartList,
  latestOraclePrice,
}: OhlcChartProps) => {
  const clonedOhlcData = useMemo(() => [...ohlcData], [ohlcData])

  const wrapperRef = useRef(null)

  const colors = useChartPalette({ backgroundOverride: betaBackgroundColor })

  return (
    <Wrapper>
      <ContentWrapper>
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              minHeight: chartHeight,
              gap: 'var(--spacing-2)',
            }}
          >
            <Spinner />
          </Box>
        )}
        {chartStatus === 'ERROR' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              minHeight: chartHeight,
              gap: 'var(--spacing-2)',
            }}
          >
            <ErrorMessage>{`Unable to fetch ${selectChartList?.find((c) => c.key === selectedChartKey)?.label ?? ''} data.`}</ErrorMessage>
            <RefreshButton
              size="small"
              variant="text"
              onClick={() => {
                refetchPricesData()
              }}
            >
              <Icon name={'Renew'} size={16} aria-label={'Refresh chart'} />
            </RefreshButton>
          </Box>
        )}
      </ContentWrapper>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
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

const ErrorMessage = styled.p`
  font-size: var(--font-size-2);
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
`
