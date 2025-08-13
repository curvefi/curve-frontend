import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CRVUSD_UNIT } from '../constants'
import type { PegKeeperDetails, Pool } from '../types'

const { Spacing } = SizesAndSpaces

type Props = Pick<PegKeeperDetails, 'debt' | 'debtCeiling' | 'rate'> & {
  poolName: Pool['name']
  underlyingCoins: Pool['underlyingCoins']
  testId?: string
}

export const PegKeeperMetrics = ({
  rate,
  debt,
  debtCeiling,
  poolName,
  underlyingCoins,
  testId = 'pegkeeper',
}: Props) => (
  <CardContent>
    <Stack gap={Spacing.sm}>
      <Stack direction="row" gap={Spacing.md}>
        <Metric
          label={`${poolName} rate`}
          size="large"
          loading={rate == null}
          value={Number(rate)}
          valueOptions={{ decimals: 5, unit: 'none' }}
          testId={`${testId}-metric-rate`}
        />
      </Stack>

      <Stack direction="row" gap={Spacing.md}>
        <Metric
          label={t`Debt`}
          loading={debt == null}
          value={Number(debt)}
          valueOptions={{ unit: CRVUSD_UNIT }}
          testId={`${testId}-metric-debt`}
          sx={{ flex: 1 }}
        />

        <Metric
          label={t`Debt ceiling`}
          loading={debtCeiling == null}
          value={Number(debtCeiling)}
          valueOptions={{ unit: { symbol: underlyingCoins[0], position: 'suffix' }, abbreviate: true }}
          testId={`${testId}-metric-ceiling`}
          sx={{ flex: 1 }}
        />
      </Stack>
    </Stack>
  </CardContent>
)
