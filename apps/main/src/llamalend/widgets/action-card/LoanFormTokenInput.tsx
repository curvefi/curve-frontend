import { type ReactNode, useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { getAddressOrPair } from '@/llamalend/llama.utils'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import { useTokenBalance } from '@evm-ui/hooks/useTokenBalance'
import { useTokenUsdRate } from '@evm-ui/queries/token-usd-rate.query'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { TokenLabel } from '@ui/components/TokenLabel'
import { FieldPathByValue, FieldValues, type FormUpdates, UseFormReturn } from '@ui/features/forms'
import { FormTokenInput } from '@ui/features/forms/controls/LargeTokenInput/FormTokenInput'
import type { LargeTokenInputProps } from '@ui/features/forms/controls/LargeTokenInput/LargeTokenInput'
import { q, type QueryProp } from '@ui/features/queries/util'
import { LlamaIcon } from '@ui/icons/LlamaIcon'
import { decimal } from '@ui/lib/decimal'

type WalletBalanceProps = NonNullable<LargeTokenInputProps['walletBalance']>

export type LoanFormTokenInputProps<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, Decimal | undefined>,
  TMaxFieldName extends FieldPathByValue<TFieldValues, Decimal | undefined>,
> = {
  label: string
  token: { address: Address; symbol?: string } | undefined
  blockchainId: INetworkName | undefined
  /**
   * Optional max-value query for this field, including loading and error state.
   * When present, it also carries an optional related max-field name whose errors should be reflected here.
   */
  max?: QueryProp<Decimal> & { fieldName: TMaxFieldName; onMax?: () => void }
  name: TFieldName
  form: UseFormReturn<TFieldValues> // the form, used to set the value and get errors
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
  TFieldValues extends FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, Decimal | undefined>,
  TMaxFieldName extends FieldPathByValue<TFieldValues, Decimal | undefined>,
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
}: LoanFormTokenInputProps<TFieldValues, TFieldName, TMaxFieldName>) => {
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
      balance: position?.data ?? balance,
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
      updateForm({ [name]: v } as FormUpdates<TFieldValues>)
      onValueChange?.(v)
    },
    [name, onValueChange, updateForm],
  )
  return (
    <FormTokenInput
      form={{ values, formState }}
      name={name}
      label={label}
      testId={testId}
      tokenSelector={
        tokenSelector ?? (
          <TokenLabel
            blockchainId={blockchainId}
            tooltip={token?.symbol}
            address={getAddressOrPair(blockchainId, token?.address) ?? null}
            label={token?.symbol ?? '?'}
          />
        )
      }
      balance={q({ data: value, isLoading: value == null, error: balanceError })}
      onBalance={onBalance}
      {...(!hideBalance && { walletBalance })}
      max={max && { balance: max, field: max.fieldName, chips: 'range', onMax: max.onMax }}
      inputBalanceUsd={decimal(usdRate && usdRate * +(value ?? 0))}
      message={message ?? maxMessage}
      disabled={disabled}
    />
  )
}
