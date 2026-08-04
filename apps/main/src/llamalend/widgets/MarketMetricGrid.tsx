import Box, { type BoxProps } from '@mui/material/Box'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps } from '@ui-kit/utils'

const { Grid } = SizesAndSpaces

const MARKET_METRIC_GRID_CATEGORIES = {
  primaryStat: {
    columnGap: Grid.Column_Spacing,
    rowGap: Grid.Row_Spacing,
    gridTemplateColumns: {
      mobile: 'repeat(2, minmax(0, 1fr))',
      tablet: 'repeat(4, minmax(0, 1fr))',
    },
  },
  secondaryDetail: {
    columnGap: Grid.Column_Spacing,
    rowGap: { ...Grid.Column_Spacing, mobile: 0 },
    gridTemplateColumns: {
      mobile: 'repeat(1, minmax(0, 1fr))',
      tablet: 'repeat(2, minmax(0, 1fr))',
      desktop: 'repeat(4, minmax(0, 1fr))',
    },
  },
} as const

/**
 * TODO: 1. there's a notion ticket to create a proper metrics grid component
 * 2. Ideally, we should define the category of a Metric in the parent, and make the Metric children inherit,
 * because the grid columns and row spacing depend on that. We could use cloneElement or React context.
 */
export const MarketMetricGrid = ({
  category = 'primaryStat',
  sx,
  ...props
}: BoxProps & {
  category?: keyof typeof MARKET_METRIC_GRID_CATEGORIES
}) => (
  <Box
    {...props}
    sx={applySxProps(
      {
        display: 'grid',
      },
      MARKET_METRIC_GRID_CATEGORIES[category],
      sx,
    )}
  />
)
