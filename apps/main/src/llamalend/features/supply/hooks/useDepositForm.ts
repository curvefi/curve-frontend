import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useMaxDepositTokenValues } from '@/llamalend/features/supply/hooks/useMaxDeposit'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { useDepositMutation } from '@/llamalend/mutations/deposit.mutation'
import { useDepositIsApproved } from '@/llamalend/queries/supply/supply-deposit-approved.query'
import {
  type DepositForm,
  depositFormValidationSuite,
  DepositParams,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useForm } from '@ui-kit/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { useFormErrors } from '@ui-kit/utils/react-form.utils'

const emptyDepositForm = (): DepositForm => ({ depositAmount: undefined, maxDepositAmount: undefined })

export const useDepositForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const { borrowToken } = market ? getTokens(market) : {}

  const form = useForm<DepositForm>({
    validation: depositFormValidationSuite,
    defaultValues: emptyDepositForm(),
  })

  const depositAmount = form.getValues('depositAmount')

  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      (): DepositParams<ChainId> => ({ chainId, marketId, userAddress, depositAmount }),
      [chainId, marketId, userAddress, depositAmount],
    ),
  )

  const {
    onSubmit,
    isPending: isDepositing,
    error: depositError,
  } = useDepositMutation({
    marketId,
    network,
    onReset: form.reset,
    userAddress,
  })

  const { formState } = form

  const isPending = formState.isSubmitting || isDepositing
  return {
    form,
    params,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !formState.isValid || isPending || isDebouncing,
    borrowToken,
    depositError,
    max: useMaxDepositTokenValues({ params, borrowToken: borrowToken?.address, form }, enabled),
    isApproved: useDepositIsApproved(params, enabled),
    formErrors: useFormErrors(formState),
  }
}
