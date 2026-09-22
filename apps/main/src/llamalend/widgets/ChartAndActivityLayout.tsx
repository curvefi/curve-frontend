import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsChartPalette } from '@/llamalend/features/bands-chart/hooks/useBandsChartPalette'
import type { ChartDataPoint, FetchedBandsBalances } from '@/llamalend/features/bands-chart/types'
import {
  LlammaActivityEventsTable,
  type LlammaActivityProps,
  LlammaActivityTradesTable,
} from '@/llamalend/features/llamma-activity'
import { useMarketContext } from '@/llamalend/features/market-context'
import { VaultActivityEvents, type VaultActivityProps } from '@/llamalend/features/vault-activity/VaultActivityEvents'
import type { LlammaOhlcChartMode } from '@/llamalend/hooks/useLlammaOhlcChartStateModel'
import { useMarketOraclePrice, useMarketPrice } from '@/llamalend/queries/market'
import { ChartWrapper, type OhlcChartProps } from '@evm-ui/features/candle-chart/ChartWrapper'
import { SOFT_LIQUIDATION_DESCRIPTION, TIME_OPTIONS } from '@evm-ui/features/candle-chart/constants'
import type { TimeOption } from '@evm-ui/features/candle-chart/types'
import { ChartFooter } from '@evm-ui/shared/ui/Chart/ChartFooter'
import { ChartHeader, type ChartSelections } from '@evm-ui/shared/ui/Chart/ChartHeader'
import { type LegendItem } from '@evm-ui/shared/ui/Chart/LegendSet'
import { SelectTimeOption } from '@evm-ui/shared/ui/Chart/SelectTimeOption'
import { ToggleBandsChartButton } from '@evm-ui/shared/ui/Chart/ToggleBandsChartButton'
import { MarketRateType } from '@evm-ui/types/market'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { type Token } from '@primitives/address.utils'
import type { Amount } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { notFalsy } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { Tabs } from '@ui/components/Tabs/Tabs'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { fallbackQ, mapQuery, q } from '@ui/features/queries/util'
import { useBandsChartVisible } from '@ui/features/storage/useLocalStorage'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import type { TabItem } from '@ui/hooks/useTabs'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { getTokenPairUnit } from '@ui/lib/tokens'

const { Spacing } = SizesAndSpaces

const METRIC_CATEGORY = 'llamalend.marketCharts'
const PRICE_VALUE_OPTIONS = { abbreviate: false, formatter: (value: Amount) => formatNumber(value, 'token.precise') }

const EMPTY_ARRAY: never[] = []
// Ignore tiny floating-point jitter from chart autoscale updates.
// This keeps the layout from re-rendering when the visible range is effectively unchanged.
const VISIBLE_PRICE_RANGE_CHANGE_TOLERANCE = 1e-8
const hasVisiblePriceRangeChanged = (previous: { min: number; max: number }, next: { min: number; max: number }) =>
  Math.max(Math.abs(previous.min - next.min), Math.abs(previous.max - next.max)) >= VISIBLE_PRICE_RANGE_CHANGE_TOLERANCE

const useMarketTokenPair = () => {
  const { apiMarket, marketQuery, tokens } = useMarketContext()
  const symbols = [tokens.collateralToken?.symbol, tokens.borrowToken?.symbol] as const
  const isMarketLoading = symbols.some(symbol => !symbol) && (marketQuery.isLoading || apiMarket.isLoading)
  return { tokenPair: isMarketLoading ? undefined : getTokenPairUnit(symbols), isMarketLoading }
}

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

type MarketActivityProps = { [MarketRateType.Borrow]: LlammaActivityProps; [MarketRateType.Supply]: VaultActivityProps }
type MarketActivityTabsParams<T extends MarketRateType> = { activity: MarketActivityProps[T] }

const MarketBorrowActivityEventsTab = ({ activity }: MarketActivityTabsParams<MarketRateType.Borrow>) => (
  <LlammaActivityEventsTable {...activity} />
)
const MarketBorrowActivityTradesTab = ({ activity }: MarketActivityTabsParams<MarketRateType.Borrow>) => (
  <LlammaActivityTradesTable {...activity} />
)

const buildMarketActivityMenu = <T extends MarketRateType>(rateType: T) =>
  (
    ({
      [MarketRateType.Borrow]: [
        { value: 'trades', label: t`Swaps`, component: MarketBorrowActivityTradesTab },
        { value: 'events', label: t`Activity`, component: MarketBorrowActivityEventsTab },
      ],
      [MarketRateType.Supply]: [
        {
          value: 'events',
          label: t`Activity`,
          component: ({ activity }: MarketActivityTabsParams<MarketRateType.Supply>) => (
            <VaultActivityEvents {...activity} />
          ),
        },
      ],
    }) as { [K in MarketRateType]: readonly Omit<TabItem<string, MarketActivityTabsParams<K>>, 'subTabs'>[] }
  )[rateType]

