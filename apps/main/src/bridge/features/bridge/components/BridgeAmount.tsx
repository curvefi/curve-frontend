import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { HelperMessage, LargeTokenInput, type LargeTokenInputProps } from '@ui-kit/shared/ui/LargeTokenInput'
import { type QueryProp } from '@ui-kit/types/util'

export type BridgeAmountProps = {
  /** Whether the input is disabled (e.g. during a pending transaction or invalid form) */
  disabled: boolean
  /** The current bridge amount value */
  amount: QueryProp<Decimal>
  /** Callback invoked when the user changes the amount */
  onAmount: NonNullable<LargeTokenInputProps['onBalance']>
  /** Wallet balance of the current amount of tokens the user wants to bridge in their wallet */
  walletBalance: Pick<NonNullable<LargeTokenInputProps['walletBalance']>, 'balance'>
  /** USD equivalent of the entered amount, displayed as helper text. */
  inputBalanceUsd: LargeTokenInputProps['inputBalanceUsd']
  tokenSymbol: string
  tokenSelector: LargeTokenInputProps['tokenSelector']
}

/** Token amount input shared by the supported bridge providers. */
export const BridgeAmount = ({
  disabled,
  amount,
  onAmount,
  walletBalance,
  inputBalanceUsd,
  tokenSymbol,
  tokenSelector,
}: BridgeAmountProps) => (
  <LargeTokenInput
    name="amount"
    label={t`Amount to send`}
    disabled={disabled}
    tokenSelector={tokenSelector}
    balance={amount}
    walletBalance={{ ...walletBalance, symbol: tokenSymbol }}
    inputBalanceUsd={inputBalanceUsd}
    onBalance={onAmount}
  >
    {amount.error && <HelperMessage message={amount.error.message} isError />}
  </LargeTokenInput>
)
