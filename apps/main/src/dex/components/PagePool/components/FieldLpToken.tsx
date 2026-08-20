import { useCallback } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@evm-ui/lib/i18n'
import { LargeTokenInput } from '@evm-ui/shared/ui/LargeTokenInput'
import { mapQuery, q, type QueryProp } from '@evm-ui/types/util'
import { decimal } from '@evm-ui/utils'

export const FieldLpToken = ({
  amount,
  balance,
  disabled,
  isNotEnough,
  handleAmountChange,
}: {
  amount: string
  balance: QueryProp<string>
  disabled?: boolean
  isNotEnough: boolean
  handleAmountChange: (val: string) => void
}) => (
  <LargeTokenInput
    name="lpTokens"
    disabled={disabled}
    walletBalance={{ balance: mapQuery(balance, decimal), symbol: t`LP Tokens` }}
    balance={q({
      data: decimal(amount),
      isLoading: false,
      error: isNotEnough ? new Error(t`Not enough LP Tokens`) : null,
    })}
    onBalance={useCallback((val?: Decimal) => handleAmountChange(val ?? ''), [handleAmountChange])}
  />
)
