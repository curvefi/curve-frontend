import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { TooltipProps } from 'recharts'
import { t } from '@lingui/macro'
import { Paper, Stack, Typography } from '@mui/material'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui/utils/utilsFormat'
import { toUTC } from '@curvefi/prices-api/timestamp'

const { Spacing } = SizesAndSpaces

const DataSet = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="bodySRegular">{label}</Typography>
    <Typography variant="bodySBold">{value}</Typography>
  </Stack>
)

const DistributionsChartTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const { endDate, weeklyRevenue } = payload[0].payload

    const unixTimestamp = toUTC(endDate)
    const formattedDate = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(unixTimestamp)

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
        <Typography variant="bodyMBold">{formattedDate}</Typography>
        <Stack
          direction="column"
          sx={{
            marginTop: Spacing.sm,
            padding: Spacing.sm,
            gap: 1,
            backgroundColor: (theme) => theme.design.Layer[2].Fill,
          }}
        >
          <DataSet label={t`Weekly Revenue`} value={`$${formatNumber(weeklyRevenue, { notation: 'compact' })}`} />
        </Stack>
      </Paper>
    )
  }

  return null
}

export default DistributionsChartTooltip
