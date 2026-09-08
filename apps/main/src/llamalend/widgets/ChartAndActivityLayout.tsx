import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsChartPalette } from '@/llamalend/features/bands-chart/hooks/useBandsChartPalette'
import type { ChartDataPoint, FetchedBandsBalances } from '@/llamalend/features/bands-chart/types'
import {
  LlammaActivityEvents,
  type LlammaActivityProps,
  LlammaActivityTrades,
} from '@/llamalend/features/llamma-activity'
import type { LlammaOhlcChartMode } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { ChartWrapper, type OhlcChartProps } from '@evm-ui/features/candle-chart/ChartWrapper'
import { SOFT_LIQUIDATION_DESCRIPTION, TIME_OPTIONS } from '@evm-ui/features/candle-chart/constants'
import type { TimeOption } from '@evm-ui/features/candle-chart/types'
import { useBandsChartVisible } from '@evm-ui/hooks/useLocalStorage'
import { ChartFooter } from '@evm-ui/shared/ui/Chart/ChartFooter'
import { ChartHeader, type ChartSelections } from '@evm-ui/shared/ui/Chart/ChartHeader'
import { type LegendItem } from '@evm-ui/shared/ui/Chart/LegendSet'
import { SelectTimeOption } from '@evm-ui/shared/ui/Chart/SelectTimeOption'
import { ToggleBandsChartButton } from '@evm-ui/shared/ui/Chart/ToggleBandsChartButton'
import { Tabs } from '@evm-ui/shared/ui/Tabs/Tabs'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import { type Token } from '@primitives/address.utils'
import { notFalsy } from '@primitives/objects.utils'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { MarketCardHeader } from './MarketCardHeader'

const { Spacing } = SizesAndSpaces

const EMPTY_ARRAY: never[] = []
// Ignore tiny floating-point jitter from chart autoscale updates.
// This keeps the layout from re-rendering when the visible range is effectively unchanged.
const VISIBLE_PRICE_RANGE_CHANGE_TOLERANCE = 1e-8
const hasVisiblePriceRangeChanged = (previous: { min: number; max: number }, next: { min: number; max: number }) =>
  Math.max(Math.abs(previous.min - next.min), Math.abs(previous.max - next.max)) >= VISIBLE_PRICE_RANGE_CHANGE_TOLERANCE

type ChartAndActivityLayoutProps = {
  chart: {
    chartMode: LlammaOhlcChartMode | undefined
    isLoading: boolean
    selectedChartKey: string | undefined
    setTimeOption: (option: TimeOption) => void
    legendSets: LegendItem[]
    ohlcChartProps: OhlcChartProps & { selectChartList: ChartSelections[] }
  }
  bands?: {
    chartData: ChartDataPoint[] | undefined
    userBandsBalances: FetchedBandsBalances[]
    oraclePrice: string | undefined
    isLoading: boolean
    error: Error | null
    collateralToken: Token | undefined
    borrowToken: Token | undefined
  }
  activity: LlammaActivityProps
}

type MarketActivityTabsParams = { activity: LlammaActivityProps }

const MarketActivityEventsTab = ({ activity }: MarketActivityTabsParams) => <LlammaActivityEvents {...activity} />
const MarketActivityTradesTab = ({ activity }: MarketActivityTabsParams) => <LlammaActivityTrades {...activity} />
const LegacyMarketPriceChartTab = ({ chart, bands }: ChartAndActivityLayoutProps) => (
  <LegacyMarketPriceChartLayout chart={chart} bands={bands} />
)

const MARKET_ACTIVITY_MENU = [
  { value: 'trades', label: t`Swaps`, component: MarketActivityTradesTab },
  { value: 'events', label: t`Activity`, component: MarketActivityEventsTab },
]

const CHART_AND_ACTIVITY_MENU = [
  { value: 'chart', label: t`Chart`, component: LegacyMarketPriceChartTab },
  { value: 'trades', label: t`Swaps`, component: MarketActivityTradesTab },
  { value: 'events', label: t`Activity`, component: MarketActivityEventsTab },
]

const ActivityTabsContent = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{children}</Stack>
)

