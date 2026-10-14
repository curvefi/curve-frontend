import Button from '@mui/material/Button'
import { ChevronDownIcon } from '@ui/icons/ChevronDownIcon'
import { RotatableIcon } from '@ui/icons/RotatableIcon'
import { t } from '@ui/lib/i18n'

/** Button to expand cards if they contain an inner Collapsible */
export const ViewMoreButton = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => (
  <Button size="extraSmall" color="ghost" onClick={onClick}>
    {isOpen ? t`View less` : t`View more`}
    <RotatableIcon icon={ChevronDownIcon} rotated={isOpen} fontSize={20} />
  </Button>
)
