import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import type { MetricProps } from '@ui-kit/shared/ui/Metric'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const DashboardMetricCard = (props: MetricProps) => (
  <Card size="small" sx={{ height: '100%' }}>
    <CardContent sx={{ padding: Spacing.md }}>
      <Metric size="large" {...props} />
    </CardContent>
  </Card>
)
