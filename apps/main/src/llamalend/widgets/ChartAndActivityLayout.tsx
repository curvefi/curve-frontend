import { useState } from 'react'
import { BandsChart } from '@/llamalend/features/bands-chart/BandsChart'
import type { ChartDataPoint, ParsedBandsBalances } from '@/llamalend/features/bands-chart/types'
import {
  LlammaActivityEvents,
  LlammaActivityTrades,
  type LlammaActivityProps,
} from '@/llamalend/features/llamma-activity'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { type Token } from '@ui-kit/features/activity-table'
import { ChartWrapper, type OhlcChartProps } from '@ui-kit/features/candle-chart/ChartWrapper'
import { TIME_OPTIONS, SOFT_LIQUIDATION_DESCRIPTION } from '@ui-kit/features/candle-chart/constants'
import type { TimeOption } from '@ui-kit/features/candle-chart/types'
import { useNewBandsChart } from '@ui-kit/hooks/useFeatureFlags'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ChartFooter } from '@ui-kit/shared/ui/Chart/ChartFooter'
import { type ChartSelections, ChartHeader } from '@ui-kit/shared/ui/Chart/ChartHeader'
import { type LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { ToggleBandsChartButton } from '@ui-kit/shared/ui/Chart/ToggleBandsChartButton'
import { ErrorMessage } from '@ui-kit/shared/ui/ErrorMessage'
import { SubTabsSwitcher } from '@ui-kit/shared/ui/Tabs/SubTabsSwitcher'
import { type TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
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
    userBandsBalances: ParsedBandsBalances[]
    oraclePrice: string | undefined
    isLoading: boolean
    isError: boolean
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

  const showBands = newBandsChartEnabled && bands && isBandsVisible

  return (
    <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, gap: Spacing.sm, padding: Spacing.md }}>
      <SubTabsSwitcher tabs={TABS} value={tab} onChange={setTab} />
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
              bands && <ToggleBandsChartButton label="Bands" isVisible={isBandsVisible} onClick={toggleBandsVisible} />
            }
          />
          <Stack
            display={{ mobile: 'block', tablet: showBands ? 'grid' : undefined }}
            gridTemplateColumns={{ tablet: showBands ? '1fr 14rem' : undefined }}
          >
            {chart.ohlcDataUnavailable ? (
              <ErrorMessage
                title="An error ocurred"
                subtitle={t`Chart data is not yet available for this market.`}
                errorMessage={t`Chart data is not yet available for this market.`}
                sx={{ alignSelf: 'center' }}
              />
            ) : (
              <ChartWrapper {...chart.ohlcChartProps} betaBackgroundColor={theme.design.Layer[1].Fill} />
            )}
            {showBands && (
              <BandsChart
                isLoading={bands.isLoading}
                isError={bands.isError}
                collateralToken={bands.collateralToken}
                borrowToken={bands.borrowToken}
                chartData={bands.chartData}
                userBandsBalances={bands.userBandsBalances ?? EMPTY_ARRAY}
                oraclePrice={bands.oraclePrice}
              />
            )}
          </Stack>
          <ChartFooter legendSets={chart.legendSets} description={SOFT_LIQUIDATION_DESCRIPTION} />
        </Stack>
      )}
    </Stack>
  )
}
