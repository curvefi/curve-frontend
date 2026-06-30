import { useScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue.query'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusd-statistics.query'
import { useScrvUsdSupplies } from '@/loan/entities/scrvusd-supplies.query'
import type { ChainId } from '@/loan/types/loan.types'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { weiToEther } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const CRVUSD_OPTION = { symbol: 'crvUSD', position: 'suffix' as const, abbreviate: true }
const METRIC_CATEGORY = 'loan.scrvusdStats'

type StatsStackProps = {
  chainId: ChainId | undefined
}

export const StatsStack = ({ chainId }: StatsStackProps) => {
  const supplies = useScrvUsdSupplies({ chainId })
  const revenue = useScrvUsdRevenue({})
  return (
    <Grid
      container
      wrap="wrap"
      sx={{
        display: 'grid',
        gridAutoRows: '1fr',
        gridTemplateColumns: { mobile: 'repeat(2, 1fr)', tablet: 'repeat(2, 1fr)', desktop: 'repeat(4, 1fr)' },
        gap: Spacing.lg,
        paddingBlockEnd: Spacing.md,
      }}
    >
      <Grid>
        <Metric
          category={METRIC_CATEGORY}
          label="Total crvUSD Staked"
          value={mapQuery(supplies, s => s.crvUSD)}
          valueOptions={{ unit: CRVUSD_OPTION }}
          copyText={t`Copied total crvUSD staked`}
        />
      </Grid>
      <Grid>
        <Metric
          category={METRIC_CATEGORY}
          label="Current projected APY"
          value={mapQuery(useScrvUsdStatistics({}), ({ apyProjected }) => apyProjected)}
          valueOptions={{ unit: 'percentage' }}
          copyText={t`Copied current projected APY`}
        />
      </Grid>
      <Grid>
        <Metric
          category={METRIC_CATEGORY}
          label="Total Revenue Distributed"
          value={mapQuery(revenue, ({ totalDistributed }) =>
            totalDistributed ? weiToEther(Number(totalDistributed)) : undefined,
          )}
          valueOptions={{ unit: CRVUSD_OPTION }}
          copyText={t`Copied total revenue distributed`}
        />
      </Grid>
      <Grid>
        <Metric
          category={METRIC_CATEGORY}
          label="Weekly Accumulated Revenue"
          value={mapQuery(revenue, ({ epochs }) => epochs[epochs.length - 1].weeklyRevenue)}
          valueOptions={{ unit: CRVUSD_OPTION }}
          copyText={t`Copied weekly accumulated revenue`}
        />
      </Grid>
    </Grid>
  )
}
