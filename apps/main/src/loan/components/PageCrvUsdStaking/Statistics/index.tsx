import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Stack, Card, CardHeader, Box } from '@mui/material'
import { useState } from 'react'
import StatsStack from './StatsStack'
import ChartHeader, { ChartOption } from '@ui-kit/shared/ui/ChartHeader'
import { useScrvUsdYield } from '@/loan/entities/scrvusdYield'
import { useScrvUsdRevenue } from '@/loan/entities/scrvusdRevenue'
import RevenueLineChart from './RevenueLineChart'
import DistributionsBarChart from './DistributionsBarChart'
import AdvancedDetails from './AdvancedDetails'
import RevenueChartFooter from './RevenueChartFooter'

const { Spacing, MaxWidth } = SizesAndSpaces

const chartOptions: ChartOption[] = [
  { activeTitle: 'Historical Rate', label: 'Savings Rate' },
  { activeTitle: 'Historical Distributions', label: 'Distributions' },
]

const timeOptions: TimeOption[] = ['1m', '6m', '1y']

type StatisticsProps = {
  isChartExpanded: boolean
  toggleChartExpanded: () => void
  hideExpandChart: boolean
}

const Statistics = ({ isChartExpanded, toggleChartExpanded, hideExpandChart }: StatisticsProps) => {
  const [activeChartOption, setActiveChartOption] = useState(chartOptions[0])
  const [activeTimeOption, setActiveTimeOption] = useState(timeOptions[0])
  const { data: yieldData } = useScrvUsdYield({ timeOption: activeTimeOption })
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
          activeChartOption={activeChartOption}
          setActiveChartOption={setActiveChartOption}
          activeTimeOption={activeTimeOption}
          setActiveTimeOption={setActiveTimeOption}
          chartOptions={chartOptions}
          hideExpandChart={hideExpandChart}
        />
        {activeChartOption.label === 'Savings Rate' && (
          <Stack>
            <RevenueLineChart data={yieldData ?? []} />
            <RevenueChartFooter
              timeOptions={timeOptions}
              activeTimeOption={activeTimeOption}
              setActiveTimeOption={(_, newValue) => newValue && setActiveTimeOption(newValue)}
            />
          </Stack>
        )}
        {activeChartOption.label === 'Distributions' && <DistributionsBarChart data={revenueData ?? null} />}
      </Card>
      <AdvancedDetails />
    </Stack>
  )
}

export default Statistics
