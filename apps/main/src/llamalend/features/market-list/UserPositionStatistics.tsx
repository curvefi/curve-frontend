import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const dummyData = [
  {
    label: 'Total Collateral Value',
    value: 1420000,
    startAdornment: '$',
  },
  {
    label: 'Total Borrowed',
    value: 645120,
    startAdornment: '$',
  },
  {
    label: 'Total Supplied',
    value: 128170,
    startAdornment: '$',
  },
  {
    label: 'Claimable Rewards ',
    value: 28170,
    startAdornment: '$',
  },
]

export const UserPositionStatistics = () => (
    <Grid container spacing={Spacing.sm}>
      {dummyData.map((item) => (
        <UserPositionStatisticItem key={item.label} {...item} value={formatNumber(item.value, { abbreviate: true })} />
      ))}
    </Grid>
  )

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
