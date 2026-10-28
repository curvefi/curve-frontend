import { shortenString } from '@primitives/string.utils'
import type { PoolToken } from '@ui/features/pool-forms/PoolTokenInput'
import { PoolTokenList } from '@ui/features/pool-forms/PoolTokenList'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { TokenSelector } from '@ui/features/select-token/ui/TokenSelector'
import { useSwitch } from '@ui/hooks/useSwitch'

export function PoolTokenSelector({
  tokens,
  onToken,
  excludedIndex,
  selectedIndex,
  disabled,
  label,
  testId,
}: {
  tokens: QueryProp<PoolToken>[] | undefined
  selectedIndex: number
  disabled: boolean
  label: string
  excludedIndex?: number
  testId?: string
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
      testId={testId}
    >
      <PoolTokenList
        tokens={options}
        excludedIndex={excludedIndex}
        onToken={index => index !== selectedIndex && onToken(index)}
      />
    </TokenSelector>
  )
}
