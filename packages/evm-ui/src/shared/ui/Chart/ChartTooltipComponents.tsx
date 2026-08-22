import type { ReactNode } from 'react'
import type { ChartLineDashPattern } from '@evm-ui/shared/ui/Chart'
import { LegendLine } from '@evm-ui/shared/ui/Chart/LegendSet'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { Paper, Stack, Typography } from '@mui/material'

const { Spacing, MaxWidth } = SizesAndSpaces

export const ChartTooltipShell = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
  <Paper
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
}: {
  label: ReactNode
  value: ReactNode
  valueColor?: string
}) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="bodySRegular">{label}</Typography>
    <Typography variant="bodySBold" sx={{ color: valueColor }}>
      {value}
    </Typography>
  </Stack>
)
