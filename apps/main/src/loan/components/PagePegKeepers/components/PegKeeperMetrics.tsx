import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CRVUSD_UNIT } from '../constants'
import type { PegKeeperDetails } from '../types'

const { Spacing } = SizesAndSpaces

const DETAIL_METRIC_CATEGORY = 'loan.pegKeeperDetailAmounts'

type Props = Pick<PegKeeperDetails, 'debt' | 'debtCeiling' | 'rate'> & {
  poolName: string
  testId?: string
}

export const PegKeeperMetrics = ({ rate, debt, debtCeiling, poolName, testId = 'pegkeeper' }: Props) => (
  <Stack sx={{ gap: Spacing.sm }}>
    <Metric
      category="loan.pegKeeperOverview"
      label={`${poolName} rate`}
      value={rate}
      valueOptions={{ decimals: 5, unit: 'none' }}
      testId={`${testId}-metric-rate`}
    />

    <Stack direction="row" sx={{ gap: Spacing.md }}>
      <Metric
        category={DETAIL_METRIC_CATEGORY}
        label={t`Debt`}
        value={debt}
        valueOptions={{ unit: CRVUSD_UNIT }}
        testId={`${testId}-metric-debt`}
        sx={{ flex: 1 }}
      />

      <Metric
        category={DETAIL_METRIC_CATEGORY}
        label={t`Debt ceiling`}
        value={debtCeiling}
        valueOptions={{ unit: CRVUSD_UNIT, abbreviate: true }}
        testId={`${testId}-metric-ceiling`}
        sx={{ flex: 1 }}
      />
    </Stack>
  </Stack>
)
