import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { ModalSettingsButton } from '@ui-kit/shared/ui/ModalSettingsButton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ManageTokenList } from './ManageTokenList'
import { TokenList, type Props as TokenListProps } from './TokenList'

const { MaxHeight } = SizesAndSpaces

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

export const TokenSelectorModal = ({ isOpen, showManageList, compact, onClose, ...tokenListProps }: Props) => {
  const [isManageListOpen, openManageList, closeManageList] = useSwitch()

  return (
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
        false && showManageList && !isManageListOpen && <ModalSettingsButton onClick={openManageList} />
      }
      sx={{
        '& .MuiPaper-root': {
          overflowY: 'hidden',
          maxHeight: MaxHeight.tokenSelector,
          ...(compact && {
            height: 'auto',
            minHeight: 'auto',
          }),
        },
      }}
    >
      {isManageListOpen ? <ManageTokenList /> : <TokenList {...tokenListProps} />}
    </ModalDialog>
  )
}
