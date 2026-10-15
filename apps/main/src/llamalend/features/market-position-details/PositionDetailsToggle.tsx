import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { usePositionDetailsOpen } from '@ui/features/storage/useLocalStorage'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { ChevronDownIcon } from '@ui/icons/ChevronDownIcon'
import { t } from '@ui/lib/i18n'

/** Card-header toggle for the position card's More details. Text on desktop, icon only on mobile. */
export const PositionDetailsToggle = () => {
  const [open, setOpen] = usePositionDetailsOpen()
  const isMobile = useIsMobile()
  if (!useNewLlamalendHealth()) return null
  const label = open ? t`Less details` : t`More details`
  const icon = (
    <ChevronDownIcon
      fontSize="small"
      sx={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 200ms ease-out' }}
    />
  )
  const common = { onClick: () => setOpen(!open), 'aria-expanded': open, 'data-testid': 'position-more-details-toggle' }
  return isMobile ? (
    <IconButton size="extraSmall" aria-label={label} {...common}>
      {icon}
    </IconButton>
  ) : (
    <Button color="ghost" size="extraSmall" endIcon={icon} sx={{ textWrapMode: 'nowrap', flexShrink: 0 }} {...common}>
      {label}
    </Button>
  )
}
