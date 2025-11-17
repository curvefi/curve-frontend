import { CardContent } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CRVUSD_UNIT } from '../constants'
import { useStatistics } from '../hooks/useStatistics'

const { Spacing } = SizesAndSpaces

export const Statistics = () => {
  const { totalDebt, totalCeiling, isFetchingDebt, isFetchingCeiling, isErrorDebt, isErrorCeiling } = useStatistics()

  return (
    <Card>
      <CardHeader title={t`Statistics`} />

      <CardContent>
        {isErrorDebt && (
          <Typography color="error" variant="bodyXsBold">{t`Unable to fetch required data for total debt`}</Typography>
        )}
        {isErrorCeiling && (
          <Typography
            color="error"
            variant="bodyXsBold"
          >{t`Unable to fetch required data for total ceiling`}</Typography>
        )}

        <Stack direction="row" gap={Spacing.md}>
          <Metric
            loading={isFetchingDebt}
            size="large"
            label={t`Peg stabilisation reserve`}
            value={totalDebt && Number(totalDebt)}
            valueOptions={{ unit: CRVUSD_UNIT }}
            sx={{ flex: 1 }}
            testId="pegkeeper-stats-reserve"
          />

          <Metric
            loading={isFetchingCeiling}
            size="large"
            label={t`Total debt ceiling`}
            value={totalCeiling && Number(totalCeiling)}
            valueOptions={{ unit: CRVUSD_UNIT }}
            sx={{ flex: 1 }}
            testId="pegkeeper-stats-total-ceiling"
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
