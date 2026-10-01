import type { ReactNode } from 'react'
import type { Chain } from '@curvefi/prices-api'
import type { Token } from '@primitives/address.utils'
import { formatNumber } from '@primitives/number.utils'
import { TokenInfo } from '@ui/components/TokenInfo'
import { formatToken } from '@ui/lib/tokens'

export const LlammaTokenAmount = ({
  amount,
  blockchainId,
  secondary,
  showSymbol = false,
  token,
}: {
  amount: number
  blockchainId: Chain
  secondary?: ReactNode
  showSymbol?: boolean
  token: Token | undefined
}) =>
  token && (
    <TokenInfo
      address={token.address}
      blockchainId={blockchainId}
      iconPosition="right"
      iconSize="mui-md"
      primary={showSymbol ? formatToken(amount, token.symbol, 'amount') : formatNumber(amount, 'token.amount')}
      secondary={secondary}
    />
  )
