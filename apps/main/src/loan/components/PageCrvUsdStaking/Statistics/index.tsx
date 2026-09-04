import { useState } from 'react'
import { priceLineLabels } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'
import type { StatisticsChart, YieldKeys } from '@/loan/components/PageCrvUsdStaking/types'
import { useScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue.query'
import { useScrvUsdYield } from '@/loan/entities/scrvusd-yield.query'
import type { ChainId } from '@/loan/types/loan.types'
import { timeOptions } from '@evm-ui/lib/model/query/time-option-validation'
import {
  ChartFooter,
  ChartHeader,
  type ChartSelections,
  EvmChartStateWrapper,
  type LegendItem,
} from '@evm-ui/shared/ui/Chart'
import { Card, CardHeader, Stack } from '@mui/material'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import { maybe, recordEntries } from '@primitives/objects.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { AdvancedDetails } from './AdvancedDetails'
import { RevenueDistributionsBarChart } from './DistributionsBarChart'
import { RevenueLineChart } from './RevenueLineChart'
import { StatsStack } from './StatsStack'

const { Spacing, Height } = SizesAndSpaces
const EMPTY_YIELD_DATA: never[] = []

const chartLabels: Record<StatisticsChart, string> = {
  savingsRate: t`Savings Rate`,
  distributions: t`Distributions`,
}

const chartSelections: ChartSelections<StatisticsChart>[] = [
  { activeTitle: t`Historical Rate`, label: chartLabels.savingsRate, key: 'savingsRate' },
  { activeTitle: t`Historical Distributions`, label: chartLabels.distributions, key: 'distributions' },
]

export const Statistics = ({ chainId }: { chainId: ChainId | undefined }) => {
  const [selectedStatisticsChart, setSelectedStatisticsChart] = useState<StatisticsChart>('savingsRate')
  const [revenueChartTimeOption, setRevenueChartTimeOption] = useState<(typeof timeOptions)[number]>('1M')

  const {
    data: yieldData,
    isLoading: isScrvUsdYieldLoading,
    error: scrvUsdYieldError,
  } = useScrvUsdYield({ timeOption: revenueChartTimeOption }, selectedStatisticsChart === 'savingsRate')
  const {
    data: revenueData,
    isLoading: isRevenueLoading,
    error: revenueError,
  } = useScrvUsdRevenue({}, selectedStatisticsChart === 'distributions')

  const {
    design: { Color },
  } = useTheme()

  const [visibleSeries, setVisibleSeries] = useState<YieldKeys[]>(Object.keys(priceLineLabels) as YieldKeys[])

  const priceLineColors = {
    apyProjected: Color.Primary[500],
    proj_apy_7d_avg: Color.Secondary[500],
    proj_apy_total_avg: Color.Tertiary[400],
  } as const satisfies Record<YieldKeys, string>

  const legendSets: LegendItem[] = recordEntries(priceLineLabels).map(([key, { label, dash }]) => ({
    label,
    line: {
      lineStroke: priceLineColors[key],
      dash,
    },
    toggled: visibleSeries.includes(key),
    onToggle: () => setVisibleSeries(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])),
  }))

  return (
    <Card size="small">
      <CardHeader title={t`Statistics`} />
      <CardContent component={Stack} sx={{ gap: Spacing.md }}>
        <StatsStack chainId={chainId} />

        <ChartHeader
          chartSelections={{
            selections: chartSelections,
            activeSelection: selectedStatisticsChart,
            setActiveSelection: setSelectedStatisticsChart,
          }}
          chartOptionVariant="buttons-group"
        />

        {selectedStatisticsChart === 'savingsRate' && (
          <Stack sx={{ gap: Spacing.md }}>
            <EvmChartStateWrapper
              height={Height.chart}
              isLoading={isScrvUsdYieldLoading}
              error={scrvUsdYieldError}
              errorMessage={t`Unable to fetch savings rate data.`}
            >
              <RevenueLineChart
                height={Height.chart}
                data={yieldData ?? EMPTY_YIELD_DATA}
                visibleSeries={visibleSeries}
              />
            </EvmChartStateWrapper>
            <ChartFooter
              legendSets={legendSets}
              toggleOptions={timeOptions}
              activeToggleOption={revenueChartTimeOption}
              onToggleChange={(_, newOption) => setRevenueChartTimeOption(newOption)}
            />
          </Stack>
        )}

        {selectedStatisticsChart === 'distributions' && (
          <EvmChartStateWrapper
            height={Height.chart}
            isLoading={isRevenueLoading}
            error={revenueError}
            errorMessage={t`Unable to fetch distributions data.`}
          >
            <RevenueDistributionsBarChart height={Height.chart} data={revenueData ?? null} />
          </EvmChartStateWrapper>
        )}

        {maybe(chainId, chainId => (
          <AdvancedDetails chainId={chainId} />
        ))}
      </CardContent>
    </Card>
  )
}
