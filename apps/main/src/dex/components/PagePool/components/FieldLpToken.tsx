import { useCallback } from 'react'
import { InputDebounced, InputMaxBtn, InputProvider } from '@ui/InputComp'
import { formatNumber } from '@ui/utils'
import { useLegacyTokenInput } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { decimal, type Decimal } from '@ui-kit/utils'

export const FieldLpToken = ({
  amount,
  balance,
  balanceLoading,
  disabled,
  hasError,
  haveSigner,
  handleAmountChange,
}: {
  amount: string
  balance: string
  balanceLoading: boolean
  disabled?: boolean
  hasError: boolean
  haveSigner: boolean
  handleAmountChange: (val: string) => void
}) => {
  const onBalance = useCallback((val?: Decimal) => handleAmountChange(val ?? ''), [handleAmountChange])

  const onMax = useCallback(() => handleAmountChange(balance), [handleAmountChange, balance])

  return useLegacyTokenInput() ? (
    <InputProvider
      id="lpTokens"
      grid
      gridTemplateColumns="1fr auto"
      disabled={disabled}
      inputVariant={hasError ? 'error' : undefined}
      padding="var(--spacing-1) var(--spacing-2)"
    >
      <InputDebounced
        id="inp-lp-tokens"
        autoComplete="off"
        type="number"
        labelProps={{
          label: haveSigner ? t`LP Tokens Avail.` : t`LP Tokens`,
          descriptionLoading: haveSigner ? balanceLoading : false,
          description: haveSigner ? formatNumber(balance) : '',
        }}
        value={typeof amount === 'undefined' ? '' : amount}
        onChange={handleAmountChange}
      />
      {balance && <InputMaxBtn disabled={disabled} onClick={onMax} />}
    </InputProvider>
  ) : (
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
      onBalance={onBalance}
    />
  )
}
