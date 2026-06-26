import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { RotatableIcon } from './DataTable/RotatableIcon'

/** Button to expand cards if they contain an inner Collapsible */
export const ViewMoreButton = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => (
  <Button size="extraSmall" color="ghost" onClick={onClick}>
    {isOpen ? t`View less` : t`View more`}
    <RotatableIcon icon={ExpandMoreIcon} rotated={isOpen} fontSize={20} />
  </Button>
)
