import { useCallback, useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import { useBandsChartPalette } from '@/llamalend/features/bands-chart/hooks/useBandsChartPalette'
import type { ChartDataPoint, FetchedBandsBalances } from '@/llamalend/features/bands-chart/types'
import {
  LlammaActivityEvents,
  type LlammaActivityProps,
  LlammaActivityTrades,
} from '@/llamalend/features/llamma-activity'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { type Token } from '@primitives/address.utils'
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

const { Spacing } = SizesAndSpaces

export type ChartAndActivityTab = 'chart' | 'trades' | 'events'
const DEFAULT_TAB: ChartAndActivityTab = 'chart'

const TABS: TabOption<ChartAndActivityTab>[] = [
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
  tab?: ChartAndActivityTab
  onTabChange?: (tab: ChartAndActivityTab) => void
}

export const ChartAndActivityLayout = ({ chart, bands, activity, tab, onTabChange }: ChartAndActivityLayoutProps) => {
  const { isConnected } = useConnection()
  const theme = useTheme()
  const [isBandsVisible, setIsBandsVisible] = useBandsChartVisible()
  const toggleBandsVisible = useCallback(() => setIsBandsVisible(prev => !prev), [setIsBandsVisible])
  const bandsPalette = useBandsChartPalette()
  const [internalTab, setInternalTab] = useState<ChartAndActivityTab>(DEFAULT_TAB)
  const [candlePriceRange, setCandlePriceRange] = useState<{ min: number; max: number } | undefined>()
  const activeTab = tab ?? internalTab
  const setActiveTab = onTabChange ?? setInternalTab

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
    <Stack data-testid="market-chart-and-activity">
      <TabsSwitcher variant="contained" value={activeTab} onChange={setActiveTab} options={TABS} />
      <Stack sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
        {activeTab === 'events' && <LlammaActivityEvents {...activity} />}
        {activeTab === 'trades' && <LlammaActivityTrades {...activity} />}
        {activeTab === 'chart' && (
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
                betaBackgroundColor={theme.design.Layer[1].Fill}
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
        )}
      </Stack>
    </Stack>
  )
}
