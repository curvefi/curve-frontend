import { CardContent } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CRVUSD_UNIT } from '../constants'
import { useStatistics } from '../hooks/useStatistics'

const { Spacing } = SizesAndSpaces

const METRIC_CATEGORY = 'loan.pegKeeperOverview'

export const Statistics = () => {
  const { totalDebt, totalCeiling } = useStatistics()

  return (
    <Card size="small">
      <CardHeader title={t`Statistics`} />
      <CardContent>
        <Stack direction="row" sx={{ gap: Spacing.md }}>
          <Metric
            category={METRIC_CATEGORY}
            label={t`Peg stabilisation reserve`}
            value={totalDebt}
            valueOptions={{ unit: CRVUSD_UNIT }}
            sx={{ flex: 1 }}
            testId="pegkeeper-stats-reserve"
          />

          <Metric
            category={METRIC_CATEGORY}
            label={t`Total debt ceiling`}
            value={totalCeiling}
            valueOptions={{ unit: CRVUSD_UNIT }}
            sx={{ flex: 1 }}
            testId="pegkeeper-stats-total-ceiling"
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
