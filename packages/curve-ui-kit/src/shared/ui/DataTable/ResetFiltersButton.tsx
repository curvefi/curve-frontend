import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const ResetFiltersButton = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
  <Button
    color="ghost"
    size="small"
    onClick={onClick}
    data-testid="reset-filter"
    sx={{
      minWidth: 0,
      marginInlineStart: Spacing.xs,
      transition: `font-size ${TransitionFunction}, border ${TransitionFunction}, padding ${TransitionFunction}, margin ${TransitionFunction}`,
      ...(disabled && { fontSize: '0 !important', border: 0, padding: 0, margin: 0 }), // unfortunately, MUI overrides the font-size very specifically
    }}
  >
    {t`Reset Filters`}
  </Button>
)
