import Grid from '@mui/material/Grid2'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

import { useScrvUsdYield } from '@/loan/entities/scrvusdYield'
import { useScrvUsdRevenue } from '@/loan/entities/scrvusdRevenue'
import { useScrvUsdStatistics } from '@/loan/entities/scrvusdStatistics'

const { Spacing } = SizesAndSpaces

const CRVUSD_OPTION = {
  symbol: 'crvUSD',
  position: 'suffix' as const,
  abbreviate: true,
}

const StatsStack = () => {
  const { data: yieldData, error: yieldError, isFetching: yieldIsFetching } = useScrvUsdYield({ timeOption: '1Y' })
  const { data: revenueData, error: revenueError, isFetching: revenueIsFetching } = useScrvUsdRevenue({})
  const { data: statisticsData, error: statisticsError, isFetching: statisticsIsFetching } = useScrvUsdStatistics({})

  return (
    <Grid
      container
      wrap="wrap"
      sx={{
        display: 'grid',
        // gridAutoFlow: 'dense',
        gridAutoRows: '1fr',
        gridTemplateColumns: {
          mobile: 'repeat(2, 1fr)',
          tablet: 'repeat(2, 1fr)',
          desktop: 'repeat(4, 1fr)',
        },
        gap: Spacing.lg,
      }}
    >
      <Grid>
        <Metric
          label="Total crvUSD Staked"
          value={yieldData?.[yieldData.length - 1]?.supply ?? 0}
          loading={yieldIsFetching}
          unit={CRVUSD_OPTION}
        />
      </Grid>
      <Grid>
        <Metric
          label="Current APY"
          value={statisticsData?.proj_apr ?? 0}
          loading={statisticsIsFetching}
          decimals={2}
          unit="percentage"
        />
      </Grid>
      <Grid>
        <Metric
          label="Total Revenue Distributed"
          value={revenueData?.total_distributed ?? 0}
          loading={revenueIsFetching}
          unit={CRVUSD_OPTION}
        />
      </Grid>
      <Grid>
        <Metric
          label="Weekly Accumulated Revenue"
          value={revenueData?.epochs[revenueData.epochs.length - 1].weeklyRevenue ?? 0}
          loading={revenueIsFetching}
          unit={CRVUSD_OPTION}
        />
      </Grid>
    </Grid>
  )
}

export default StatsStack