export const MarketActivityLayout = ({ activity }: Pick<ChartAndActivityLayoutProps, 'activity'>) => (
  <Stack data-testid="market-activity">
    <Tabs
      menu={MARKET_ACTIVITY_MENU}
      params={useMemo(() => ({ activity }), [activity])}
      variant="contained"
      ContentWrapper={ActivityTabsContent}
    />
  </Stack>
)

export const MarketPriceChartLayout = ({ chart, bands }: Pick<ChartAndActivityLayoutProps, 'chart' | 'bands'>) => {
  const { isConnected } = useConnection()
  const [isBandsVisible, setIsBandsVisible] = useBandsChartVisible()
  const toggleBandsVisible = useCallback(() => setIsBandsVisible(prev => !prev), [setIsBandsVisible])
  const bandsPalette = useBandsChartPalette()
  const [candlePriceRange, setCandlePriceRange] = useState<{ min: number; max: number } | undefined>()

  const handleVisiblePriceRangeChange = useCallback((min: number, max: number) => {
    setCandlePriceRange(previous =>
      previous && !hasVisiblePriceRangeChanged(previous, { min, max }) ? previous : { min, max },
    )
  }, [])

  const showBands = bands && isBandsVisible && isConnected
  const hasUserBands = !!bands?.userBandsBalances?.length
  const collateralSymbol = bands?.collateralToken?.symbol
  const borrowSymbol = bands?.borrowToken?.symbol
  const chartFooterLegendSets = useMemo(
    () =>
      showBands && hasUserBands
        ? notFalsy<LegendItem>(
            ...chart.legendSets,
            collateralSymbol && { label: collateralSymbol, box: { fill: bandsPalette.userCollateralShareColor } },
            borrowSymbol && { label: borrowSymbol, box: { fill: bandsPalette.userBorrowedShareColor } },
          )
        : chart.legendSets,
    [
      showBands,
      hasUserBands,
      chart.legendSets,
      collateralSymbol,
      borrowSymbol,
      bandsPalette.userCollateralShareColor,
      bandsPalette.userBorrowedShareColor,
    ],
  )

  return (
    <Card size="small" data-testid="market-price-chart">
      <MarketCardHeader
        disableUpperCase={chart.chartMode === 'oracle-pool'}
        title={
          <WithSkeleton loading={chart.isLoading} width="7rem" height="2lh">
            {chart.ohlcChartProps.selectChartList.find(({ key }) => key === chart.selectedChartKey)?.activeTitle ??
              (chart.isLoading ? '' : '?')}
          </WithSkeleton>
        }
        action={
          <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
            <SelectTimeOption
              options={TIME_OPTIONS}
              activeOption={chart.ohlcChartProps.timeOption}
              setActiveOption={chart.setTimeOption}
              isLoading={chart.isLoading}
            />
            {isConnected && bands && (
              <ToggleBandsChartButton
                label={t`Bands`}
                tooltip={t`The price ranges your position can move through during soft liquidation.`}
                isVisible={isBandsVisible}
                toggle={toggleBandsVisible}
              />
            )}
          </Stack>
        }
      />
      <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill, padding: Spacing.md }}>
        <Stack
          sx={{
            display: showBands ? 'grid' : undefined,
            gridTemplateColumns: showBands ? { mobile: '5fr 1fr', tablet: '7fr 1fr' } : undefined,
          }}
        >
          <ChartWrapper
            {...chart.ohlcChartProps}
            onVisiblePriceRangeChange={showBands ? handleVisiblePriceRangeChange : undefined}
          />
          {showBands && (
            <BandsChart
              isLoading={bands.isLoading}
              error={bands.error}
              collateralToken={bands.collateralToken}
              borrowToken={bands.borrowToken}
              chartData={bands.chartData}
              userBandsBalances={bands.userBandsBalances ?? EMPTY_ARRAY}
              newLiquidationRange={chart.ohlcChartProps.liquidationRange?.new}
              liqRangeCurrentVisible={chart.ohlcChartProps.liqRangeCurrentVisible}
              liqRangeNewVisible={chart.ohlcChartProps.liqRangeNewVisible}
              oraclePrice={bands.oraclePrice}
              priceRange={candlePriceRange}
            />
          )}
        </Stack>
        <ChartFooter legendSets={chartFooterLegendSets} description={SOFT_LIQUIDATION_DESCRIPTION} />
      </Stack>
    </Card>
  )
}

