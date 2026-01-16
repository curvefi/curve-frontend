import { cloneElement, type ReactElement } from 'react'
import { type TokenOption, tokenOptionEquals } from '../types'
import { TokenSelectorModal, type TokenSelectorModalProps } from './modal/TokenSelectorModal'
import { TokenSelectButton } from './TokenSelectButton'

type TokenSelectorChildProps<T extends TokenOption = TokenOption> = {
  onToken: (token: T) => void
}

type Props<T extends TokenOption = TokenOption> = Partial<Pick<TokenSelectorModalProps, 'compact'>> & {
  /** Currently selected token */
  selectedToken: T | undefined
  /** Disables the token selector button and modal */
  disabled?: boolean
  /** Whether the modal is open - controlled by parent */
  isOpen: boolean
  /** Callback to open/close modal */
  onOpen: () => void
  /** Callback to close modal */
  onClose: () => void
  /**
   * Token list to render inside the modal.
   * It may be any valid React element as long as it accepts `onToken` prop.
   * We use `cloneElement` to close the modal when a token changes.
   **/
  children: ReactElement<TokenSelectorChildProps<T>>
}

export const TokenSelector = <T extends TokenOption = TokenOption>({
  selectedToken,
  isOpen,
  disabled = false,
  compact = false,
  onOpen,
  onClose,
  children,
}: Props<T>) => (
  <>
    <TokenSelectButton token={selectedToken} disabled={disabled} onClick={onOpen} />
    <TokenSelectorModal isOpen={isOpen} compact={compact} onClose={onClose}>
      {cloneElement(children, {
        onToken: (token: T) => {
          onClose()
          if (!tokenOptionEquals(token, selectedToken)) {
            children.props.onToken(token)
          }
        },
      })}
    </TokenSelectorModal>
  </>
)
