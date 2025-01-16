import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Card, CardHeader, Box } from '@mui/material'
import StatsStack from './StatsStack'
import ChartHeader, { ChartOption } from '@ui-kit/shared/ui/ChartHeader'
import { useScrvUsdYield } from '@/entities/scrvusdYield'
import LineChart from './LineChart'

const { Spacing, MaxWidth } = SizesAndSpaces

const chartOptions: ChartOption[] = [
  { activeTitle: 'Historical Rate', label: 'Interest Rate' },
  { activeTitle: 'Historical Rewards', label: 'Rewards' },
]

const Statistics = () => {
  const { data } = useScrvUsdYield({ timeFrame: '1d' })

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
      <ChartHeader chartOptions={chartOptions} />
      <LineChart data={data ?? []} />
    </Card>
  )
}

export default Statistics
