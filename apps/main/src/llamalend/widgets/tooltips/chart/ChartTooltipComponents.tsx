import type { ReactNode } from 'react'
import { Paper, Stack, Typography } from '@mui/material'
import { LegendLine } from '@ui-kit/shared/ui/Chart/LegendSet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, MaxWidth } = SizesAndSpaces

export const ChartTooltipShell = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
  <Paper
    sx={{
      backgroundColor: (theme) => theme.design.Layer[3].Fill,
      padding: Spacing.md,
      width: MaxWidth.chartTooltip,
    }}
    elevation={2}
  >
    <Typography variant="bodyMBold">{title}</Typography>
    {children}
  </Paper>
)

export const ChartTooltipSeriesGroup = ({ children }: { children: ReactNode }) => (
  <Stack
    direction="column"
    sx={{
      marginTop: Spacing.sm,
      padding: Spacing.sm,
      gap: 1,
      backgroundColor: (theme) => theme.design.Layer[2].Fill,
    }}
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
  dash?: string
}) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Stack direction="row" spacing={2} alignItems="center">
      <LegendLine color={lineColor} dash={dash} />
      <Typography variant="bodySRegular">{label}</Typography>
    </Stack>
    <Typography variant="bodySBold">{value}</Typography>
  </Stack>
)
