import { Stack } from '@mui/material'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@/ui/utils'

import { useScrvUsdYield } from '@/entities/scrvusdYield'
import { useScrvUsdRevenue } from '@/entities/scrvusdRevenue'

const { Spacing } = SizesAndSpaces
const metricSkeletonSize = { width: 90, height: 36 }

const StatsColumn = ({
  title,
  value,
  loading,
  error,
}: {
  title: string
  value: string
  loading: boolean
  error: boolean
}) => (
  <Stack>
    <Typography variant="bodyXsRegular" sx={{ color: (t) => t.design.Text.TextColors.Tertiary }}>
      {title}
    </Typography>
    {loading ? (
      <Skeleton width={metricSkeletonSize.width} height={metricSkeletonSize.height} />
    ) : (
      <Typography variant="highlightXl">{error ? '-' : value}</Typography>
    )}
  </Stack>
)

const StatsStack = () => {
  const { data: yieldData, error: yieldError, isFetching: yieldIsFetching } = useScrvUsdYield({ timeFrame: '1d' })
  const { data: revenueData, error: revenueError, isFetching: revenueIsFetching } = useScrvUsdRevenue({})

  return (
    <Stack direction="row" gap={Spacing.md} sx={{ justifyContent: 'space-between', width: '100%' }}>
      <StatsColumn
        title="Total crvUSD Staked"
        value={formatNumber(yieldData?.[yieldData.length - 1].supply ?? 0, { notation: 'compact' })}
        loading={yieldIsFetching}
        error={!!yieldError}
      />
      <StatsColumn
        title="Historical APY"
        value={yieldData?.[yieldData.length - 1].proj_apy.toFixed(2) + '%'}
        loading={yieldIsFetching}
        error={!!yieldError}
      />
      {/* <StatsColumn title="Total Revenue Distributed" value={data?.total_fees.toString() ?? ''} />
      <StatsColumn title="Weekly Accumulated Revenue" value={data?.protocol_fees.toString() ?? ''} /> */}
    </Stack>
  )
}

export default StatsStack
