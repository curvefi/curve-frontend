import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { type WithdrawOptions, useWithdrawMutation } from '@/llamalend/mutations/withdraw.mutation'
import { useUserVaultSharesToAssetsAmount } from '@/llamalend/queries/supply/supply-user-vault-amounts'
import {
  withdrawFormValidationSuite,
  WithdrawParams,
  type WithdrawForm,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { setValueOptions, useFormErrors } from '@ui-kit/utils/react-form.utils'

const useCallbackAfterFormUpdate = (form: UseFormReturn<WithdrawForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

const emptyWithdrawForm = (): WithdrawForm => ({
  withdrawAmount: undefined,
  maxWithdrawAmount: undefined,
})

export const useWithdrawForm = <ChainId extends LlamaChainId>({
  market,
  network,
  onWithdrawn,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
  onWithdrawn?: NonNullable<WithdrawOptions['onWithdrawn']>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const { borrowToken } = market ? getTokens(market) : {}

  const maxUserWithdraw = useUserVaultSharesToAssetsAmount({ chainId, marketId, userAddress })

  const form = useForm<WithdrawForm>({
    ...formDefaultOptions,
    resolver: vestResolver(withdrawFormValidationSuite),
    defaultValues: emptyWithdrawForm(),
  })

  const values = watchForm(form)

  const params = useDebouncedValue(
    useMemo(
      (): WithdrawParams<ChainId> => ({
        chainId,
        marketId,
        userAddress,
        withdrawAmount: values.withdrawAmount,
      }),
      [chainId, marketId, userAddress, values.withdrawAmount],
    ),
  )

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
    onWithdrawn,
    onReset: form.reset,
    userAddress,
  })

  const { formState } = form

  useCallbackAfterFormUpdate(form, resetWithdraw)

  useEffect(() => {
    form.setValue('maxWithdrawAmount', maxUserWithdraw.data, setValueOptions)
  }, [form, maxUserWithdraw.data])

  return {
    form,
    values,
    params,
    isPending: formState.isSubmitting || isWithdrawing,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !formState.isValid,
    borrowToken,
    isWithdrawn,
    withdrawError,
    txHash: data?.hash,
    max: maxUserWithdraw,
    formErrors: useFormErrors(formState),
  }
}
