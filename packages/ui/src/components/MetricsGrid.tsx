import Box, { type BoxProps } from '@mui/material/Box'
import { fromEntries, recordEntries } from '@primitives/objects.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { applySxProps } from '@ui/lib/mui'

const { Grid } = SizesAndSpaces

const METRICS_GRID_VARIANTS = {
  default: { columns: { mobile: 2, tablet: 4 }, rowGap: Grid.Row_Spacing },
  mobileRows: {
    columns: { mobile: 1, tablet: 2, desktop: 4 },
    rowGap: {
      ...Grid.Row_Spacing,
      mobile: 0 /** set to 0 because the assumption here is that metrics get transformed to row metrics */,
    },
  },
} as const

const columnTemplate = (count: number) => `repeat(${count}, minmax(0, 1fr))`

type MetricsGridProps = BoxProps & {
  /** Layout preset only; Metric children keep their own categories. Defaults to primaryStat. */
  variant?: keyof typeof METRICS_GRID_VARIANTS
}

/** Grid for consistent column sizes across pages when only showing metrics. */
export const MetricsGrid = ({ variant = 'default', sx, ...props }: MetricsGridProps) => {
  // Somehow if you try to inline this you get a typescript error about union type being too long?
  const gridTemplateColumns = fromEntries(
    recordEntries(METRICS_GRID_VARIANTS[variant].columns).map(([breakpoint, count]) => [
      breakpoint,
      columnTemplate(count),
    ]),
  )

  return (
    <Box
      {...props}
      sx={applySxProps(
        {
          display: 'grid',
          gridTemplateColumns,
          columnGap: Grid.Column_Spacing,
          rowGap: METRICS_GRID_VARIANTS[variant].rowGap,
        },
        sx,
      )}
    />
  )
}
