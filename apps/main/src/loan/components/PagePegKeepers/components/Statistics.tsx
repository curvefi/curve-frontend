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
  const { data: pegKeepersDebt, isFetching, isError } = useStatistics()

  return (
    <Card>
      <CardHeader title={t`Statistics`} />

      <CardContent>
        {isError && (
          <Typography color="error" variant="bodyXsBold">{t`Unable to fetch required data for stats`}</Typography>
        )}

        <Stack direction="row" gap={Spacing.md}>
          <Metric
            loading={isFetching}
            size="large"
            label={t`Peg stabilisation reserve`}
            value={pegKeepersDebt != null ? Number(pegKeepersDebt) : undefined}
            valueOptions={{ decimals: 3, unit: CRVUSD_UNIT }}
            sx={{ flex: 1 }}
            testId="pegkeeper-stats-reserve"
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
