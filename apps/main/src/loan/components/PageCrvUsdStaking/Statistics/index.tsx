import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import type { StatisticsChart } from '@/loan/components/PageCrvUsdStaking/types'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Stack, Card, CardHeader, Box } from '@mui/material'
import { t } from '@lingui/macro'
import StatsStack from './StatsStack'
import ChartHeader, { ChartOption } from '@ui-kit/shared/ui/ChartHeader'
import { useScrvUsdYield } from '@/loan/entities/scrvusdYield'
import { useScrvUsdRevenue } from '@/loan/entities/scrvusdRevenue'
import RevenueLineChart from './RevenueLineChart'
import DistributionsBarChart from './DistributionsBarChart'
import AdvancedDetails from './AdvancedDetails'
import RevenueChartFooter from './RevenueChartFooter'
import useStore from '@/loan/store/useStore'
const { Spacing, MaxWidth } = SizesAndSpaces

const chartLabels: Record<StatisticsChart, string> = {
  savingsRate: t`Savings Rate`,
  distributions: t`Distributions`,
}

const chartOptions: ChartOption<StatisticsChart>[] = [
  { activeTitle: t`Historical Rate`, label: chartLabels.savingsRate, key: 'savingsRate' },
  { activeTitle: t`Historical Distributions`, label: chartLabels.distributions, key: 'distributions' },
]

const timeOptions: TimeOption[] = ['1m', '6m', '1y']

type StatisticsProps = {
  isChartExpanded: boolean
  toggleChartExpanded: () => void
  hideExpandChart: boolean
}

const Statistics = ({ isChartExpanded, toggleChartExpanded, hideExpandChart }: StatisticsProps) => {
  const selectedStatisticsChart = useStore((state) => state.scrvusd.selectedStatisticsChart)
  const setSelectedStatisticsChart = useStore((state) => state.scrvusd.setSelectedStatisticsChart)
  const revenueChartTimeOption = useStore((state) => state.scrvusd.revenueChartTimeOption)
  const setRevenueChartTimeOption = useStore((state) => state.scrvusd.setRevenueChartTimeOption)

  const { data: yieldData } = useScrvUsdYield({ timeOption: revenueChartTimeOption })
  const { data: revenueData } = useScrvUsdRevenue({})

  return (
    <Stack width="100%" maxWidth={isChartExpanded ? '100%' : MaxWidth.section} direction="column" spacing={0}>
      <Card
        sx={{
          backgroundColor: (t) => t.design.Layer[1].Fill,
          boxShadow: 'none',
        }}
        elevation={0}
      >
        <CardHeader title="Statistics" />
        <Box sx={{ padding: Spacing.md }}>
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
          <Stack>
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

export default Statistics
