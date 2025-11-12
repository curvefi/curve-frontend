import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type LlamaMarket } from '@/llamalend/entities/llama-markets'
import { useUserPositionsSummary } from './hooks/useUserPositionsSummary'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type UserPositionStatisticsProps = {
  markets: LlamaMarket[] | undefined
  loading: boolean
}

export const UserPositionSummary = ({ markets, loading }: UserPositionStatisticsProps) => {
  const { totals, isInitialLoading } = useUserPositionsSummary(markets, { enabled: !loading })
  const showSkeletons = loading || isInitialLoading
  const items = [
    {
      label: 'Total Collateral Value',
      value: totals.collateralValue,
      startAdornment: '$',
    },
    {
      label: 'Total Borrowed',
      value: totals.borrowedValue,
      startAdornment: '$',
    },
    {
      label: 'Total Supplied',
      value: totals.suppliedValue,
      startAdornment: '$',
    },
    {
      label: 'Claimable Rewards',
      value: totals.rewardsValue,
      startAdornment: '$',
    },
  ] as const

  return (
    <Grid container spacing={Spacing.sm} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      {items.map(({ label, value, startAdornment }) => (
        <UserPositionStatisticItem
          key={label}
          label={label}
          startAdornment={startAdornment}
          isLoading={showSkeletons}
          value={formatNumber(value ?? 0, { abbreviate: true })}
        />
      ))}
    </Grid>
  )
}

const UserPositionStatisticItem = ({
  label,
  value,
  startAdornment,
  isLoading,
}: {
  label: string
  value: string
  startAdornment?: string
  isLoading?: boolean
}) => (
  <Grid size={3} padding={Spacing.md}>
    <Stack>
      <Typography variant="bodyXsRegular" color="textTertiary">
        {label}
      </Typography>
      {isLoading ? (
        <Skeleton variant="rectangular" width={110} height={32} />
      ) : (
        <Stack direction="row" alignItems="baseline">
          {startAdornment && (
            <Typography variant="highlightM" color="textSecondary">
              {startAdornment}
            </Typography>
          )}
          <Typography variant="highlightXl">{value}</Typography>
        </Stack>
      )}
    </Stack>
  </Grid>
)
