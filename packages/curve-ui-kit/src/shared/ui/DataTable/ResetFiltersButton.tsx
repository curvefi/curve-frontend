import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'

export const ResetFiltersButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    color="ghost"
    size="extraSmall"
    onClick={onClick}
    data-testid="reset-filter"
    sx={{
      transition: `all ${TransitionFunction}`,
    }}
  >
    {t`Reset Filters`}
  </Button>
)
