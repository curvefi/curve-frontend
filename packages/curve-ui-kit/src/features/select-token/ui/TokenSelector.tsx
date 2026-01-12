import { cloneElement, isValidElement, type ReactElement } from 'react'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { type TokenOption, tokenOptionEquals } from '../types'
import { TokenSelectorModal, type TokenSelectorModalProps } from './modal/TokenSelectorModal'
import { TokenSelectButton } from './TokenSelectButton'

type TokenSelectorChildProps<T extends TokenOption = TokenOption> = {
  onToken: (token: T) => void
}

type Props<T extends TokenOption = TokenOption> = Partial<Pick<TokenSelectorModalProps, 'compact' | 'title'>> & {
  /** Currently selected token */
  selectedToken: T | undefined
  /** Disables the token selector button and modal */
  disabled?: boolean
  /** Token list to render inside the modal */
  children: ReactElement<TokenSelectorChildProps<T>>
}

export const TokenSelector = <T extends TokenOption = TokenOption>({
  selectedToken,
  disabled = false,
  compact = false,
  title,
  children,
}: Props<T>) => {
  const [isOpen, , closeModal, toggleModal] = useSwitch(false)
  return (
    <>
      <TokenSelectButton token={selectedToken} disabled={disabled} onClick={toggleModal} />
      <TokenSelectorModal isOpen={isOpen} compact={compact} title={title} onClose={closeModal}>
        {isValidElement(children)
          ? cloneElement(children, {
              onToken: (token: T) => {
                closeModal()
                if (!tokenOptionEquals(token, selectedToken)) {
                  children.props.onToken(token)
                }
              },
            })
          : children}
      </TokenSelectorModal>
    </>
  )
}
