import { SxProps } from '@mui/material'
import { useSwitch } from '@ui-kit/hooks/useSwitch'

import type { TokenOption } from '../types'
import { TokenSelectorModal, type TokenSelectorModalProps } from './modal/TokenSelectorModal'
import type { TokenListProps, TokenListCallbacks } from './modal/TokenList'
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
  compact = false,
  error = '',
  disabledTokens = [],
  disableSorting = false,
  customOptions,
  onToken,
  onSearch,
  sx,
}: Props) => {
  const [isOpen, , closeModal, toggleModal] = useSwitch()

  return (
    <>
      <TokenSelectButton token={selectedToken} disabled={disabled} onClick={toggleModal} sx={sx} />

      {isOpen && (
        <TokenSelectorModal
          tokens={tokens}
          balances={balances}
          tokenPrices={tokenPrices}
          favorites={favorites}
          showSearch={showSearch}
          showManageList={showManageList}
          isOpen={isOpen}
          compact={compact}
          error={error}
          disabledTokens={disabledTokens}
          disableSorting={disableSorting}
          customOptions={customOptions}
          onClose={closeModal}
          onToken={(token) => {
            toggleModal()
            onToken?.(token)
          }}
          onSearch={(search) => onSearch?.(search)}
        />
      )}
    </>
  )
}
