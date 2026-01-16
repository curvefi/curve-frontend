import { useScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusd-statistics'
import { useScrvUsdYield } from '@/loan/entities/scrvusd-yield'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { weiToEther } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const CRVUSD_OPTION = { symbol: 'crvUSD', position: 'suffix' as const, abbreviate: true }

export const StatsStack = () => {
  const { data: yieldData, isFetching: yieldIsFetching } = useScrvUsdYield({ timeOption: '1Y' as TimeOption })
  const { data: revenueData, isFetching: revenueIsFetching } = useScrvUsdRevenue({})
  const { data: statisticsData, isFetching: statisticsIsFetching } = useScrvUsdStatistics({})

  return (
    <Grid
      container
      wrap="wrap"
      sx={{
        display: 'grid',
        gridAutoRows: '1fr',
        gridTemplateColumns: { mobile: 'repeat(2, 1fr)', tablet: 'repeat(2, 1fr)', desktop: 'repeat(4, 1fr)' },
        gap: Spacing.lg,
      }}
    >
      <Grid>
        <Metric
          label="Total crvUSD Staked"
          value={yieldData?.[yieldData.length - 1]?.supply}
          valueOptions={{ unit: CRVUSD_OPTION }}
          loading={yieldIsFetching}
          copyText={t`Copied total crvUSD staked`}
        />
      </Grid>
      <Grid>
        <Metric
          label="Current projected APY"
          value={statisticsData?.apyProjected}
          valueOptions={{ unit: 'percentage' }}
          loading={statisticsIsFetching}
          copyText={t`Copied current projected APY`}
        />
      </Grid>
      <Grid>
        <Metric
          label="Total Revenue Distributed"
          value={revenueData?.totalDistributed ? weiToEther(Number(revenueData.totalDistributed)) : undefined}
          valueOptions={{ unit: CRVUSD_OPTION }}
          loading={revenueIsFetching}
          copyText={t`Copied total revenue distributed`}
        />
      </Grid>
      <Grid>
        <Metric
          label="Weekly Accumulated Revenue"
          value={revenueData?.epochs[revenueData.epochs.length - 1].weeklyRevenue}
          valueOptions={{ unit: CRVUSD_OPTION }}
          loading={revenueIsFetching}
          copyText={t`Copied weekly accumulated revenue`}
        />
      </Grid>
    </Grid>
  )
}
