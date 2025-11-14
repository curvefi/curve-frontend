import { useAppStatsTotalCrvusdSupply } from '@/loan/entities/appstats-total-crvusd-supply'
import { CardContent } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Chain } from '@ui-kit/utils'
import { CRVUSD_UNIT } from '../constants'

const { Spacing } = SizesAndSpaces

export const Statistics = () => {
  const { data: crvusdTotalSupply, isLoading, isError } = useAppStatsTotalCrvusdSupply({ chainId: Chain.Ethereum })
  const { total, minted, pegKeepersDebt } = crvusdTotalSupply ?? {}
  return (
    <Card>
      <CardHeader title={t`Statistics`} />

      <CardContent>
        {isError && <Typography color="error" variant="bodyXsBold">{t`Unable to get total supply`}</Typography>}

        <Stack direction="row" gap={Spacing.md}>
          <Metric
            loading={isLoading}
            size="large"
            label={t`Peg stabilisation reserve`}
            value={pegKeepersDebt && Number(pegKeepersDebt)}
            valueOptions={{ decimals: 3, unit: CRVUSD_UNIT }}
            sx={{ flex: 1 }}
            testId="pegkeeper-stats-reserve"
          />

          <Metric
            loading={isLoading}
            size="large"
            label={t`Reserve share of crvUSD supply`}
            value={total && minted && ((+total - +minted) / +total) * 100}
            valueOptions={{ unit: 'percentage' }}
            sx={{ flex: 1 }}
            testId="pegkeeper-stats-reserve-share"
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
