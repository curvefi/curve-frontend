import type { ReactNode } from 'react'
import type { ChartLineDashPattern } from '@evm-ui/shared/ui/Chart/chart.utils'
import { LegendLine } from '@evm-ui/shared/ui/Chart/LegendSet'
import { Paper, Stack, Typography } from '@mui/material'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing, MaxWidth } = SizesAndSpaces

export const ChartTooltipShell = ({
  title,
  children,
  testId,
}: {
  title: ReactNode
  children: ReactNode
  testId?: string
}) => (
  <Paper
    data-testid={testId}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: Spacing.sm,
      backgroundColor: theme => theme.design.Layer[3].Fill,
      padding: Spacing.md,
      width: MaxWidth.chartTooltip,
    }}
    elevation={2}
  >
    <Typography variant="bodyMBold" sx={{ overflowWrap: 'anywhere' }}>
      {title}
    </Typography>
    {children}
  </Paper>
)

export const ChartTooltipSeriesGroup = ({ children }: { children: ReactNode }) => (
  <Stack
    direction="column"
    sx={{ padding: Spacing.sm, gap: Spacing.xs, backgroundColor: theme => theme.design.Layer[2].Fill }}
  >
    {children}
  </Stack>
)

export const ChartTooltipSeriesRow = ({
  label,
  value,
  lineColor,
  dash,
}: {
  label: ReactNode
  value: ReactNode
  lineColor: string
  dash?: ChartLineDashPattern
}) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
    <Stack direction="row" spacing={Spacing.xs} sx={{ alignItems: 'center' }}>
      <LegendLine color={lineColor} dash={dash} />
      <Typography variant="bodySRegular">{label}</Typography>
    </Stack>
    <Typography variant="bodySBold">{value}</Typography>
  </Stack>
)

export const ChartTooltipDataRow = ({
  label,
  value,
  valueColor,
  testId,
}: {
  label: ReactNode
  value: ReactNode
  valueColor?: string
  testId?: string
}) => (
  <Stack data-testid={testId} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="bodySRegular">{label}</Typography>
    <Typography variant="bodySBold" sx={{ color: valueColor }}>
      {value}
    </Typography>
  </Stack>
)
