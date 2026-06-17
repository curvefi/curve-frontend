import { useCallback, useMemo, useState } from 'react'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsChartPalette } from '@/llamalend/features/bands-chart/hooks/useBandsChartPalette'
import type { ChartDataPoint, FetchedBandsBalances } from '@/llamalend/features/bands-chart/types'
import {
  LlammaActivityEvents,
  type LlammaActivityProps,
  LlammaActivityTrades,
} from '@/llamalend/features/llamma-activity'
import type { MarketTokens } from '@/llamalend/llama.utils'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { notFalsy } from '@primitives/objects.utils'
import { ChartWrapper, type OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import { SOFT_LIQUIDATION_DESCRIPTION, TIME_OPTIONS } from '@ui-kit/features/candle-chart/constants'
import type { TimeOption } from '@ui-kit/features/candle-chart/types'
import { useBandsChartVisible } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { ChartFooter } from '@ui-kit/shared/ui/Chart/ChartFooter'
import { ChartHeader, type ChartSelections } from '@ui-kit/shared/ui/Chart/ChartHeader'
import { type LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { ToggleBandsChartButton } from '@ui-kit/shared/ui/Chart/ToggleBandsChartButton'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp } from '@ui-kit/types/util'

const { Spacing } = SizesAndSpaces

type Tab = 'chart' | 'trades' | 'events'
const DEFAULT_TAB: Tab = 'chart'

const TABS: TabOption<Tab>[] = [
  { value: 'chart', label: t`Chart` },
  { value: 'trades', label: t`Swaps` },
  { value: 'events', label: t`Activity` },
]

const EMPTY_ARRAY: never[] = []
// Ignore tiny floating-point jitter from chart autoscale updates.
// This keeps the layout from re-rendering when the visible range is effectively unchanged.
const VISIBLE_PRICE_RANGE_CHANGE_TOLERANCE = 1e-8
const hasVisiblePriceRangeChanged = (previous: { min: number; max: number }, next: { min: number; max: number }) =>
  Math.max(Math.abs(previous.min - next.min), Math.abs(previous.max - next.max)) >= VISIBLE_PRICE_RANGE_CHANGE_TOLERANCE

type ChartAndActivityLayoutProps = {
  chart: {
    isLoading: boolean
    selectedChartKey: string | undefined
    setTimeOption: (option: TimeOption) => void
    legendSets: LegendItem[]
    ohlcChartProps: OhlcChartProps & { selectChartList: ChartSelections[] }
  }
  bands: QueryProp<{
    chartData: ChartDataPoint[]
    userBandsBalances: FetchedBandsBalances[]
    oraclePrice: string | undefined
  }>
  tokens: QueryProp<MarketTokens>
  activity: LlammaActivityProps
}

export const ChartAndActivityLayout = ({ chart, bands, activity, tokens }: ChartAndActivityLayoutProps) => {
  const theme = useTheme()
  const [isBandsVisible, setIsBandsVisible] = useBandsChartVisible()
  const toggleBandsVisible = useCallback(() => setIsBandsVisible(prev => !prev), [setIsBandsVisible])
  const bandsPalette = useBandsChartPalette()
  const [tab, setTab] = useState<Tab>(DEFAULT_TAB)
  const [candlePriceRange, setCandlePriceRange] = useState<{ min: number; max: number } | undefined>()

  const handleVisiblePriceRangeChange = useCallback((min: number, max: number) => {
    setCandlePriceRange(previous =>
      previous && !hasVisiblePriceRangeChanged(previous, { min, max }) ? previous : { min, max },
    )
  }, [])

  const hasUserBands = !!bands.data?.userBandsBalances?.length
  const collateralSymbol = tokens.data?.collateralToken?.symbol
  const borrowSymbol = tokens.data?.borrowToken?.symbol
  const chartFooterLegendSets = useMemo(
    () =>
      isBandsVisible && hasUserBands
        ? notFalsy<LegendItem>(
            ...chart.legendSets,
            collateralSymbol && { label: collateralSymbol, box: { fill: bandsPalette.userCollateralShareColor } },
            borrowSymbol && { label: borrowSymbol, box: { fill: bandsPalette.userBorrowedShareColor } },
          )
        : chart.legendSets,
    [
      isBandsVisible,
      hasUserBands,
      chart.legendSets,
      collateralSymbol,
      borrowSymbol,
      bandsPalette.userCollateralShareColor,
      bandsPalette.userBorrowedShareColor,
    ],
  )

  return (
    <Stack>
      <TabsSwitcher variant="contained" value={tab} onChange={setTab} options={TABS} />
      <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
        {tab === 'events' && <LlammaActivityEvents {...activity} />}
        {tab === 'trades' && <LlammaActivityTrades {...activity} />}
        {tab === 'chart' && (
          <Stack sx={{ gap: Spacing.sm, padding: Spacing.sm }}>
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
                bands && <ToggleBandsChartButton label="Bands" isVisible={isBandsVisible} toggle={toggleBandsVisible} />
              }
            />
            <Stack
              sx={{
                display: isBandsVisible ? 'grid' : undefined,
                gridTemplateColumns: isBandsVisible ? { mobile: '5fr 1fr', tablet: '7fr 1fr' } : undefined,
              }}
            >
              <ChartWrapper
                {...chart.ohlcChartProps}
                betaBackgroundColor={theme.design.Layer[1].Fill}
                onVisiblePriceRangeChange={isBandsVisible ? handleVisiblePriceRangeChange : undefined}
              />
              {isBandsVisible && (
                <BandsChart
                  isLoading={bands.isLoading}
                  error={bands.error}
                  collateralToken={tokens.data?.collateralToken}
                  borrowToken={tokens.data?.borrowToken}
                  chartData={bands.data?.chartData}
                  userBandsBalances={bands.data?.userBandsBalances ?? EMPTY_ARRAY}
                  newLiquidationRange={chart.ohlcChartProps.liquidationRange?.new}
                  liqRangeCurrentVisible={chart.ohlcChartProps.liqRangeCurrentVisible}
                  liqRangeNewVisible={chart.ohlcChartProps.liqRangeNewVisible}
                  oraclePrice={bands.data?.oraclePrice}
                  priceRange={candlePriceRange}
                />
              )}
            </Stack>
            <ChartFooter legendSets={chartFooterLegendSets} description={SOFT_LIQUIDATION_DESCRIPTION} />
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
