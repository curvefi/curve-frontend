import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { TooltipProps } from 'recharts'
import { t } from '@lingui/macro'
import { Paper, Stack, Typography } from '@mui/material'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useTheme } from '@mui/material/styles'
import { toUTC } from '@curvefi/prices-api/timestamp'

const { Spacing } = SizesAndSpaces

const DataSet = ({
  label,
  value,
  lineColor,
  dash,
}: {
  label: string
  value: string
  lineColor: string
  dash?: string
}) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Stack direction="row" spacing={2} alignItems="center">
      <svg width="20" height="2">
        <line x1="0" y1="1" x2="20" y2="1" stroke={lineColor} strokeWidth={2} strokeDasharray={dash} />
      </svg>
      <Typography variant="bodySRegular">{label}</Typography>
    </Stack>
    <Typography variant="bodySBold">{value}</Typography>
  </Stack>
)

const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  const {
    design: { Color },
  } = useTheme()

  if (active && payload && payload.length) {
    const { timestamp, proj_apy, proj_apy_7d_avg, proj_apy_total_avg } = payload[0].payload

    const unixTimestamp = toUTC(timestamp)
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
          <DataSet label={t`APR`} value={proj_apy.toFixed(2) + '%'} lineColor={Color.Primary[500]} />
          <DataSet
            label={t`7-day MA APR`}
            value={proj_apy_7d_avg.toFixed(2) + '%'}
            lineColor={Color.Secondary[500]}
            dash="2 2"
          />
          <DataSet
            label={t`Average APR`}
            value={proj_apy_total_avg.toFixed(2) + '%'}
            lineColor={Color.Tertiary[400]}
            dash="4 4"
          />
        </Stack>
      </Paper>
    )
  }

  return null
}

export default CustomTooltip
