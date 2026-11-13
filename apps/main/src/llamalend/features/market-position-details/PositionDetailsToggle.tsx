import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { usePositionDetailsOpen } from '@ui/features/storage/useLocalStorage'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { ChevronDownIcon } from '@ui/icons/ChevronDownIcon'
import { RotatableIcon } from '@ui/icons/RotatableIcon'
import { t } from '@ui/lib/i18n'

/** Shows or hides the details row of the borrow position card. The choice is remembered. */
export const PositionDetailsToggle = () => {
  const [isOpen, setIsOpen] = usePositionDetailsOpen()
  const label = isOpen ? t`Less details` : t`More details`
  const onClick = () => setIsOpen(!isOpen)
  const icon = <RotatableIcon icon={ChevronDownIcon} rotated={isOpen} fontSize={20} />
  return useIsMobile() ? (
    <IconButton size="extraSmall" aria-label={label} aria-expanded={isOpen} onClick={onClick}>
      {icon}
    </IconButton>
  ) : (
    <Button
      color="ghost"
      size="extraSmall"
      endIcon={icon}
      sx={{ textWrapMode: 'nowrap' }}
      aria-expanded={isOpen}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}
