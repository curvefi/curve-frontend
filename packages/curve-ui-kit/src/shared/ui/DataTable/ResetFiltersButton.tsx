import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const ResetFiltersButton = ({ onClick, hidden }: { onClick: () => void; hidden: boolean }) => (
  <Button
    color="ghost"
    size="small"
    onClick={onClick}
    data-testid="reset-filter"
    sx={{
      minWidth: 0,
      marginInlineStart: Spacing.xs,
      transition: `font-size ${TransitionFunction}, padding ${TransitionFunction}, margin ${TransitionFunction}`,
      ...(hidden && {
        fontSize: '0 !important', // unfortunately, MUI overrides the font-size very specifically
        padding: 0,
        marginInlineStart: '-16px', // negative margin to compensate for the flex gap
      }),
    }}
  >
    {t`Reset Filters`}
  </Button>
)
