import type { ReactNode } from 'react'
import type { Chain } from '@curvefi/prices-api'
import type { Token } from '@primitives/address.utils'
import { formatNumber } from '@primitives/number.utils'
import { TokenInfo } from '@ui/components/TokenInfo'

export const LlammaTokenAmount = ({
  amount,
  blockchainId,
  notional,
  token,
}: {
  amount: number
  blockchainId: Chain
  notional?: ReactNode
  token: Token | undefined
}) =>
  token && (
    <TokenInfo
      address={token.address}
      blockchainId={blockchainId}
      iconPosition="right"
      iconSize="mui-md"
      primary={formatNumber(amount, 'token.amount')}
      secondary={notional}
    />
  )
