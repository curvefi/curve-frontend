import { SxProps } from '@mui/material'
import { type TokenOption, tokenOptionEquals } from '../types'
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
    /** Whether the modal is open - controlled by parent */
    isOpen: boolean
    /** Callback to open/close modal */
    onOpen: () => void
    /** Callback to close modal */
    onClose: () => void
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
  isOpen,
  onToken,
  onSearch,
  onOpen,
  onClose,
  sx,
}: Props) => (
  <>
    <TokenSelectButton token={selectedToken} disabled={disabled} onClick={onOpen} sx={sx} />
    <TokenSelectorModal
      tokens={tokens}
      balances={balances}
      tokenPrices={tokenPrices}
      favorites={favorites}
      showSearch={showSearch}
      showManageList={showManageList}
      isOpen={isOpen}
      error={error}
      disabledTokens={disabledTokens}
      disableSorting={disableSorting}
      disableMyTokens={disableMyTokens}
      customOptions={customOptions}
      compact={compact}
      onClose={onClose}
      onToken={(token) => {
        onClose()

        if (!tokenOptionEquals(token, selectedToken)) {
          onToken?.(token)
        }
      }}
      onSearch={(search) => onSearch?.(search)}
    />
  </>
)
