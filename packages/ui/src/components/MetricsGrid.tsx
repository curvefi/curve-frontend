import Box, { type BoxProps } from '@mui/material/Box'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { applySxProps } from '@ui/lib/mui'

const { Grid } = SizesAndSpaces

const columnTemplate = (count: number) => `repeat(${count}, minmax(0, 1fr))`

const METRICS_GRID_VARIANTS = {
  default: { gridTemplateColumns: { mobile: columnTemplate(2), tablet: columnTemplate(4) } },
  mobileRows: {
    gridTemplateColumns: { mobile: columnTemplate(1), tablet: columnTemplate(2), desktop: columnTemplate(4) },
    /** set to 0 for mobile because the assumption here is that metrics get transformed to row metrics */
    rowGap: { ...Grid.Row_Spacing, mobile: 0 },
  },
  auto: { gridAutoFlow: 'column', gridAutoColumns: 'minmax(0, 1fr)' },
} as const

/**
 * Grid for consistent column sizes across pages when only showing metrics.
 * The auto variant gives each rendered direct child an equal-width column at every viewport size.
 */
export const MetricsGrid = ({
  variant = 'default',
  sx,
  ...props
}: BoxProps & {
  /** Layout preset only; Metric children keep their own categories. */
  variant?: keyof typeof METRICS_GRID_VARIANTS
}) => (
  <Box
    {...props}
    sx={applySxProps(
      { display: 'grid', rowGap: Grid.Row_Spacing, columnGap: Grid.Column_Spacing },
      METRICS_GRID_VARIANTS[variant],
      sx,
    )}
  />
)
