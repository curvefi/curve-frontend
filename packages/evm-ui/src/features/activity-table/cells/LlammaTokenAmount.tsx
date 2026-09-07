import type { Chain } from '@curvefi/prices-api'
import { formatNumber } from '@evm-ui/utils'
import type { Token } from '@primitives/address.utils'
import { TokenInfo } from '@ui/components/TokenInfo'

export const LlammaTokenAmount = ({
  amount,
  blockchainId,
  token,
}: {
  amount: number
  blockchainId: Chain
  token: Token | undefined
}) =>
  token && (
    <TokenInfo
      address={token.address}
      blockchainId={blockchainId}
      iconPosition="right"
      iconSize="mui-md"
      primary={formatNumber(amount, { abbreviate: false })}
    />
  )
