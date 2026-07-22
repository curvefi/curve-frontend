import Box, { type BoxProps } from '@mui/material/Box'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Grid } = SizesAndSpaces

export const MarketMetricGrid = ({ sx, ...props }: BoxProps) => (
  <Box
    {...props}
    sx={theme => ({
      display: 'grid',
      columnGap: Grid.Column_Spacing,
      rowGap: Grid.Row_Spacing,
      gridTemplateColumns: {
        mobile: 'repeat(2, minmax(0, 1fr))',
        tablet: 'repeat(4, minmax(0, 1fr))',
      },
      ...theme.unstable_sx(sx ?? {}),
    })}
  />
)
