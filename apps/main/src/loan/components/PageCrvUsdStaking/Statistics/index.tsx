import { useState } from 'react'
import { priceLineLabels } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'
import type { StatisticsChart, YieldKeys } from '@/loan/components/PageCrvUsdStaking/types'
import { useScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue.query'
import { useScrvUsdYield } from '@/loan/entities/scrvusd-yield.query'
import { networks } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import type { ChainId } from '@/loan/types/loan.types'
import { Stack, Card, CardHeader } from '@mui/material'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import { recordEntries } from '@primitives/objects.utils'
import { useScrvUsdNewForms } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { timeOptions } from '@ui-kit/lib/model/query/time-option-validation'
import {
  ChartHeader,
  type ChartSelections,
  type LegendItem,
  ChartFooter,
  ChartStateWrapper,
} from '@ui-kit/shared/ui/Chart'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { AdvancedDetails } from './AdvancedDetails'
import { RevenueDistributionsBarChart } from './DistributionsBarChart'
import { RevenueLineChart } from './RevenueLineChart'
import { StatsStack } from './StatsStack'

const { Spacing, MaxWidth, Height } = SizesAndSpaces
const EMPTY_YIELD_DATA: never[] = []

const chartLabels: Record<StatisticsChart, string> = {
  savingsRate: t`Savings Rate`,
  distributions: t`Distributions`,
}

const chartSelections: ChartSelections<StatisticsChart>[] = [
  { activeTitle: t`Historical Rate`, label: chartLabels.savingsRate, key: 'savingsRate' },
  { activeTitle: t`Historical Distributions`, label: chartLabels.distributions, key: 'distributions' },
]

const useStatisticsChartControls = () => {
  const useNewForms = useScrvUsdNewForms()
  const [newFormsSelectedStatisticsChart, setNewFormsSelectedStatisticsChart] = useState<StatisticsChart>('savingsRate')
  const [newFormsRevenueChartTimeOption, setNewFormsRevenueChartTimeOption] =
    useState<(typeof timeOptions)[number]>('1M')
  const selectedStatisticsChart = useStore(state => state.scrvusd.selectedStatisticsChart)
  const setSelectedStatisticsChart = useStore(state => state.scrvusd.setSelectedStatisticsChart)
  const revenueChartTimeOption = useStore(state => state.scrvusd.revenueChartTimeOption)
  const setRevenueChartTimeOption = useStore(state => state.scrvusd.setRevenueChartTimeOption)

  if (useNewForms) {
    return {
      selectedStatisticsChart: newFormsSelectedStatisticsChart,
      setSelectedStatisticsChart: setNewFormsSelectedStatisticsChart,
      revenueChartTimeOption: newFormsRevenueChartTimeOption,
      setRevenueChartTimeOption: setNewFormsRevenueChartTimeOption,
    }
  }

  return { selectedStatisticsChart, setSelectedStatisticsChart, revenueChartTimeOption, setRevenueChartTimeOption }
}

type StatisticsProps = {
  chainId: ChainId | undefined
  isChartExpanded: boolean
  toggleChartExpanded: () => void
  hideExpandChart: boolean
}

export const Statistics = ({ chainId, isChartExpanded, toggleChartExpanded, hideExpandChart }: StatisticsProps) => {
  const { selectedStatisticsChart, setSelectedStatisticsChart, revenueChartTimeOption, setRevenueChartTimeOption } =
    useStatisticsChartControls()

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
    <Stack
      sx={{
        width: '100%',

        maxWidth: isChartExpanded
          ? `calc(${MaxWidth.legacyActionCard} + ${Sizing[200]} + ${MaxWidth.section})`
          : MaxWidth.section,
      }}
    >
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
            expandChart={hideExpandChart ? undefined : { isExpanded: isChartExpanded, toggleChartExpanded }}
          />

          {selectedStatisticsChart === 'savingsRate' && (
            <Stack sx={{ gap: Spacing.md }}>
              <ChartStateWrapper
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
              </ChartStateWrapper>
              <ChartFooter
                legendSets={legendSets}
                toggleOptions={timeOptions}
                activeToggleOption={revenueChartTimeOption}
                onToggleChange={(_, newOption) => setRevenueChartTimeOption(newOption)}
              />
            </Stack>
          )}

          {selectedStatisticsChart === 'distributions' && (
            <ChartStateWrapper
              height={Height.chart}
              isLoading={isRevenueLoading}
              error={revenueError}
              errorMessage={t`Unable to fetch distributions data.`}
            >
              <RevenueDistributionsBarChart height={Height.chart} data={revenueData ?? null} />
            </ChartStateWrapper>
          )}

          <AdvancedDetails network={chainId && networks[chainId]} />
        </CardContent>
      </Card>
    </Stack>
  )
}
