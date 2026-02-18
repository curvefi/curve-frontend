import { t } from '@ui-kit/lib/i18n'
import { HelperMessage, LargeTokenInput, type LargeTokenInputProps } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

export type BridgeAmountProps = {
  /** Whether the input is disabled (e.g. during a pending transaction or invalid form) */
  disabled: boolean
  /** The current bridge amount value */
  amount: LargeTokenInputProps['balance']
  /** Callback invoked when the user changes the amount */
  onAmount: NonNullable<LargeTokenInputProps['onBalance']>
  /** Wallet balance of the current amount of tokens the user wants to bridge in their wallet */
  walletBalance: Pick<NonNullable<LargeTokenInputProps['walletBalance']>, 'balance' | 'loading'>
  /** USD equivalent of the entered amount, displayed as helper text. */
  inputBalanceUsd: LargeTokenInputProps['inputBalanceUsd']
  /** Optional error to display below the input. */
  error?: string | null
}

/** Token amount input for the FastBridge. Currently hardcoded to crvUSD as the only supported bridging token. */
export const BridgeAmount = ({
  disabled,
  amount,
  onAmount,
  walletBalance,
  inputBalanceUsd,
  error,
}: BridgeAmountProps) => (
  <LargeTokenInput
    name={'amount'}
    label={t`Amount to send`}
    disabled={disabled}
    // For now FastBride only support bridging crvUSD
    tokenSelector={<TokenLabel blockchainId="ethereum" address={CRVUSD_ADDRESS} label="crvUSD" />}
    balance={amount}
    walletBalance={{
      ...walletBalance,
      symbol: 'crvUSD',
    }}
    inputBalanceUsd={inputBalanceUsd}
    isError={!!error}
    onBalance={onAmount}
  >
    {error && <HelperMessage message={error} isError />}
  </LargeTokenInput>
)
