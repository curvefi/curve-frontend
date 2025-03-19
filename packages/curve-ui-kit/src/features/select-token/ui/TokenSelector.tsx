import { SxProps } from '@mui/material'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import type { TokenOption } from '../types'
import type { TokenListCallbacks, TokenListProps } from './modal/TokenList'
import { TokenSelectorModal, type TokenSelectorModalProps } from './modal/TokenSelectorModal'
import { TokenSelectButton } from './TokenSelectButton'

type Props = Partial<TokenListProps> &
  Partial<TokenListCallbacks> &
  Partial<TokenSelectorModalProps> & {
    /** Currently selected token */
    selectedToken: TokenOption | undefined
    /** Disables the token selector button and modal */
    disabled?: boolean
    /** Custom styles to apply to the TokenSelectButton */
    sx?: SxProps
  }

export const TokenSelector = ({
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
}: Props) => {
  const [isOpen, , closeModal, toggleModal] = useSwitch()

  return (
    <>
      <TokenSelectButton token={selectedToken} disabled={disabled} onClick={toggleModal} sx={sx} />
      <TokenSelectorModal
        tokens={tokens}
        balances={balances}
        tokenPrices={tokenPrices}
        favorites={favorites}
        showSearch={showSearch}
        showManageList={showManageList}
        isOpen={!!isOpen}
        error={error}
        disabledTokens={disabledTokens}
        disableSorting={disableSorting}
        disableMyTokens={disableMyTokens}
        customOptions={customOptions}
        compact={compact}
        onClose={closeModal}
        onToken={(token) => {
          toggleModal()
          onToken?.(token)
        }}
        onSearch={(search) => onSearch?.(search)}
      />
    </>
  )
}
