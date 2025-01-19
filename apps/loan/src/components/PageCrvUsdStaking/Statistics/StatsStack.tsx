import { Stack } from '@mui/material'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

import { useScrvUsdYield } from '@/entities/scrvusdYield'
import { useScrvUsdRevenue } from '@/entities/scrvusdRevenue'

const { Spacing } = SizesAndSpaces

const StatsStack = () => {
  const { data: yieldData, error: yieldError, isFetching: yieldIsFetching } = useScrvUsdYield({ timeOption: '1d' })
  const { data: revenueData, error: revenueError, isFetching: revenueIsFetching } = useScrvUsdRevenue({})

  return (
    <Stack direction="row" gap={Spacing.md} sx={{ justifyContent: 'space-between', width: '100%' }}>
      <Metric
        label="Total crvUSD Staked"
        value={yieldData?.[yieldData.length - 1]?.supply ?? 0}
        loading={yieldIsFetching}
        unit="dollar"
      />
      <Metric
        label="Historical APY"
        value={yieldData?.[yieldData.length - 1]?.proj_apy ?? 0}
        loading={yieldIsFetching}
        decimals={2}
        unit="percentage"
      />
      {/* <StatsColumn title="Total Revenue Distributed" value={data?.total_fees.toString() ?? ''} />
      <StatsColumn title="Weekly Accumulated Revenue" value={data?.protocol_fees.toString() ?? ''} /> */}
    </Stack>
  )
}

export default StatsStack
