import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { TooltipProps } from 'recharts'
import { t } from '@lingui/macro'
import { Paper, Stack, Typography } from '@mui/material'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useTheme } from '@mui/material/styles'
import { toDate } from '@curvefi/prices-api/timestamp'
import { formatDate } from '@ui/utils/utilsFormat'
import LegendLine from '@/loan/components/PageCrvUsdStaking/Statistics/components/LegendLine'

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
      <LegendLine color={lineColor} dash={dash} />
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

    const date = toDate(timestamp)
    const formattedDate = formatDate(date, 'long')

    return (
      <Paper
        sx={{
          backgroundColor: (theme) => theme.design.Layer[3].Fill,
          padding: Spacing.md,
          width: '20.5rem', // fixed width to cap maximum width of tooltip
          maxWidth: '80%',
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
