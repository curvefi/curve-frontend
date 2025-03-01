import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { t } from '@ui-kit/lib/i18n'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { ModalSettingsButton } from '@ui-kit/shared/ui/ModalSettingsButton'

import { TokenSettings } from './TokenSettings'
import { TokenList, type Props as TokenListProps } from './TokenList'

export type TokenSelectorModalCallbacks = {
  /** Callback when modal is closed */
  onClose: () => void
}

export type TokenSelectorModalProps = {
  /** Controls visibility of the modal */
  isOpen: boolean
  /** Shows settings button in token selector modal footer */
  showSettings: boolean
  /** In compact mode the modal doesn't grow into its maximum height */
  compact: boolean
}

export type Props = TokenListProps & TokenSelectorModalCallbacks & TokenSelectorModalProps

export const TokenSelectorModal = ({ isOpen, showSettings, compact, onClose, ...tokenListProps }: Props) => {
  const [isSettingsOpen, openSettings, closeSettings] = useSwitch()

  return (
    isOpen != null && (
      <ModalDialog
        open={isOpen}
        onClose={onClose}
        title={isSettingsOpen ? t`Select Token Settings` : t`Select Token`}
        titleAction={
          isSettingsOpen && (
            <IconButton onClick={closeSettings}>
              <ArrowBackIcon />
            </IconButton>
          )
        }
        footer={showSettings && !isSettingsOpen && <ModalSettingsButton onClick={openSettings} />}
        sx={{
          ...(compact && {
            '& .MuiPaper-root': {
              height: 'auto',
              minHeight: 'auto',
            },
          }),
        }}
      >
        {isSettingsOpen ? <TokenSettings /> : <TokenList {...tokenListProps} />}
      </ModalDialog>
    )
  )
}
