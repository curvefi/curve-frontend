import { ReactNode } from 'react'
import TuneIcon from '@mui/icons-material/Tune'
import IconButton, { type IconButtonProps } from '@mui/material/IconButton'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import {
  SlippageSettingsModal,
  type SlippageSettingsCallbacks,
  type SlippageSettingsProps,
} from './SlippageSettingsModal'

type SlippageSettingsBaseProps = Pick<SlippageSettingsProps, 'maxSlippage'> &
  Pick<SlippageSettingsCallbacks, 'onSave'> & {
    /** Whether the button should be disabled */
    disabled?: boolean
  }

type SlippageSettingsPropsWithButton = SlippageSettingsBaseProps & {
  /** Custom button component to render instead of the default IconButton */
  button?: (props: { maxSlippage?: string; onClick: () => void }) => ReactNode
  /** If `button` is provided, the `buttonIcon` prop must not be provided */
  buttonIcon?: never
  /** If `button` is provided, the `buttonSize` prop must not be provided */
  buttonSize?: never
}

type SlippageSettingsPropsWithButtonIcon = SlippageSettingsBaseProps & {
  /** Custom icon to use in the default IconButton */
  buttonIcon?: ReactNode
  /** Size of the default `IconButton` (ignored if button prop is provided) */
  buttonSize?: IconButtonProps['size']
  /** If `buttonIcon` or `buttonSize` are provided, the `button` prop must not be provided */
  button?: never
}

type Props = SlippageSettingsPropsWithButton | SlippageSettingsPropsWithButtonIcon

export const SlippageSettings = ({ disabled = false, maxSlippage, onSave, ...props }: Props) => {
  const [isOpen, , closeModal, toggleModal] = useSwitch()

  return (
    <>
      {props.button ? (
        props.button({ maxSlippage, onClick: toggleModal })
      ) : (
        <IconButton
          onClick={toggleModal}
          disabled={disabled}
          size={props.buttonSize ?? 'small'}
          data-testid="slippage-settings-button"
        >
          {props.buttonIcon || <TuneIcon color={disabled ? 'disabled' : 'action'} />}
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
