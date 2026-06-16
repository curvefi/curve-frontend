import { useScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue.query'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusd-statistics.query'
import { useScrvUsdSupplies } from '@/loan/entities/scrvusd-supplies.query'
import type { ChainId } from '@/loan/types/loan.types'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { weiToEther } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const CRVUSD_OPTION = { symbol: 'crvUSD', position: 'suffix' as const, abbreviate: true }

type StatsStackProps = {
  chainId: ChainId | undefined
}

export const StatsStack = ({ chainId }: StatsStackProps) => {
  const { data: suppliesData, isLoading: suppliesIsLoading } = useScrvUsdSupplies({ chainId })
  const { data: revenueData, isLoading: revenueIsLoading } = useScrvUsdRevenue({})
  const { data: statisticsData, isLoading: statisticsIsLoading } = useScrvUsdStatistics({})
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
          size="small"
          label="Total crvUSD Staked"
          value={suppliesData?.crvUSD}
          valueOptions={{ unit: CRVUSD_OPTION }}
          loading={suppliesIsLoading}
          copyText={t`Copied total crvUSD staked`}
        />
      </Grid>
      <Grid>
        <Metric
          size="small"
          label="Current projected APY"
          value={statisticsData?.apyProjected}
          valueOptions={{ unit: 'percentage' }}
          loading={statisticsIsLoading}
          copyText={t`Copied current projected APY`}
        />
      </Grid>
      <Grid>
        <Metric
          size="small"
          label="Total Revenue Distributed"
          value={revenueData?.totalDistributed ? weiToEther(Number(revenueData.totalDistributed)) : undefined}
          valueOptions={{ unit: CRVUSD_OPTION }}
          loading={revenueIsLoading}
          copyText={t`Copied total revenue distributed`}
        />
      </Grid>
      <Grid>
        <Metric
          size="small"
          label="Weekly Accumulated Revenue"
          value={revenueData?.epochs[revenueData.epochs.length - 1].weeklyRevenue}
          valueOptions={{ unit: CRVUSD_OPTION }}
          loading={revenueIsLoading}
          copyText={t`Copied weekly accumulated revenue`}
        />
      </Grid>
    </Grid>
  )
}
