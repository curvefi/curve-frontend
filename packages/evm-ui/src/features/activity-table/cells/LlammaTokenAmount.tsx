import type { ReactNode } from 'react'
import type { Chain } from '@curvefi/prices-api'
import { formatNumber } from '@primitives/number.utils'
import type { IconToken } from '@ui/components/TokenIcon'
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
  token: IconToken | undefined
}) =>
  token && (
    <TokenInfo
      token={token}
      blockchainId={blockchainId}
      iconPosition="right"
      iconSize="mui-md"
      primary={formatNumber(amount, 'token.amount')}
      secondary={notional}
    />
  )
