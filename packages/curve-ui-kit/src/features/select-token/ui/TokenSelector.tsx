import { cloneElement, type ReactElement } from 'react'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { type TokenOption } from '../types'
import { TokenSelectorModal, type TokenSelectorModalProps } from './modal/TokenSelectorModal'
import { TokenSelectButton } from './TokenSelectButton'

type Props<T extends TokenOption = TokenOption> = Partial<Pick<TokenSelectorModalProps, 'compact' | 'title'>> & {
  /** Currently selected token */
  selectedToken: T | undefined
  /** Disables the token selector button and modal */
  disabled?: boolean
  /**
   * Token list to render inside the modal.
   * It may be any valid React element as long as it accepts `onToken` prop.
   * We use `cloneElement` to close the modal when a token changes.
   **/
  children: ReactElement<{ onToken: (token: T) => void }>
}

/**
 * Unfortunately, TypeScript does not enforce that the passed child has onToken prop of correct type.
 * We perform a runtime check in development mode to help catch errors early.
 */
function checkChildProps<T extends TokenOption>({ onToken }: { onToken: (token: T) => void }) {
  if (process.env.NODE_ENV === 'production' || typeof onToken === 'function') {
    return { onToken }
  }
  throw new Error(`TokenSelector children must accept an onToken prop of type (token: T) => void`)
}

export const TokenSelector = <T extends TokenOption = TokenOption>({
  selectedToken,
  disabled = false,
  compact = false,
  title,
  children,
}: Props<T>) => {
  const [isOpen, openModal, closeModal] = useSwitch(false)
  const { onToken } = checkChildProps(children.props)
  return (
    <>
      <TokenSelectButton token={selectedToken} disabled={disabled} onClick={openModal} />
      <TokenSelectorModal isOpen={isOpen} compact={compact} title={title} onClose={closeModal}>
        {cloneElement(children, {
          onToken: (token: T) => {
            closeModal()
            onToken(token)
          },
        })}
      </TokenSelectorModal>
    </>
  )
}
