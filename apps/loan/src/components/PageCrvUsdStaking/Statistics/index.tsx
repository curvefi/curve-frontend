import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Card, CardHeader, Box } from '@mui/material'
import StatsStack from './StatsStack'

const { Spacing, MaxWidth } = SizesAndSpaces

const Statistics = () => (
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
  </Card>
)

export default Statistics
