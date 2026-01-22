import { type ReactNode, useCallback, useMemo } from 'react'
import type { FieldPath, FieldPathValue, FieldValues, UseFormReturn } from 'react-hook-form'
import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { PartialRecord } from '@curvefi/prices-api/objects.util'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { HelperMessage, LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import type { ChipsPreset, LargeTokenInputProps } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import type { Query } from '@ui-kit/types/util'
import { decimal, Decimal } from '@ui-kit/utils'
import { setValueOptions } from '@ui-kit/utils/react-form.utils'

type WalletBalanceProps = NonNullable<LargeTokenInputProps['walletBalance']>

/**
 * A large token input field for loan forms, with balance and max handling.
 */
export const LoanFormTokenInput = <
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
  TMaxFieldName extends FieldPath<TFieldValues>,
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
}: {
  label: string
  token: { address: Address; symbol?: string } | undefined
  blockchainId: INetworkName | undefined
  /**
   * Optional max-value query for this field, including loading and error state.
   * When present, it also carries an optional related max-field name whose errors should be reflected here.
   */
  max?: Query<Decimal> & { fieldName?: TMaxFieldName }
  maxType?: ChipsPreset
  name: TFieldName
  form: UseFormReturn<TFieldValues> // the form, used to set the value and get errors
  testId: string
  message?: ReactNode
  /**
   * Optional, displays the position balance instead of the wallet balance.
   */
  positionBalance?: {
    position: Query<Decimal>
    tooltip?: WalletBalanceProps['tooltip']
  }
  /**
   * The network of the token.
   */
  network: LlamaNetwork
  tokenSelector?: ReactNode
  hideBalance?: boolean
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
      tooltip: tooltip,
      prefix: position && LlamaIcon,
    }),
    [balance, isBalanceLoading, token?.symbol, usdRate, tooltip, position],
  )

  const errors = form.formState.errors as PartialRecord<FieldPath<TFieldValues>, Error>
  const maxFieldName = max?.fieldName
  const relatedMaxFieldError = max?.data && maxFieldName && errors[maxFieldName]
  const error = errors[name] || max?.error || balanceError || relatedMaxFieldError
  const value = form.getValues(name)
  const errorMessage = error?.message
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
      onBalance={useCallback(
        (v?: Decimal) => {
          form.setValue(name, v as FieldPathValue<TFieldValues, TFieldName>, setValueOptions)
          if (maxFieldName) void form.trigger(maxFieldName) // validate max field when balance changes
        },
        [form, maxFieldName, name],
      )}
      isError={!!error}
      walletBalance={!hideBalance ? walletBalance : undefined}
      maxBalance={useMemo(() => max && { balance: max.data, chips: maxType }, [max, maxType])}
      inputBalanceUsd={decimal(usdRate && usdRate * +(value ?? 0))}
    >
      {errorMessage ? <HelperMessage message={errorMessage} isError /> : message && <HelperMessage message={message} />}
    </LargeTokenInput>
  )
}
