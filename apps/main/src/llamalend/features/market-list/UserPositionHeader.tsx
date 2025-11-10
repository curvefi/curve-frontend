import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Height, Spacing } = SizesAndSpaces

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

export const UserPositionHeader = () => {
  const isMobile = useIsMobile()
  return (
    <>
      <Stack
        direction="row"
        alignItems="end"
        sx={{
          minHeight: Height.userPositionsTitle,
          paddingBlockEnd: Spacing.sm,
          paddingInline: Spacing.md,
          flexGrow: 1,
          borderBottom: (t) => `1px solid ${t.design.Tabs.UnderLined.Default.Outline}`,
        }}
      >
        <Typography variant="headingXsBold">Your Positions</Typography>
      </Stack>
      {!isMobile && (
        <Grid container spacing={Spacing.sm}>
          {dummyData.map((item) => (
            <UserPositionStatisticItem
              key={item.label}
              {...item}
              value={formatNumber(item.value, { abbreviate: true })}
            />
          ))}
        </Grid>
      )}
    </>
  )
}

const UserPositionStatisticItem = ({
  label,
  value,
  startAdornment,
}: {
  label: string
  value: string
  startAdornment?: string
}) => {
  return (
    <Grid size={3} padding={Spacing.md}>
      <Stack>
        <Typography variant="bodyXsRegular" color="textTertiary">
          {label}
        </Typography>
        <Stack direction="row" alignItems="baseline">
          {startAdornment && (
            <Typography variant="highlightM" color="textSecondary">
              {startAdornment}
            </Typography>
          )}
          <Typography variant="highlightXl">{value}</Typography>
        </Stack>
      </Stack>
    </Grid>
  )
}
