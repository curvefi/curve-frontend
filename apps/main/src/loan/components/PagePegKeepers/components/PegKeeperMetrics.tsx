import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { constQ } from '@ui-kit/types/util'
import { CRVUSD_UNIT } from '../constants'
import type { PegKeeperDetails } from '../types'

const { Spacing } = SizesAndSpaces

type Props = Pick<PegKeeperDetails, 'debt' | 'debtCeiling' | 'rate'> & {
  poolName: string
  testId?: string
}

export const PegKeeperMetrics = ({ rate, debt, debtCeiling, poolName, testId = 'pegkeeper' }: Props) => (
  <Stack sx={{ gap: Spacing.sm }}>
    <Metric
      label={`${poolName} rate`}
      value={constQ(maybe(rate, Number))}
      valueOptions={{ decimals: 5, unit: 'none' }}
      testId={`${testId}-metric-rate`}
    />

    <Stack direction="row" sx={{ gap: Spacing.md }}>
      <Metric
        label={t`Debt`}
        size="small"
        value={constQ(maybe(debt, Number))}
        valueOptions={{ unit: CRVUSD_UNIT }}
        testId={`${testId}-metric-debt`}
        sx={{ flex: 1 }}
      />

      <Metric
        label={t`Debt ceiling`}
        size="small"
        value={constQ(maybe(debtCeiling, Number))}
        valueOptions={{ unit: CRVUSD_UNIT, abbreviate: true }}
        testId={`${testId}-metric-ceiling`}
        sx={{ flex: 1 }}
      />
    </Stack>
  </Stack>
)
