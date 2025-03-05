import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { t } from '@ui-kit/lib/i18n'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { ModalSettingsButton } from '@ui-kit/shared/ui/ModalSettingsButton'

import { ManageTokenList } from './ManageTokenList'
import { TokenList, type Props as TokenListProps } from './TokenList'

export type TokenSelectorModalCallbacks = {
  /** Callback when modal is closed */
  onClose: () => void
}

export type TokenSelectorModalProps = {
  /** Controls visibility of the modal */
  isOpen: boolean
  /** Shows token list management options (currently disabled in UI but wired for future use) */
  showManageList: boolean
  /** In compact mode the modal doesn't grow into its maximum height */
  compact: boolean
}

export type Props = TokenListProps & TokenSelectorModalCallbacks & TokenSelectorModalProps

export const TokenSelectorModal = ({
  isOpen,
  showManageList: showSettings,
  compact,
  onClose,
  ...tokenListProps
}: Props) => {
  const [isManageListOpen, openManageList, closeManageList] = useSwitch()

  return (
    isOpen != null && (
      <ModalDialog
        open={isOpen}
        onClose={onClose}
        title={isManageListOpen ? t`Manage Token List` : t`Select Token`}
        titleAction={
          isManageListOpen && (
            <IconButton onClick={closeManageList}>
              <ArrowBackIcon />
            </IconButton>
          )
        }
        footer={
          /* Settings button is temporarily disabled in the footer.
          This will be repurposed as a token list configuration page in the future.
          The wiring is kept in place to avoid removing and re-implementing later. */
          false && showSettings && !isManageListOpen && <ModalSettingsButton onClick={openManageList} />
        }
        sx={{
          ...(compact && {
            '& .MuiPaper-root': {
              height: 'auto',
              minHeight: 'auto',
            },
          }),
        }}
      >
        {isManageListOpen ? <ManageTokenList /> : <TokenList {...tokenListProps} />}
      </ModalDialog>
    )
  )
}
