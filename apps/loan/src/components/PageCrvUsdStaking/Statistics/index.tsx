import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Card, CardHeader } from '@mui/material'
import { useScrvUsdYield } from '@/entities/scrvusdYield'
import { useScrvUsdRevenue } from '@/entities/scrvusdRevenue'

const { ColumnWidth, Spacing, MinWidth, MaxWidth } = SizesAndSpaces

const Statistics = () => {
  const { data, error, isFetching } = useScrvUsdYield({ timeFrame: '1d' })
  const { data: revenueData, error: revenueError, isFetching: revenueIsFetching } = useScrvUsdRevenue({})

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
    </Card>
  )
}

export default Statistics
