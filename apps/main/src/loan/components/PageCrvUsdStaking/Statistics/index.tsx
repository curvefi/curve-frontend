import { priceLineLabels } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'
import type { StatisticsChart, YieldKeys } from '@/loan/components/PageCrvUsdStaking/types'
import { useScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue'
import { useScrvUsdYield } from '@/loan/entities/scrvusd-yield'
import { networks } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import { Stack, Card, CardHeader } from '@mui/material'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import { t } from '@ui-kit/lib/i18n'
import { timeOptions } from '@ui-kit/lib/model/query/time-option-validation'
import { ChartFooter } from '@ui-kit/shared/ui/Chart/ChartFooter'
import { ChartHeader, type ChartSelections } from '@ui-kit/shared/ui/Chart/ChartHeader'
import type { LegendItem } from '@ui-kit/shared/ui/Chart/LegendSet'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Chain } from '@ui-kit/utils'
import { AdvancedDetails } from './AdvancedDetails'
import { RevenueDistributionsBarChart } from './DistributionsBarChart'
import { RevenueLineChart } from './RevenueLineChart'
import { StatsStack } from './StatsStack'

const { Spacing, MaxWidth } = SizesAndSpaces

const chartLabels: Record<StatisticsChart, string> = {
  savingsRate: t`Savings Rate`,
  distributions: t`Distributions`,
}

const chartSelections: ChartSelections<StatisticsChart>[] = [
  { activeTitle: t`Historical Rate`, label: chartLabels.savingsRate, key: 'savingsRate' },
  { activeTitle: t`Historical Distributions`, label: chartLabels.distributions, key: 'distributions' },
]

type StatisticsProps = {
  isChartExpanded: boolean
  toggleChartExpanded: () => void
  hideExpandChart: boolean
}

export const Statistics = ({ isChartExpanded, toggleChartExpanded, hideExpandChart }: StatisticsProps) => {
  const selectedStatisticsChart = useStore((state) => state.scrvusd.selectedStatisticsChart)
  const setSelectedStatisticsChart = useStore((state) => state.scrvusd.setSelectedStatisticsChart)
  const revenueChartTimeOption = useStore((state) => state.scrvusd.revenueChartTimeOption)
  const setRevenueChartTimeOption = useStore((state) => state.scrvusd.setRevenueChartTimeOption)

  const { data: yieldData } = useScrvUsdYield({ timeOption: revenueChartTimeOption })
  const { data: revenueData } = useScrvUsdRevenue({})

  const {
    design: { Color },
  } = useTheme()

  const priceLineColors = {
    apyProjected: Color.Primary[500],
    proj_apy_7d_avg: Color.Secondary[500],
    proj_apy_total_avg: Color.Tertiary[400],
  } as const satisfies Record<YieldKeys, string>

  const legendSets: LegendItem[] = Object.entries(priceLineLabels).map(([key, { label, dash }]) => ({
    label,
    line: {
      lineStroke: priceLineColors[key as YieldKeys],
      dash,
    },
  }))

  return (
    <Stack
      width="100%"
      sx={{
        maxWidth: isChartExpanded
          ? `calc(${MaxWidth.legacyActionCard} + ${Sizing[200]} + ${MaxWidth.section})`
          : MaxWidth.section,
      }}
    >
      <Card>
        <CardHeader title={t`Statistics`} />
        <CardContent>
          <Stack gap={Spacing.md}>
            <StatsStack />

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
              <Stack>
                <RevenueLineChart data={yieldData ?? []} />
                <ChartFooter
                  legendSets={legendSets}
                  toggleOptions={timeOptions}
                  activeToggleOption={revenueChartTimeOption}
                  onToggleChange={(_, newOption) => setRevenueChartTimeOption(newOption)}
                />
              </Stack>
            )}

            {selectedStatisticsChart === 'distributions' && <RevenueDistributionsBarChart data={revenueData ?? null} />}

            <AdvancedDetails network={networks[Chain.Ethereum]} />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
