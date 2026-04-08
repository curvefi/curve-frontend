import { useState, useCallback } from 'react'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import type { ChartDataPoint, FetchedBandsBalances } from '@/llamalend/features/bands-chart/types'
import {
  LlammaActivityEvents,
  type LlammaActivityProps,
  LlammaActivityTrades,
} from '@/llamalend/features/llamma-activity'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { type Token } from '@primitives/address.utils'
import { ChartWrapper, type OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import { SOFT_LIQUIDATION_DESCRIPTION, TIME_OPTIONS } from '@ui-kit/features/candle-chart/constants'
import type { TimeOption } from '@ui-kit/features/candle-chart/types'
import { useNewBandsChart } from '@ui-kit/hooks/useFeatureFlags'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ChartFooter } from '@ui-kit/shared/ui/Chart/ChartFooter'
import { ChartHeader, type ChartSelections } from '@ui-kit/shared/ui/Chart/ChartHeader'
import { type LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { ToggleBandsChartButton } from '@ui-kit/shared/ui/Chart/ToggleBandsChartButton'
import { ErrorMessage } from '@ui-kit/shared/ui/ErrorMessage'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

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

export type ChartAndActivityLayoutProps = {
  chart: {
    ohlcDataUnavailable: boolean
    isLoading: boolean
    selectedChartKey: string | undefined
    setTimeOption: (option: TimeOption) => void
    legendSets: LegendItem[]
    ohlcChartProps: OhlcChartProps & { selectChartList: ChartSelections[] }
  }
  bands?: {
    chartData: ChartDataPoint[]
    userBandsBalances: FetchedBandsBalances[]
    oraclePrice: string | undefined
    isLoading: boolean
    error: Error | null
    collateralToken: Token | undefined
    borrowToken: Token | undefined
  }
  activity: LlammaActivityProps
}

export const ChartAndActivityLayout = ({ chart, bands, activity }: ChartAndActivityLayoutProps) => {
  const theme = useTheme()
  const [isBandsVisible, , , toggleBandsVisible] = useSwitch(true)
  const newBandsChartEnabled = useNewBandsChart()
  const [tab, setTab] = useState<Tab>(DEFAULT_TAB)
  const [candlePriceRange, setCandlePriceRange] = useState<{ min: number; max: number } | undefined>()

  const handleVisiblePriceRangeChange = useCallback((min: number, max: number) => {
    setCandlePriceRange((previous) =>
      previous &&
      Math.abs(previous.min - min) < VISIBLE_PRICE_RANGE_CHANGE_TOLERANCE &&
      Math.abs(previous.max - max) < VISIBLE_PRICE_RANGE_CHANGE_TOLERANCE
        ? previous
        : { min, max },
    )
  }, [])

  const showBands = newBandsChartEnabled && bands && isBandsVisible

  return (
    <Stack>
      <TabsSwitcher variant="contained" value={tab} onChange={setTab} options={TABS} />
      <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, padding: Spacing.md }}>
        {tab === 'events' && <LlammaActivityEvents {...activity} />}
        {tab === 'trades' && <LlammaActivityTrades {...activity} />}
        {tab === 'chart' && (
          <Stack sx={{ gap: Spacing.sm }}>
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
                newBandsChartEnabled &&
                bands && (
                  <ToggleBandsChartButton label="Bands" isVisible={isBandsVisible} onClick={toggleBandsVisible} />
                )
              }
            />
            <Stack
              display={{ mobile: 'block', tablet: showBands ? 'grid' : undefined }}
              gridTemplateColumns={{ tablet: showBands ? '1fr 5.625rem' : undefined }}
            >
              {chart.ohlcDataUnavailable ? (
                <ErrorMessage
                  title="An error ocurred"
                  subtitle={t`Chart data is not yet available for this market.`}
                  errorMessage={t`Chart data is not yet available for this market.`}
                  sx={{ alignSelf: 'center' }}
                />
              ) : (
                <ChartWrapper
                  {...chart.ohlcChartProps}
                  betaBackgroundColor={theme.design.Layer[1].Fill}
                  onVisiblePriceRangeChange={showBands ? handleVisiblePriceRangeChange : undefined}
                />
              )}
              {showBands && (
                <BandsChart
                  isLoading={bands.isLoading}
                  error={bands.error}
                  collateralToken={bands.collateralToken}
                  borrowToken={bands.borrowToken}
                  chartData={bands.chartData}
                  userBandsBalances={bands.userBandsBalances ?? EMPTY_ARRAY}
                  oraclePrice={bands.oraclePrice}
                  priceRange={candlePriceRange}
                />
              )}
            </Stack>
            <ChartFooter legendSets={chart.legendSets} description={SOFT_LIQUIDATION_DESCRIPTION} />
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
