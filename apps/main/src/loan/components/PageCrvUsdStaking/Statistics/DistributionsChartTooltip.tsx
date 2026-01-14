import { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { TOOLTIP_MAX_WIDTH, TOOLTIP_MAX_WIDTH_MOBILE } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'
import type { ScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue'
import { Paper, Stack, Typography } from '@mui/material'
import { formatDate, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type Epoch = ScrvUsdRevenue['epochs'][number]

const DataSet = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="bodySRegular">{label}</Typography>
    <Typography variant="bodySBold">{value}</Typography>
  </Stack>
)

export const DistributionsChartTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload || !payload.length) return null

  const { endDate, weeklyRevenue } = payload[0].payload as Epoch

  return (
    <Paper
      sx={{
        backgroundColor: (theme) => theme.design.Layer[3].Fill,
        padding: Spacing.md,
        width: { mobile: TOOLTIP_MAX_WIDTH_MOBILE, tablet: TOOLTIP_MAX_WIDTH },
      }}
      elevation={2}
    >
      <Typography variant="bodyMBold">{formatDate(endDate, 'long')}</Typography>
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
