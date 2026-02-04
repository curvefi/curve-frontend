import { t } from '@ui-kit/lib/i18n'
import { HelperMessage, LargeTokenInput, type LargeTokenInputProps } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

export type BridgeAmountProps = {
  disabled: boolean
  amount: LargeTokenInputProps['balance']
  onAmount: NonNullable<LargeTokenInputProps['onBalance']>
  walletBalance: Pick<NonNullable<LargeTokenInputProps['walletBalance']>, 'balance' | 'loading'>
  inputBalanceUsd: LargeTokenInputProps['inputBalanceUsd']
  error?: Error | null
}

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
    {error?.message && <HelperMessage message={error.message} isError />}
  </LargeTokenInput>
)
