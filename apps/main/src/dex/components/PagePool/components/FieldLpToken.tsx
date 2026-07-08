import { useCallback } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { mapQuery, q, type QueryProp } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'

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
