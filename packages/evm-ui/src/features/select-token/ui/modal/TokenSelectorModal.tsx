import type { ReactNode } from 'react'
import { ModalDialog } from '@ui/components/ModalDialog'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { MaxHeight } = SizesAndSpaces

type TokenSelectorModalCallbacks = {
  /** Callback when modal is closed */
  onClose: () => void
}

export type TokenSelectorModalProps = {
  /** Controls visibility of the modal */
  isOpen: boolean
  /** Controls whether the modal should use a compact layout with fixed height */
  compact: boolean
  /** Title of the modal */
  title?: string
  /** The content of the modal */
  children: ReactNode
}

type Props = TokenSelectorModalCallbacks & TokenSelectorModalProps

export const TokenSelectorModal = ({ isOpen, compact, onClose, children, title = t`Select Token` }: Props) => (
  <ModalDialog
    open={isOpen}
    onClose={onClose}
    title={title}
    compact={compact}
    maxHeight={MaxHeight.tokenSelector}
    sx={{ '& .MuiPaper-root:not(.MuiAlert-root)': { overflowY: 'hidden' } }}
  >
    {children}
  </ModalDialog>
)
