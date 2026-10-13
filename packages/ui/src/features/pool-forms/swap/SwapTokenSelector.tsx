import { shortenString } from '@primitives/string.utils'
import type { PoolToken } from '@ui/features/pool-forms/PoolTokenInput'
import { SwapTokenList } from '@ui/features/pool-forms/swap/SwapTokenList'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { TokenSelector } from '@ui/features/select-token/ui/TokenSelector'
import { useSwitch } from '@ui/hooks/useSwitch'

export function SwapTokenSelector({
  tokens,
  onToken,
  calculatedIndex,
  selectedIndex,
  disabled,
  label,
}: {
  tokens: QueryProp<PoolToken>[] | undefined
  selectedIndex: number
  disabled: boolean
  label: string
  calculatedIndex: number
  onToken: (index: number) => void
}) {
  const [isOpen, onOpen, onClose] = useSwitch(false)
  const options = tokens?.map(token =>
    mapQuery(token, token => ({
      ...token,
      symbol: token.symbol ?? shortenString(token.address),
      chain: token.blockchainId,
    })),
  )
  return (
    <TokenSelector
      selectedToken={options?.[selectedIndex]?.data}
      disabled={disabled || !tokens}
      title={label}
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      size="small"
    >
      <SwapTokenList tokens={options} calculatedIndex={calculatedIndex} onToken={onToken} />
    </TokenSelector>
  )
}
