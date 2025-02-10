import Grid from '@mui/material/Grid2'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

import { useScrvUsdYield } from '@/loan/entities/scrvusdYield'
import { useScrvUsdRevenue } from '@/loan/entities/scrvusdRevenue'

const { Spacing } = SizesAndSpaces

const CRVUSD_OPTION = {
  symbol: 'crvUSD',
  position: 'suffix' as const,
  abbreviate: true,
}

const StatsStack = () => {
  const { data: yieldData, error: yieldError, isFetching: yieldIsFetching } = useScrvUsdYield({ timeOption: '1y' })
  const { data: revenueData, error: revenueError, isFetching: revenueIsFetching } = useScrvUsdRevenue({})

  return (
    <Grid container columnGap={Spacing.lg} rowGap={Spacing.md} wrap="wrap">
      <Grid flexGrow={1}>
        <Metric
          label="Total crvUSD Staked"
          value={yieldData?.[yieldData.length - 1]?.supply ?? 0}
          loading={yieldIsFetching}
          unit={CRVUSD_OPTION}
        />
      </Grid>
      <Grid flexGrow={1}>
        <Metric
          label="Current APY"
          value={yieldData?.[yieldData.length - 1]?.proj_apy ?? 0}
          loading={yieldIsFetching}
          decimals={2}
          unit="percentage"
        />
      </Grid>
      <Grid flexGrow={1}>
        <Metric
          label="Total Revenue Distributed"
          value={revenueData?.total_distributed ?? 0}
          loading={revenueIsFetching}
          unit={CRVUSD_OPTION}
        />
      </Grid>
      <Grid flexGrow={1}>
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