const LEGACY_CHART_AND_ACTIVITY_MENU = [
  {
    value: 'chart',
    label: t`Chart`,
    component: ({ chart, bands }: ChartAndActivityLayoutProps) => (
      <LegacyMarketPriceChartLayout chart={chart} bands={bands} />
    ),
  },
  { value: 'trades', label: t`Swaps`, component: MarketBorrowActivityTradesTab },
  { value: 'events', label: t`Activity`, component: MarketBorrowActivityEventsTab },
]

const ActivityTabsContent = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>{children}</Stack>
)

const MarketPriceMetrics = () => {
  const { chainId, marketId, apiMarket, tokens } = useMarketContext()
  const valueOptions = {
    ...PRICE_VALUE_OPTIONS,
    unit: {
      symbol: getTokenPairUnit([tokens.collateralToken?.symbol, tokens.borrowToken?.symbol]),
      position: 'suffix' as const,
    },
  }

  return (
    <MetricsGrid variant="fill">
      <Metric
        category={METRIC_CATEGORY}
        label={t`Oracle price`}
        labelTooltip={{
          title: t`The price source that determines your collateral value, health, and when your position moves toward soft liquidation.`,
        }}
        value={fallbackQ(
          q(useMarketOraclePrice({ chainId, marketId })),
          mapQuery(apiMarket, market => decimal(market.oraclePrice)),
        )}
        valueOptions={valueOptions}
        testId="market-price-chart-oracle-metric"
      />
      <Metric
        category={METRIC_CATEGORY}
        label={t`Current price`}
        labelTooltip={{
          title: t`The current price of the collateral token in the LLAMMA, which may differ from the oracle price.`,
        }}
        value={fallbackQ(
          q(useMarketPrice({ chainId, marketId })),
          mapQuery(apiMarket, market => market.ammPrice || undefined),
        )}
        valueOptions={valueOptions}
        testId="market-price-chart-current-metric"
      />
    </MetricsGrid>
  )
}

export const MarketActivityLayout = <T extends MarketRateType>({
  rateType,
  activity,
}: {
  rateType: T
  activity: MarketActivityProps[NoInfer<T>]
}) => (
  <Stack
    data-testid={
      { [MarketRateType.Borrow]: 'market-activity', [MarketRateType.Supply]: 'market-vault-activity' }[rateType]
    }
  >
    <Tabs
      menu={buildMarketActivityMenu(rateType)}
      params={{ activity }}
      variant="contained"
      ContentWrapper={ActivityTabsContent}
    />
  </Stack>
)

export const MarketPriceChartLayout = ({ chart, bands }: Pick<ChartAndActivityLayoutProps, 'chart' | 'bands'>) => {
  const { isConnected } = useConnection()
  const { tokenPair, isMarketLoading } = useMarketTokenPair()
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
      <CardHeader
        title={
          <WithSkeleton loading={isMarketLoading} width="7rem" height="2lh">
            {tokenPair}
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
        slotProps={{ title: { style: { textTransform: 'none' } } }}
      />
      <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill, gap: Spacing.md, padding: Spacing.md }}>
        <MarketPriceMetrics />
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
              height={chart.ohlcChartProps.chartHeight}
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
      menu={LEGACY_CHART_AND_ACTIVITY_MENU}
      params={useMemo(() => ({ chart, bands, activity }), [chart, bands, activity])}
      variant="contained"
      ContentWrapper={ActivityTabsContent}
    />
  </Stack>
)

const LegacyMarketPriceChartLayout = ({ chart, bands }: Pick<ChartAndActivityLayoutProps, 'chart' | 'bands'>) => {
  const { isConnected } = useConnection()
  const { tokenPair, isMarketLoading } = useMarketTokenPair()
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
          selections: chart.ohlcChartProps.selectChartList.map(selection => ({
            ...selection,
            activeTitle: tokenPair ?? '',
          })),
          activeSelection: chart.selectedChartKey,
        }}
        timeOption={{
          options: TIME_OPTIONS,
          activeOption: chart.ohlcChartProps.timeOption,
          setActiveOption: chart.setTimeOption,
        }}
        isLoading={chart.isLoading || isMarketLoading}
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
            height={chart.ohlcChartProps.chartHeight}
          />
        )}
      </Stack>
      <ChartFooter legendSets={chartFooterLegendSets} description={SOFT_LIQUIDATION_DESCRIPTION} />
    </Stack>
  )
}
