import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useMaxWithdrawTokenValues } from '@/llamalend/features/supply/hooks/useMaxWithdraw'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { useWithdrawMutation } from '@/llamalend/mutations/withdraw.mutation'
import {
  type WithdrawForm,
  withdrawFormValidationSuite,
  WithdrawParams,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useForm } from '@ui-kit/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { useFormErrors } from '@ui-kit/utils/react-form.utils'

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
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const { borrowToken } = market ? getTokens(market) : {}

  const form = useForm<WithdrawForm>({
    validation: withdrawFormValidationSuite,
    defaultValues: emptyWithdrawForm(),
  })

  const values = form.values
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
    error: withdrawError,
  } = useWithdrawMutation({ marketId, network, onReset: form.reset, userAddress })

  const { formState } = form

  const isPending = formState.isSubmitting || isWithdrawing

  return {
    form,
    values,
    params,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !formState.isValid || isPending || isDebouncing || isFull.isLoading,
    borrowToken,
    withdrawError,
    max,
    maxStakedShares,
    formErrors: useFormErrors(formState),
    isFull,
  }
}
