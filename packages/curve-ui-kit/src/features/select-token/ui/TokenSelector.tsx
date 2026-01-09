import { SxProps } from '@mui/material'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { type TokenOption, tokenOptionEquals } from '../types'
import { TokenList, type TokenListCallbacks, type TokenListProps } from './modal/TokenList'
import { TokenSelectorModal, type TokenSelectorModalProps } from './modal/TokenSelectorModal'
import { TokenSelectButton } from './TokenSelectButton'

type Props<T extends TokenOption = TokenOption> = Partial<TokenListProps<T>> &
  Partial<TokenListCallbacks<T>> &
  Partial<TokenSelectorModalProps> & {
    /** Currently selected token */
    selectedToken: T | undefined
    /** Disables the token selector button and modal */
    disabled?: boolean
    /** Custom styles to apply to the TokenSelectButton */
    sx?: SxProps
  }

export const TokenSelector = <T extends TokenOption = TokenOption>({
  selectedToken,
  tokens = [],
  favorites = [],
  balances = {},
  tokenPrices = {},
  disabled = false,
  showSearch = true,
  showManageList = true,
  error = '',
  disabledTokens = [],
  disableSorting = false,
  disableMyTokens = false,
  customOptions,
  compact = false,
  onToken,
  onSearch,
  sx,
}: Props<T>) => {
  const [isOpen, , closeModal, toggleModal] = useSwitch()

  return (
    <>
      <TokenSelectButton token={selectedToken} disabled={disabled} onClick={toggleModal} sx={sx} />
      <TokenSelectorModal showManageList={showManageList} isOpen={!!isOpen} compact={compact} onClose={closeModal}>
        <TokenList<T>
          tokens={tokens}
          balances={balances}
          tokenPrices={tokenPrices}
          favorites={favorites}
          showSearch={showSearch}
          error={error}
          disabledTokens={disabledTokens}
          disableSorting={disableSorting}
          disableMyTokens={disableMyTokens}
          customOptions={customOptions}
          onToken={(token) => {
            toggleModal()

            if (!tokenOptionEquals(token, selectedToken)) {
              onToken?.(token)
            }
          }}
          onSearch={(search) => onSearch?.(search)}
        />
      </TokenSelectorModal>
    </>
  )
}
