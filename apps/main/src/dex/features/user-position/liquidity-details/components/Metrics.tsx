import type { ChainId } from '@/dex/types/main.types'
import Grid from '@mui/material/Grid'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { amount, Chain, formatNumber } from '@ui-kit/utils'
import type { LiquidityDetailsData } from '../hooks/useLiquidityDetails'

const { Spacing } = SizesAndSpaces

const METRIC_GRID_SIZE = { mobile: 6, desktop: 3 } as const
const METRIC_CATEGORY = 'dex.userLiquidityDetails'

export const Metrics = ({
  chainId,
  metrics: { boost, lpTokenTotal, positionValue },
}: {
  chainId: ChainId
  metrics: LiquidityDetailsData['metrics']
}) => (
  <Grid container spacing={Spacing.md}>
    <Grid size={METRIC_GRID_SIZE}>
      <Metric
        category={METRIC_CATEGORY}
        label={t`Position value`}
        value={positionValue}
        valueOptions={{ unit: 'dollar', abbreviate: false }}
        notional={maybe(lpTokenTotal.data, value => `${formatNumber(amount(value), 'token.balance')} LP Tokens`)}
      />
    </Grid>

    <Grid size={METRIC_GRID_SIZE}>
      {/** There's a ticket to support boost values on sidechains; for now we hide it explicitly instead of showing N/A */}
      {chainId === Number(Chain.Ethereum) && (
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
