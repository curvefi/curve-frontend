import { type ReactNode, useCallback, useMemo } from 'react'
import type { FieldPath, FieldPathByValue, FieldValues, UseFormReturn } from 'react-hook-form'
import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { PartialRecord } from '@primitives/objects.utils'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import type { ChipsPreset, LargeTokenInputProps } from '@ui-kit/shared/ui/LargeTokenInput'
import { HelperMessage, LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import type { QueryProp } from '@ui-kit/types/util'
import { decimal, Decimal } from '@ui-kit/utils'
import { type FormUpdates, updateForm } from '@ui-kit/utils/react-form.utils'

type WalletBalanceProps = NonNullable<LargeTokenInputProps['walletBalance']>

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
  maxType = 'max',
  form,
  testId,
  message,
  network,
  positionBalance,
  tokenSelector,
  hideBalance,
  onValueChange,
}: {
  label: string
  token: { address: Address; symbol?: string } | undefined
  blockchainId: INetworkName | undefined
  /**
   * Optional max-value query for this field, including loading and error state.
   * When present, it also carries an optional related max-field name whose errors should be reflected here.
   */
  max?: QueryProp<Decimal> & { fieldName?: TMaxFieldName }
  maxType?: ChipsPreset
  name: TFieldName
  form: UseFormReturn<TFieldValues> // the form, used to set the value and get errors
  testId: string
  message?: ReactNode
  /**
   * Optional, displays the position balance instead of the wallet balance.
   */
  positionBalance?: {
    position: QueryProp<Decimal>
    tooltip?: WalletBalanceProps['tooltip']
  }
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
}) => {
  const { address: userAddress } = useConnection()
  const {
    data: balance,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useTokenBalance({
    chainId: network?.chainId,
    userAddress,
    tokenAddress: token?.address,
  })
  const { data: usdRate } = useTokenUsdRate({
    chainId: network?.chainId,
    tokenAddress: token?.address,
  })

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

  const errors = form.formState.errors as PartialRecord<FieldPath<TFieldValues>, Error>
  const maxFieldName = max?.fieldName
  const relatedMaxFieldError = max?.data && maxFieldName && errors[maxFieldName]
  const error =
    (name in form.formState.touchedFields && errors[name]) || max?.error || balanceError || relatedMaxFieldError
  const value = form.getValues(name)
  const errorMessage = error?.message
  const onBalance = useCallback(
    (v?: Decimal) => {
      updateForm(form, { [name]: v } as FormUpdates<TFieldValues>)
      onValueChange?.(v)
    },
    [form, name, onValueChange],
  )
  return (
    <LargeTokenInput
      name={name}
      label={label}
      testId={testId}
      tokenSelector={
        tokenSelector ?? (
          <TokenLabel
            blockchainId={blockchainId}
            tooltip={token?.symbol}
            address={token?.address ?? null}
            label={token?.symbol ?? '?'}
          />
        )
      }
      balance={value}
      onBalance={onBalance}
      isError={!!error}
      {...(!hideBalance && { walletBalance })}
      maxBalance={max && { balance: max.data, chips: maxType, isLoading: max.isLoading }}
      inputBalanceUsd={decimal(usdRate && usdRate * +(value ?? 0))}
    >
      {errorMessage ? (
        <HelperMessage message={errorMessage} onNumberClick={onBalance} isError />
      ) : (
        message && <HelperMessage onNumberClick={onBalance} message={message} />
      )}
    </LargeTokenInput>
  )
}
