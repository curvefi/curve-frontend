import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { HelperMessage, LargeTokenInput, type LargeTokenInputProps } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { type QueryProp } from '@ui-kit/types/util'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

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
}

/** Token amount input for the FastBridge. Currently hardcoded to crvUSD as the only supported bridging token. */
export const BridgeAmount = ({ disabled, amount, onAmount, walletBalance, inputBalanceUsd }: BridgeAmountProps) => (
  <LargeTokenInput
    name="amount"
    label={t`Amount to send`}
    disabled={disabled}
    // For now FastBride only support bridging crvUSD
    tokenSelector={<TokenLabel blockchainId="ethereum" address={CRVUSD_ADDRESS} label="crvUSD" />}
    balance={amount}
    walletBalance={{ ...walletBalance, symbol: 'crvUSD' }}
    inputBalanceUsd={inputBalanceUsd}
    onBalance={onAmount}
  >
    {amount.error && <HelperMessage message={amount.error.message} isError />}
  </LargeTokenInput>
)
