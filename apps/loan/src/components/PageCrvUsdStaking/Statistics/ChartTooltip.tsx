import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { TooltipProps } from 'recharts'
import { t } from '@lingui/macro'
import { Paper, Stack, Typography } from '@mui/material'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatDateFromTimestamp, formatNumber } from '@/ui/utils/utilsFormat'

const { Spacing } = SizesAndSpaces

const DataSet = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="bodySRegular">{label}</Typography>
    <Typography variant="bodySBold">{value}</Typography>
  </Stack>
)

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const { timestamp, proj_apy, proj_apy_7d_avg, proj_apy_total_avg } = payload[0].payload

    return (
      <Paper
        sx={{
          backgroundColor: (theme) => theme.design.Layer[3].Fill,
          padding: Spacing.md,
          width: '20.5rem',
          maxWidth: '100vw',
        }}
        elevation={2}
      >
        <Typography variant="bodyMBold">{formatDateFromTimestamp(timestamp)}</Typography>
        <Stack
          direction="column"
          sx={{
            marginTop: Spacing.sm,
            padding: Spacing.sm,
            gap: 0,
            backgroundColor: (theme) => theme.design.Layer[2].Fill,
          }}
        >
          <DataSet label={t`Historical APR`} value={proj_apy.toFixed(2) + '%'} />
          <DataSet label={t`7-day Average APR`} value={proj_apy_7d_avg.toFixed(2) + '%'} />
          <DataSet label={t`Average APR`} value={proj_apy_total_avg.toFixed(2) + '%'} />
        </Stack>
      </Paper>
    )
  }

  return null
}

export default CustomTooltip
