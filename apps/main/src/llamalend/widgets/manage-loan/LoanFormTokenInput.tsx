import { type ReactNode, useCallback, useMemo } from 'react'
import type { FieldPath, FieldPathValue, FieldValues, UseFormReturn } from 'react-hook-form'
import type { Address } from 'viem'
import { useAccount } from 'wagmi'
import { setValueOptions } from '@/llamalend/features/borrow/react-form.utils'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { PartialRecord } from '@curvefi/prices-api/objects.util'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { LargeTokenInput } from '@ui-kit/shared/ui/LargeTokenInput'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { Decimal } from '@ui-kit/utils'

/**
 * A large token input field for loan forms, with balance and max handling.
 */
export const LoanFormTokenInput = <TFieldValues extends FieldValues, TFieldName extends FieldPath<TFieldValues>>({
  label,
  token,
  blockchainId,
  name,
  max,
  isLoading: isMaxLoading,
  isError,
  form,
  testId,
  message,
  network,
  maxFieldName,
}: {
  label: string
  token: { address: Address; symbol?: string } | undefined
  blockchainId: INetworkName | undefined
  isError: boolean
  isLoading: boolean
  max: Decimal | undefined
  name: TFieldName
  form: UseFormReturn<TFieldValues> // the form, used to set the value and get errors
  testId: string
  message?: ReactNode
  network: LlamaNetwork
  /** Optional related max-field name whose errors should be reflected here */
  maxFieldName?: FieldPath<TFieldValues>
}) => {
  const { address: userAddress } = useAccount()
  const {
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useTokenBalance({ chainId: network?.chainId, userAddress }, token)

  const errors = form.formState.errors as PartialRecord<FieldPath<TFieldValues>, Error>
  const relatedMaxFieldError = maxFieldName && errors[maxFieldName]

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
      onBalance={useCallback(
        (v?: Decimal) => form.setValue(name, v as FieldPathValue<TFieldValues, TFieldName>, setValueOptions),
        [form, name],
      )}
      isError={isError || isBalanceError || !!errors[name] || !!relatedMaxFieldError}
      message={errors[name]?.message ?? relatedMaxFieldError?.message ?? message}
      walletBalance={useMemo(
        // todo: separate isLoading for balance and for maxBalance
        () => ({ balance, symbol: token?.symbol, loading: isBalanceLoading || isMaxLoading }),
        [balance, isMaxLoading, isBalanceLoading, token?.symbol],
      )}
      maxBalance={useMemo(() => ({ balance: max, chips: 'max' }), [max])}
    />
  )
}
