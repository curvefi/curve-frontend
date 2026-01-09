import type { ReactNode } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxHeight } = SizesAndSpaces

export type TokenSelectorModalCallbacks = {
  /** Callback when modal is closed */
  onClose: () => void
}

export type TokenSelectorModalProps = {
  /** Controls visibility of the modal */
  isOpen: boolean
  /** Controls whether the modal should use a compact layout with fixed height */
  compact: boolean
  /** The content of the modal */
  children: ReactNode
}

export type Props = TokenSelectorModalCallbacks & TokenSelectorModalProps

export const TokenSelectorModal = ({ isOpen, compact, onClose, children }: Props) => (
  <ModalDialog
    open={isOpen}
    onClose={onClose}
    title={t`Select Token`}
    compact={compact}
    maxHeight={MaxHeight.tokenSelector}
    sx={{ '& .MuiPaper-root:not(.MuiAlert-root)': { overflowY: 'hidden' } }}
  >
    {children}
  </ModalDialog>
)
