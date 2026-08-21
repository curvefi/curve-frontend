import Box from '@mui/material/Box'
import type { UseFormReturn } from '@ui-kit/features/forms'
import { TokenList, type TokenOption, TokenSelector } from '@ui-kit/features/select-token'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { Chain, requireBlockchainId } from '@ui-kit/utils'
import { BRIDGE_TOKENS, LAYERZERO_TOKENS, type LayerZeroToken } from '../layerzero'
import type { BridgeFormValues } from '../types'

type BridgeTokenOption = TokenOption & { symbol: LayerZeroToken }

const TOKENS: BridgeTokenOption[] = BRIDGE_TOKENS.map(symbol => ({
  address: LAYERZERO_TOKENS[symbol],
  chain: requireBlockchainId(Chain.Ethereum),
  symbol,
}))

export const BridgeTokenSelector = ({
  form,
  token,
  disabled,
}: {
  form: UseFormReturn<BridgeFormValues>
  token: LayerZeroToken
  disabled: boolean
}) => {
  const [isOpen, open, close] = useSwitch(false)
  const selectedToken = TOKENS.find(option => option.symbol === token)

  return (
    <Box data-testid="bridge-token-select">
      <TokenSelector selectedToken={selectedToken} disabled={disabled} isOpen={isOpen} onOpen={open} onClose={close}>
        <TokenList
          tokens={TOKENS}
          disableMyTokens
          disableSorting
          onToken={option => {
            const selectedToken = BRIDGE_TOKENS.find(token => token === option.symbol)
            if (selectedToken) form.update({ token: selectedToken, amount: undefined })
          }}
        />
      </TokenSelector>
    </Box>
  )
}
