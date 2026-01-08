import { useCallback } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { decimal, type Decimal } from '@ui-kit/utils'

export const FieldLpToken = ({
  amount,
  balance,
  balanceLoading,
  disabled,
  hasError,
  handleAmountChange,
}: {
  amount: string
  balance: string
  balanceLoading: boolean
  disabled?: boolean
  hasError: boolean
  handleAmountChange: (val: string) => void
}) => (
  <LargeTokenInput
    name="lpTokens"
    disabled={disabled}
    isError={hasError}
    walletBalance={{
      balance: decimal(balance),
      symbol: t`LP Tokens`,
      loading: balanceLoading,
    }}
    balance={decimal(amount)}
    onBalance={useCallback((val?: Decimal) => handleAmountChange(val ?? ''), [handleAmountChange])}
  />
)
