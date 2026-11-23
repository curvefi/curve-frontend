import { type ReactNode, useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import type { Token } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries } from '@primitives/objects.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { FormTokenInput } from '@ui/features/forms/controls/LargeTokenInput/FormTokenInput'
import type { LargeTokenInputProps } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInput'
import type { FormControl } from '@ui/features/forms/useFormValidation'
import { q, type QueryProp } from '@ui/features/queries/util'
import { LlamaIcon } from '@ui/icons/LlamaIcon'
import { decimal } from '@ui/lib/decimal'
import type { FieldName } from '@ui/lib/validation/types'

type WalletBalanceProps = NonNullable<LargeTokenInputProps['walletBalance']>

export type LoanFormTokenInputProps<
  TForm extends FormControl<Record<TFieldName, Decimal | undefined>>,
  TFieldName extends string,
  TMaxFieldName extends FieldName<TForm['formState']['errors']>,
> = {
  label: string
  token: Token | undefined
  blockchainId: INetworkName | undefined
  /**
   * Optional max-value query for this field, including loading and error state.
   * When present, it also carries an optional related max-field name whose errors should be reflected here.
   */
  max?: QueryProp<Decimal> & { fieldName: TMaxFieldName; onMax?: () => void }
  name: TFieldName
  form: TForm
  testId: string
  message?: LargeTokenInputProps['message']
  maxMessage?: ReactNode
  /**
   * Optional, displays the position balance instead of the wallet balance.
   */
  positionBalance?: { position: QueryProp<Decimal>; tooltip?: WalletBalanceProps['tooltip'] }
  /**
   * The network of the token.
   */
  network: LlamaNetwork
  tokenSelector?: ReactNode
  hideBalance?: boolean
  /**
   * Optional callback when the value changes (from user typing or clicking chips).
   * Called after the form value is set.
   */
  onValueChange?: (value: Decimal | undefined) => void
  disabled?: boolean
}

/**
 * A large token input field for loan forms, with balance and max handling.
 */
export const LoanFormTokenInput = <
  TForm extends FormControl<Record<TFieldName, Decimal | undefined>>,
  TFieldName extends string,
  TMaxFieldName extends FieldName<TForm['formState']['errors']>,
>({
  label,
  token,
  blockchainId,
  name,
  max,
  form: { values, update: updateForm, formState },
  testId,
  message,
  maxMessage,
  network,
  positionBalance,
  tokenSelector,
  hideBalance,
  onValueChange,
  disabled,
}: LoanFormTokenInputProps<TForm, TFieldName, TMaxFieldName>) => {
  const { address: userAddress } = useConnection()
  const {
    data: balance,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useTokenBalance({ chainId: network?.chainId, userAddress, tokenAddress: token?.address })
  const { data: usdRate } = useTokenUsdRate({ chainId: network?.chainId, tokenAddress: token?.address })

  const { position, tooltip } = positionBalance ?? {}
  const walletBalance = useMemo(
    // todo: support separate isLoading for balance and for maxBalance in LargeTokenInput
    () => ({
      balance: position ? position.data : balance,
      symbol: token?.symbol,
      loading: position?.isLoading ?? isBalanceLoading,
      usdRate,
      tooltip,
      prefix: position && LlamaIcon,
    }),
    [balance, isBalanceLoading, token?.symbol, usdRate, tooltip, position],
  )

  const value = values[name]

  const onBalance = useCallback(
    (v?: Decimal) => {
      if (v && max?.onMax && v === max.data) return max.onMax()
      updateForm(fromEntries([[name, v]]))
      onValueChange?.(v)
    },
    [max, name, onValueChange, updateForm],
  )
  return (
    <FormTokenInput
      form={{ values, formState }}
      name={name}
      label={label}
      testId={testId}
      tokenSelector={
        tokenSelector ?? (
          <TokenLabel blockchainId={blockchainId} tooltip={token?.symbol} token={token} label={token?.symbol ?? '?'} />
        )
      }
      balance={q({ data: value, isLoading: value == null, error: balanceError })}
      onBalance={onBalance}
      {...(!hideBalance && { walletBalance })}
      {...(max && { relatedFields: [max.fieldName] })}
      max={max && { balance: max, chips: 'range', onMax: max.onMax }}
      inputBalanceUsd={decimal(usdRate && usdRate * +(value ?? 0))}
      message={message ?? maxMessage}
      disabled={disabled}
    />
  )
}
