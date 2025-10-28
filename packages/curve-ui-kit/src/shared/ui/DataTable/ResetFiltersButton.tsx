import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import { t } from '@ui-kit/lib/i18n'

export const ResetFiltersButton = ({ onClick, hidden }: { onClick: () => void; hidden: boolean }) => (
  <Collapse in={!hidden} orientation="horizontal">
    <Button color="ghost" size="extraSmall" onClick={onClick} data-testid="reset-filter" sx={{ whiteSpace: 'nowrap' }}>
      {t`Reset Filters`}
    </Button>
  </Collapse>
)
