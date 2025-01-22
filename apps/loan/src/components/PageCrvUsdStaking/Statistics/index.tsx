import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Card, CardHeader, Box } from '@mui/material'
import { useState } from 'react'
import StatsStack from './StatsStack'
import ChartHeader, { ChartOption } from '@ui-kit/shared/ui/ChartHeader'
import { useScrvUsdYield } from '@loan/entities/scrvusdYield'
import { useScrvUsdRevenue } from '@loan/entities/scrvusdRevenue'
import LineChart from './LineChart'
import BarChart from './BarChart'

const { Spacing, MaxWidth } = SizesAndSpaces

const chartOptions: ChartOption[] = [
  { activeTitle: 'Historical Rate', label: 'Savings Rate' },
  { activeTitle: 'Historical Distributions', label: 'Distributions' },
]

const timeOptions: TimeOption[] = ['1d', '1w', '1m']

const Statistics = () => {
  const [activeChartOption, setActiveChartOption] = useState(chartOptions[0])
  const [activeTimeOption, setActiveTimeOption] = useState(timeOptions[0])
  const { data: yieldData } = useScrvUsdYield({ timeOption: activeTimeOption })
  const { data: revenueData } = useScrvUsdRevenue({})

  return (
    <Card
      sx={{
        backgroundColor: (t) => t.design.Layer[1].Fill,
        width: '100%',
        maxWidth: MaxWidth.statistics,
      }}
    >
      <CardHeader
        title="Statistics"
        sx={{ padding: `0 ${Spacing.md.desktop} ${Spacing.sm.desktop}`, alignItems: 'end' }}
      />
      <Box sx={{ padding: Spacing.md }}>
        <StatsStack />
      </Box>
      <ChartHeader
        activeChartOption={activeChartOption}
        setActiveChartOption={setActiveChartOption}
        activeTimeOption={activeTimeOption}
        setActiveTimeOption={setActiveTimeOption}
        chartOptions={chartOptions}
        timeOptions={timeOptions}
      />
      {activeChartOption.label === 'Savings Rate' && <LineChart data={yieldData ?? []} />}
      {activeChartOption.label === 'Distributions' && <BarChart data={revenueData ?? null} />}
    </Card>
  )
}

export default Statistics
