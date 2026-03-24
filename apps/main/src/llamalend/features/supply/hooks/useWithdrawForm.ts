import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { useMaxWithdrawTokenValues } from '@/llamalend/features/supply/hooks/useMaxWithdraw'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { type WithdrawOptions, useWithdrawMutation } from '@/llamalend/mutations/withdraw.mutation'
import {
  withdrawFormValidationSuite,
  WithdrawParams,
  type WithdrawForm,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { useCallbackAfterFormUpdate, useFormErrors } from '@ui-kit/utils/react-form.utils'

const emptyWithdrawForm = (): WithdrawForm => ({
  withdrawAmount: undefined,
  maxWithdrawAmount: undefined,
  userVaultShares: undefined,
  isFull: false,
})

export const useWithdrawForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  onSuccess,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
  onSuccess?: NonNullable<WithdrawOptions['onSuccess']>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const { borrowToken } = market ? getTokens(market) : {}

  const form = useForm<WithdrawForm>({
    ...formDefaultOptions,
    resolver: vestResolver(withdrawFormValidationSuite),
    defaultValues: emptyWithdrawForm(),
  })

  const values = watchForm(form)
  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      (): WithdrawParams<ChainId> => ({
        chainId,
        marketId,
        userAddress,
        withdrawAmount: values.withdrawAmount,
        isFull: values.isFull,
        userVaultShares: values.userVaultShares,
      }),
      [chainId, marketId, userAddress, values.isFull, values.userVaultShares, values.withdrawAmount],
    ),
  )

  const { maxWithdrawAmount: max, maxStakedShares, isFull } = useMaxWithdrawTokenValues({ params, form }, enabled)

  const {
    onSubmit,
    isPending: isWithdrawing,
    isSuccess: isWithdrawn,
    error: withdrawError,
    data,
    reset: resetWithdraw,
  } = useWithdrawMutation({
    marketId,
    network,
    onSuccess,
    onReset: form.reset,
    userAddress,
  })

  const { formState } = form

  useCallbackAfterFormUpdate(form, resetWithdraw)

  const isPending = formState.isSubmitting || isWithdrawing

  return {
    form,
    values,
    params,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !formState.isValid || isPending || isDebouncing || isFull.isLoading,
    borrowToken,
    isWithdrawn,
    withdrawError,
    txHash: data?.hash,
    max,
    maxStakedShares,
    formErrors: useFormErrors(formState),
    isFull,
  }
}
