import { useScrvUsdRevenue } from '@/loan/entities/scrvusdRevenue'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusdStatistics'
import { useScrvUsdYield } from '@/loan/entities/scrvusdYield'
import Grid from '@mui/material/Grid2'
import { t } from '@ui-kit/lib/i18n'
import type { TimeOption } from '@ui-kit/lib/types/scrvusd'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { weiToEther } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const CRVUSD_OPTION = { symbol: 'crvUSD', position: 'suffix' as const, abbreviate: true }

const StatsStack = () => {
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
          loading={yieldIsFetching}
          unit={CRVUSD_OPTION}
          copyText={t`Copied total crvUSD staked`}
        />
      </Grid>
      <Grid>
        <Metric
          label="Current APY"
          value={statisticsData?.aprProjected}
          loading={statisticsIsFetching}
          decimals={2}
          unit="percentage"
          copyText={t`Copied current APY`}
        />
      </Grid>
      <Grid>
        <Metric
          label="Total Revenue Distributed"
          value={revenueData?.totalDistributed ? weiToEther(Number(revenueData.totalDistributed)) : undefined}
          loading={revenueIsFetching}
          unit={CRVUSD_OPTION}
          copyText={t`Copied total revenue distributed`}
        />
      </Grid>
      <Grid>
        <Metric
          label="Weekly Accumulated Revenue"
          value={revenueData?.epochs[revenueData.epochs.length - 1].weeklyRevenue}
          loading={revenueIsFetching}
          unit={CRVUSD_OPTION}
          copyText={t`Copied weekly accumulated revenue`}
        />
      </Grid>
    </Grid>
  )
}

export default StatsStack
