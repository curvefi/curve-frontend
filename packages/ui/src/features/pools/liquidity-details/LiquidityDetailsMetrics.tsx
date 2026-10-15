import Grid from '@mui/material/Grid'
import { Metric } from '@ui/components/Metric'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { amount } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'
import type { LiquidityDetailsData } from './types'

const { Spacing } = SizesAndSpaces

const METRIC_GRID_SIZE = { mobile: 6, desktop: 3 } as const
const METRIC_CATEGORY = 'dex.userLiquidityDetails'

export const Metrics = ({
  showBoost,
  metrics: { boost, lpTokenTotal, positionValue },
}: Pick<LiquidityDetailsData, 'showBoost' | 'metrics'>) => (
  <Grid container spacing={Spacing.md}>
    <Grid size={METRIC_GRID_SIZE}>
      <Metric
        category={METRIC_CATEGORY}
        label={t`Position value`}
        value={positionValue}
        valueOptions={{ unit: 'dollar', abbreviate: false }}
        notional={mapQuery(lpTokenTotal, value => formatToken(amount(value), 'LP Tokens', 'balance'))}
      />
    </Grid>

    <Grid size={METRIC_GRID_SIZE}>
      {showBoost && (
        <Metric
          category={METRIC_CATEGORY}
          label={t`veCRV Boost`}
          value={boost}
          valueOptions={{ unit: 'multiplier', abbreviate: false }}
        />
      )}
    </Grid>
  </Grid>
)
