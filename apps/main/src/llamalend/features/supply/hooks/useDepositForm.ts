import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { type DepositOptions, useDepositMutation } from '@/llamalend/mutations/deposit.mutation'
import { useDepositIsApproved } from '@/llamalend/queries/supply/supply-deposit-approved.query'
import {
  depositFormValidationSuite,
  DepositParams,
  type DepositForm,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { useTokenBalance } from '@ui-kit/hooks/useTokenBalance'
import { formDefaultOptions, watchField } from '@ui-kit/lib/model'
import { updateForm, useCallbackAfterFormUpdate, useFormErrors } from '@ui-kit/utils/react-form.utils'

const emptyDepositForm = (): DepositForm => ({
  depositAmount: undefined,
  maxDepositAmount: undefined,
})

export const useDepositForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  onDeposited,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
  onDeposited?: NonNullable<DepositOptions['onDeposited']>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const { borrowToken } = market ? getTokens(market) : {}

  const maxUserDeposit = useTokenBalance({
    chainId,
    userAddress,
    tokenAddress: borrowToken?.address,
  })

  const form = useForm<DepositForm>({
    ...formDefaultOptions,
    resolver: vestResolver(depositFormValidationSuite),
    defaultValues: emptyDepositForm(),
  })

  const depositAmount = watchField(form, 'depositAmount')

  const params = useDebouncedValue(
    useMemo(
      (): DepositParams<ChainId> => ({
        chainId,
        marketId,
        userAddress,
        depositAmount,
      }),
      [chainId, marketId, userAddress, depositAmount],
    ),
  )

  const {
    onSubmit,
    isPending: isDepositing,
    isSuccess: isDeposited,
    error: depositError,
    data,
    reset: resetDeposit,
  } = useDepositMutation({
    marketId,
    network,
    onDeposited,
    onReset: form.reset,
    userAddress,
  })

  const { formState } = form

  useCallbackAfterFormUpdate(form, resetDeposit)

  useEffect(() => {
    updateForm(form, { maxDepositAmount: maxUserDeposit.data })
  }, [form, maxUserDeposit.data])

  const isPending = formState.isSubmitting || isDepositing
  return {
    form,
    params,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !formState.isValid || isPending,
    borrowToken,
    isDeposited,
    depositError,
    txHash: data?.hash,
    max: maxUserDeposit,
    isApproved: useDepositIsApproved(params, enabled),
    formErrors: useFormErrors(formState),
  }
}
