import IconButton from '@mui/material/IconButton'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'
import { SlippageSettingsModal } from './SlippageSettingsModal'
import type { SlippageSettingsFormData } from './useSlipageSettingsForm'

type SlippageSettingsProps = {
  onChanged?: (data: SlippageSettingsFormData) => void
  /** Whether the button should be disabled */
  disabled?: boolean
}

export const SlippageSettings = ({ disabled = false, onChanged }: SlippageSettingsProps) => {
  const [isOpen, , closeModal, toggleModal] = useSwitch()

  return (
    <>
      <IconButton
        onClick={toggleModal}
        disabled={disabled}
        size="extraExtraSmall"
        data-testid="slippage-settings-button"
      >
        <GearIcon sx={{ color: disabled ? 'text.secondary' : 'text.primary' }} />
      </IconButton>

      <SlippageSettingsModal
        isOpen={!!isOpen}
        onChanged={slippage => {
          closeModal()
          onChanged?.(slippage)
        }}
        onClose={closeModal}
      />
    </>
  )
}
