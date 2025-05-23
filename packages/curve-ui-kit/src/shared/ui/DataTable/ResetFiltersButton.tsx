import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'

export const ResetFiltersButton = ({ onClick, hidden }: { onClick: () => void; hidden: boolean }) => (
  <Button
    color="ghost"
    size="small"
    onClick={onClick}
    data-testid="reset-filter"
    sx={{
      transition: `all ${TransitionFunction}`,
      ...(hidden && {
        '&&&': {
          // unfortunately, MUI overrides the font-size very specifically
          fontSize: 0,
        },
        padding: 0,
      }),
    }}
  >
    {t`Reset Filters`}
  </Button>
)
