import type { StatisticsChart } from '@/loan/components/PageCrvUsdStaking/types'
import { useScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue'
import { useScrvUsdYield } from '@/loan/entities/scrvusd-yield'
import { useStore } from '@/loan/store/useStore'
import { Stack, Card, CardHeader, Box } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { t } from '@ui-kit/lib/i18n'
import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import { ChartOption, ChartHeader } from '@ui-kit/shared/ui/ChartHeader'
import { Sizing } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { AdvancedDetails } from './AdvancedDetails'
import { RevenueDistributionsBarChart as DistributionsBarChart } from './DistributionsBarChart'
import { RevenueChartFooter } from './RevenueChartFooter'
import { LineChartComponent as RevenueLineChart } from './RevenueLineChart'
import { StatsStack } from './StatsStack'
const { Spacing, MaxWidth } = SizesAndSpaces

const chartLabels: Record<StatisticsChart, string> = {
  savingsRate: t`Savings Rate`,
  distributions: t`Distributions`,
}

const chartOptions: ChartOption<StatisticsChart>[] = [
  { activeTitle: t`Historical Rate`, label: chartLabels.savingsRate, key: 'savingsRate' },
  { activeTitle: t`Historical Distributions`, label: chartLabels.distributions, key: 'distributions' },
]

const timeOptions: TimeOption[] = ['1M', '6M', '1Y']

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

  const smallBreakPoint = '35.9375rem' // 575px
  const smallView = useMediaQuery(`(max-width: ${smallBreakPoint})`)

  return (
    <Stack
      width="100%"
      sx={{
        maxWidth: isChartExpanded
          ? `calc(${MaxWidth.legacyActionCard} + ${Sizing[200]} + ${MaxWidth.section})`
          : MaxWidth.section,
      }}
    >
      <Card elevation={0}>
        <CardHeader title="Statistics" />
        <Box sx={{ padding: Spacing.md, marginBottom: smallView ? Spacing.xl : 0 }}>
          <StatsStack />
        </Box>
        <ChartHeader
          isChartExpanded={isChartExpanded}
          toggleChartExpanded={toggleChartExpanded}
          activeChartOption={selectedStatisticsChart}
          setActiveChartOption={setSelectedStatisticsChart}
          chartOptions={chartOptions}
          hideExpandChart={hideExpandChart}
        />
        {selectedStatisticsChart === 'savingsRate' && (
          <Stack sx={{ marginBottom: smallView ? Spacing.xl : 0 }}>
            <RevenueLineChart data={yieldData ?? []} />
            <RevenueChartFooter
              timeOptions={timeOptions}
              activeTimeOption={revenueChartTimeOption}
              setActiveTimeOption={(_, newValue) => newValue && setRevenueChartTimeOption(newValue)}
            />
          </Stack>
        )}
        {selectedStatisticsChart === 'distributions' && <DistributionsBarChart data={revenueData ?? null} />}
      </Card>
      <AdvancedDetails />
    </Stack>
  )
}
