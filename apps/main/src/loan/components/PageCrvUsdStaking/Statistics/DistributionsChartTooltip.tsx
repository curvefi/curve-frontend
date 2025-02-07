import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import type { ScrvUsdRevenue } from '@/loan/entities/scrvusdRevenue'
import { TooltipProps } from 'recharts'
import { t } from '@lingui/macro'
import { Paper, Stack, Typography } from '@mui/material'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, formatDate } from '@ui/utils/utilsFormat'
import { toDate } from '@curvefi/prices-api/timestamp'
import { TOOLTIP_MAX_WIDTH } from '@/loan/components/PageCrvUsdStaking/Statistics/constants'

const { Spacing } = SizesAndSpaces

type Epoch = ScrvUsdRevenue['epochs'][number]

const DataSet = ({ label, value }: { label: string; value: string }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="bodySRegular">{label}</Typography>
    <Typography variant="bodySBold">{value}</Typography>
  </Stack>
)

const DistributionsChartTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const { endDate, weeklyRevenue } = payload[0].payload as Epoch

    return (
      <Paper
        sx={{
          backgroundColor: (theme) => theme.design.Layer[3].Fill,
          padding: Spacing.md,
          width: TOOLTIP_MAX_WIDTH,
          maxWidth: '80%',
        }}
        elevation={2}
      >
        <Typography variant="bodyMBold">{formatDate(toDate(endDate), 'long')}</Typography>
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
