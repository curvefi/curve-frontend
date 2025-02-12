import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import type { ScrvUsdYieldWithAverages } from '@/loan/entities/scrvusdYield'
import { TOOLTIP_MAX_WIDTH, TOOLTIP_MAX_WIDTH_MOBILE } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'
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
    design: { Color, Layer },
  } = useTheme()

  if (!active || !payload || !payload.length) {
    return null
  }

  const { timestamp, proj_apy, proj_apy_7d_avg, proj_apy_total_avg } = payload[0].payload as ScrvUsdYieldWithAverages

  return (
    <Paper
      sx={{
        backgroundColor: Layer[3].Fill,
        padding: Spacing.md,
        width: { mobile: TOOLTIP_MAX_WIDTH_MOBILE, tablet: TOOLTIP_MAX_WIDTH },
      }}
      elevation={2}
    >
      <Typography variant="bodyMBold">{formatDate(toDate(timestamp), 'long')}</Typography>
      <Stack
        direction="column"
        sx={{
          marginTop: Spacing.sm,
          padding: Spacing.sm,
          gap: 1,
          backgroundColor: Layer[2].Fill,
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

export default CustomTooltip
