import Grid from '@mui/material/Grid'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { amount, formatNumber } from '@ui-kit/utils'
import type { LiquidityDetailsData } from '../hooks/useLiquidityDetails'

const { Spacing } = SizesAndSpaces

const METRIC_GRID_SIZE = { mobile: 6, desktop: 3 } as const

export const Metrics = ({
  metrics: { boost, lpTokenTotal, positionValue },
}: {
  metrics: LiquidityDetailsData['metrics']
}) => (
  <Grid container spacing={Spacing.md}>
    <Grid size={METRIC_GRID_SIZE}>
      <Metric
        size="medium"
        label={t`Position value`}
        value={amount(positionValue.data)}
        loading={positionValue.isLoading}
        error={positionValue.error}
        valueOptions={{ unit: 'dollar', abbreviate: false }}
        notional={maybe(lpTokenTotal.data, value => `${formatNumber(amount(value), 'token.balance')} LP Tokens`)}
      />
    </Grid>

    <Grid size={METRIC_GRID_SIZE}>
      <Metric
        size="medium"
        label={t`veCRV Boost`}
        value={maybe(boost.data, amount)}
        loading={boost.isLoading}
        error={boost.error}
        valueOptions={{ unit: 'multiplier', abbreviate: false }}
      />
    </Grid>
  </Grid>
)
