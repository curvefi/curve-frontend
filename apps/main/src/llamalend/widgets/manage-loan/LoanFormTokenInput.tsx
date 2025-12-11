import { type ReactNode, useCallback, useMemo } from 'react'
import type { FieldPath, FieldPathValue, FieldValues, UseFormReturn } from 'react-hook-form'
import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import { setValueOptions } from '@/llamalend/features/borrow/react-form.utils'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { PartialRecord } from '@curvefi/prices-api/objects.util'
import { useTokenBalance } from '@ui-kit/queries/token-balance.query'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import type { Query } from '@ui-kit/types/util'
import { Decimal } from '@ui-kit/utils'

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
  form,
  testId,
  message,
  network,
}: {
  label: string
  token: { address: Address; symbol?: string } | undefined
  blockchainId: INetworkName | undefined
  /**
   * Optional max-value query for this field, including loading and error state.
   * When present, it also carries an optional related max-field name whose errors should be reflected here.
   */
  max?: Query<Decimal> & { fieldName?: TMaxFieldName }
  name: TFieldName
  form: UseFormReturn<TFieldValues> // the form, used to set the value and get errors
  testId: string
  message?: ReactNode
  network: LlamaNetwork
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
    tokenSymbol: token?.symbol,
  })

  const errors = form.formState.errors as PartialRecord<FieldPath<TFieldValues>, Error>
  const relatedMaxFieldError = max?.fieldName && errors[max.fieldName]
  const error = errors[name] || max?.error || balanceError || relatedMaxFieldError
  return (
    <LargeTokenInput
      name={name}
      label={label}
      testId={testId}
      tokenSelector={
        <TokenLabel
          blockchainId={blockchainId}
          tooltip={token?.symbol}
          address={token?.address ?? null}
          label={token?.symbol ?? '?'}
        />
      }
      balance={form.getValues(name)}
      onBalance={useCallback(
        (v?: Decimal) => form.setValue(name, v as FieldPathValue<TFieldValues, TFieldName>, setValueOptions),
        [form, name],
      )}
      isError={!!error}
      message={error?.message ?? message}
      walletBalance={useMemo(
        // todo: support separate isLoading for balance and for maxBalance in LargeTokenInput
        () => ({ balance, symbol: token?.symbol, loading: isBalanceLoading }),
        [balance, isBalanceLoading, token?.symbol],
      )}
      maxBalance={useMemo(() => max && { balance: max.data, chips: 'max' }, [max])}
    />
  )
}