export const LegacyChartAndActivityLayout = ({ chart, bands, activity }: ChartAndActivityLayoutProps) => (
  <Stack data-testid="market-chart-and-activity">
    <Tabs
      menu={CHART_AND_ACTIVITY_MENU}
      params={useMemo(() => ({ chart, bands, activity }), [chart, bands, activity])}
      variant="contained"
      ContentWrapper={ActivityTabsContent}
    />
  </Stack>
)

export const LegacyMarketPriceChartLayout = ({
  chart,
  bands,
}: Pick<ChartAndActivityLayoutProps, 'chart' | 'bands'>) => {
  const { isConnected } = useConnection()
  const [isBandsVisible, setIsBandsVisible] = useBandsChartVisible()
  const toggleBandsVisible = useCallback(() => setIsBandsVisible(prev => !prev), [setIsBandsVisible])
  const bandsPalette = useBandsChartPalette()
  const [candlePriceRange, setCandlePriceRange] = useState<{ min: number; max: number } | undefined>()

  const handleVisiblePriceRangeChange = useCallback((min: number, max: number) => {
    setCandlePriceRange(previous =>
      previous && !hasVisiblePriceRangeChanged(previous, { min, max }) ? previous : { min, max },
    )
  }, [])

  const showBands = bands && isBandsVisible && isConnected
  const hasUserBands = !!bands?.userBandsBalances?.length
  const collateralSymbol = bands?.collateralToken?.symbol
  const borrowSymbol = bands?.borrowToken?.symbol
  const chartFooterLegendSets = useMemo(
    () =>
      showBands && hasUserBands
        ? notFalsy<LegendItem>(
            ...chart.legendSets,
            collateralSymbol && { label: collateralSymbol, box: { fill: bandsPalette.userCollateralShareColor } },
            borrowSymbol && { label: borrowSymbol, box: { fill: bandsPalette.userBorrowedShareColor } },
          )
        : chart.legendSets,
    [
      showBands,
      hasUserBands,
      chart.legendSets,
      collateralSymbol,
      borrowSymbol,
      bandsPalette.userCollateralShareColor,
      bandsPalette.userBorrowedShareColor,
    ],
  )

  return (
    <Stack
      data-testid="market-price-chart"
      sx={{ gap: Spacing.sm, padding: Spacing.sm, backgroundColor: t => t.design.Layer[1].Fill }}
    >
      <ChartHeader
        chartOptionVariant="select"
        chartSelections={{
          selections: chart.ohlcChartProps.selectChartList,
          activeSelection: chart.selectedChartKey,
        }}
        timeOption={{
          options: TIME_OPTIONS,
          activeOption: chart.ohlcChartProps.timeOption,
          setActiveOption: chart.setTimeOption,
        }}
        isLoading={chart.isLoading}
        customButton={
          isConnected &&
          bands && (
            <ToggleBandsChartButton
              label={t`Bands`}
              tooltip={t`The price ranges your position can move through during soft liquidation.`}
              isVisible={isBandsVisible}
              toggle={toggleBandsVisible}
            />
          )
        }
      />
      <Stack
        sx={{
          display: showBands ? 'grid' : undefined,
          gridTemplateColumns: showBands ? { mobile: '5fr 1fr', tablet: '7fr 1fr' } : undefined,
        }}
      >
        <ChartWrapper
          {...chart.ohlcChartProps}
          onVisiblePriceRangeChange={showBands ? handleVisiblePriceRangeChange : undefined}
        />
        {showBands && (
          <BandsChart
            isLoading={bands.isLoading}
            error={bands.error}
            collateralToken={bands.collateralToken}
            borrowToken={bands.borrowToken}
            chartData={bands.chartData}
            userBandsBalances={bands.userBandsBalances ?? EMPTY_ARRAY}
            newLiquidationRange={chart.ohlcChartProps.liquidationRange?.new}
            liqRangeCurrentVisible={chart.ohlcChartProps.liqRangeCurrentVisible}
            liqRangeNewVisible={chart.ohlcChartProps.liqRangeNewVisible}
            oraclePrice={bands.oraclePrice}
            priceRange={candlePriceRange}
          />
        )}
      </Stack>
      <ChartFooter legendSets={chartFooterLegendSets} description={SOFT_LIQUIDATION_DESCRIPTION} />
    </Stack>
  )
}
