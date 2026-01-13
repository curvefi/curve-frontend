import { cloneElement, type ReactElement } from 'react'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
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
  /**
   * Token list to render inside the modal.
   * It may be any valid React element as long as it accepts `onToken` prop.
   * We use `cloneElement` to close the modal when a token changes.
   **/
  children: ReactElement<TokenSelectorChildProps<T>>
}

export const TokenSelector = <T extends TokenOption = TokenOption>({
  selectedToken,
  disabled = false,
  compact = false,
  children,
}: Props<T>) => {
  const [isOpen, openModal, closeModal] = useSwitch(false)
  return (
    <>
      <TokenSelectButton token={selectedToken} disabled={disabled} onClick={openModal} />
      <TokenSelectorModal isOpen={isOpen} compact={compact} onClose={closeModal}>
        {cloneElement(children, {
          onToken: (token: T) => {
            closeModal()
            if (!tokenOptionEquals(token, selectedToken)) {
              children.props.onToken(token)
            }
          },
        })}
      </TokenSelectorModal>
    </>
  )
}
