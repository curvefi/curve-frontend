import { ReactNode } from 'react'
import TuneIcon from '@mui/icons-material/Tune'
import { IconButton } from '@mui/material'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import {
  SlippageSettingsModal,
  type SlippageSettingsCallbacks,
  type SlippageSettingsProps,
} from './SlippageSettingsModal'

type Props = Pick<SlippageSettingsProps, 'maxSlippage'> &
  Pick<SlippageSettingsCallbacks, 'onSave'> & {
    button?: (props: { maxSlippage?: string; onClick: () => void }) => ReactNode
    buttonIcon?: ReactNode
    disabled?: boolean
  }

export const SlippageSettings = ({ disabled = false, button, buttonIcon, maxSlippage, onSave }: Props) => {
  const [isOpen, , closeModal, toggleModal] = useSwitch()

  return (
    <>
      {button ? (
        button({ maxSlippage, onClick: toggleModal })
      ) : (
        <IconButton onClick={toggleModal} disabled={disabled}>
          {buttonIcon || <TuneIcon color={disabled ? 'disabled' : 'action'} />}
        </IconButton>
      )}

      <SlippageSettingsModal
        isOpen={!!isOpen}
        maxSlippage={maxSlippage}
        onSave={(slippage) => {
          toggleModal()
          onSave(slippage)
        }}
        onClose={closeModal}
      />
    </>
  )
}
